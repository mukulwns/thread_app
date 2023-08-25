import React from "react";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.action";
import PostThread from "@/components/forms/PostThread";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadTab from "@/components/shared/ThreadTab";
async function Profile({ params }: { params: { id: string } }) {
  const user = await currentUser();
  console.log(user);
  if (!user) return null;
  const userInfo = await fetchUser(params.id);
  console.log(userInfo);
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <>
      <section>
        <ProfileHeader
          accountId={userInfo.id}
          authUserId={user?.id}
          name={userInfo.name}
          imgUrl={userInfo.image}
          bio={userInfo.bio}
          username={userInfo.username}
        />

        <div className="mt-9">
          <Tabs defaultValue="thread" className="w-full">
            <TabsList className="tab">
              {profileTabs.map((tab) => (
                <TabsTrigger key={tab.label} value={tab.value} className="tab">
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <p className="max-sm:hidden">{tab.label}</p>
                  {tab.label == "Threads" && (
                    <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                      {userInfo.threads.length}
                    </p>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {profileTabs.map((tab) => (
              <TabsContent
                key={`contect-${tab.label}`}
                value={tab.value}
                className="w-full text-light-1"
              >
                <ThreadTab
                  currentUserId={user.id}
                  accountId={userInfo.id}
                  accountType="User"
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </>
  );
}

export default Profile;
