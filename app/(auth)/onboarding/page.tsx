import AccountProfile from '@/components/forms/AccountProfile'
import { fetchUser } from '@/lib/actions/user.action';
import { currentUser } from '@clerk/nextjs'
import { redirect } from "next/navigation";
export default async function Page() {
    const user=await currentUser()
    if (!user) return null;
   
  const userInfo = await fetchUser(user.id);
    if (userInfo?.onboarded) redirect("/");
    const userData={
        id:user.id,
        objectId: userInfo?._id,
        username: userInfo?userInfo?.username :user.username,
        name: userInfo?userInfo?.name:user.firstName ?? "",
        bio: userInfo ? userInfo?.bio:"",
        image: userInfo ? userInfo?.image:user.imageUrl,
    }
  
  return <>
  <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
    <h1 className='head-text'>
        Onboarding
    </h1>
    <p className='mt-3 text-base-regular text-light-2'>
        Compelete your profle to use the thread
    </p>
    <section className='bg-dark-2 mt-9 p-10'>
        <AccountProfile user={userData} btnTitle="Continue.."/>
    </section>
  </main>
  </>
}
