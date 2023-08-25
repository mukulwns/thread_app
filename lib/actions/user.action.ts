"use server";

import { Regex } from "lucide-react";
import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDb } from "../mongoose";
interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  await connectToDb();
  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );
    if (path == "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    console.log(`Failed to create/update user:${error.message}`); //TODO handle error
  }
}
export async function fetchUser(userId: string) {
  try {
    await connectToDb();
    return await User.findOne({ id: userId });
    // .populate({path:"communities" ,model:Community})
  } catch (err) {
    console.log("Error connecting to db", err);
  }
}
export async function fetchUserPost(userId: string) {
  try {
    connectToDb();
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });
    return threads;
  } catch (error) {
    console.log("failed to get post:", error);
  }
}
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDb();
    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");
    const query: FilterQuery<typeof User> = { id: { $ne: userId } };
    if(searchString.trim()!==''){
        query.$or=[
            { name:{$regex : regex}},
            { username:{$regex : regex}}
        ]
    }
    const sortOptions={createdAt:sortBy};
    const usersQuery=User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize)
    const totalUsersCount=await User.countDocuments(query)
    const users=await usersQuery.exec()
    const isNext=totalUsersCount>skipAmount+users.length;
    return{isNext ,users}

  } catch (error:any) {
    console.log('Error in fetching user',error )
    throw error;
  }
}

export async function getActivity(userId:string){
  try{
connectToDb()
   const userThreads=await Thread.find({author:userId})
   const childrenThreads=userThreads.reduce((acc,userThread)=>{
    return acc.concat(userThread.children)
   },[])
   const replies=await Thread.find({
    _id:{$in:childrenThreads},
    author:{$ne:userId}
   }).populate({
    path:'author',
    model:User,
    select:"name image _id"
   })
   return replies
  }
  catch(error:any){
   throw new Error(`Failed to fetch activity :${error.message}`)
  }
}
