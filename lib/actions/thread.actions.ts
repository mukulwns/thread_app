
"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";
import { connectToDb } from "../mongoose";
import { string } from "zod";

interface Params {
  text: string;
  author: string;
  communityId?: string|null;
  path: string;  //if not provided it will be a public thread
}
export async function createThread({ text, author, communityId, path }: Params) {
  try {
    connectToDb();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      author,
      community: null, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber=1,pageSize=20){
connectToDb()
//clculate the no of post to skip
const skipAmount=(pageNumber-1)*pageSize
//fethc the post that have no parent (top level post)
const postQuery=Thread.find({parentId:{$in:[null,undefined]}})
.sort({createdAt:"desc"})
.skip(skipAmount)
.populate({
  path:"author",
  model:User
})
.populate({
  path:"community",
  model:Community
})
.populate({
path:"children",
populate:{
  path:"author",
  model:User,
  select:"_id name parentId image"
},
})
const totalPostCount=await Thread.countDocuments({parentId:{$in:[null||undefined]},})
const posts=await postQuery.exec()
const isNext=totalPostCount>skipAmount+posts.length
return{posts,isNext}
}

//count the totl no of toplevelpost

export async function fetchThreadById(id:string){
  connectToDb();
try{
  const thread=await Thread.findById(id)
  .populate({
    path:'author',
    model:User,
    select:'id _id name image'
  })
  .populate({
    path:'children',
    populate:[
      {
        path:'author',
        model:User,
        select:'_id id name parentId image'
      },
      {
        path:'children',
        model:Thread,
        populate:{
          path:'author',
          model:User,
          select:'name parentId image'
        }
      }
    ]
  }).exec()
  return thread;
}
catch(error:any){
  throw new Error(`Error fetching thread:${error.message}`);
}
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}


export async function deleteThread(id:string,path:string):Promise<void>{
  try{
    connectToDb()
const mainThread=await Thread.findById(id).populate("author community")
if(!mainThread){
  throw new Error('No such thread found')
}

const descendentThreads=await fetchAllChildThreads(id)
const descendentThreadsIds=[
  id,
  ...descendentThreads.map((thread)=>thread._id)
]
const uniqueAuthorIds=new Set([
  ...descendentThreads.map((thread)=>thread.author?._id?.toString()),
  mainThread.author?._id?.toString()
].filter((id)=>id!==undefined))

const uniqueCommunityIds = new Set(
  [
    ...descendentThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
    mainThread.community?._id?.toString(),
  ].filter((id) => id !== undefined)
);

  // Recursively delete child threads and their descendants
  await Thread.deleteMany({ _id: { $in: descendentThreadsIds } });

  // Update User model
  await User.updateMany(
    { _id: { $in: Array.from(uniqueAuthorIds) } },
    { $pull: { threads: { $in: descendentThreadsIds } } }
  );
   // Update Community model
   await Community.updateMany(
    { _id: { $in: Array.from(uniqueCommunityIds) } },
    { $pull: { threads: { $in: descendentThreadsIds } } }
  );

  revalidatePath(path);
  }
  catch(error:any){
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function addCommentToThread
(threadId:string,
 commentText:string,
 userId:string,
 path:string, 
){
connectToDb();
try{
  const originalThread=await Thread.findById(threadId);
  if(!originalThread){throw new Error("Thread not found")}
  // Create a new Comment object with the given text content for this user on that thread
  const commentThread=new Thread({
    text:commentText,
    author:userId,
    parentId:threadId,
  })
  const saveCommenThread=await commentThread.save()
  // Add the newly created comment's ID as an element in its parent's comments array field
  originalThread.children.push(saveCommenThread._id)
  // Save updated thread data back into DB
  await originalThread.save()
  revalidatePath(path)
}
catch(error){
  console.error("Error while adding comment:", error);
    throw new Error("Unable to add comment");
}
}