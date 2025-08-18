"use client";
import React, { useEffect, useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ContentTabs from "@/components/profile/ContentTabs";
import PostGrid from "@/components/post/PostGrid";
import { IUser } from "@/models/user.model";
import axios from "axios";
import { toast } from "sonner";
import { IPost } from "@/models/post.model";
import Layout from "@/components/layout/Layout";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const [loader, setLoader] = useState({
    fetingProfile: false,
    deletingPost: false,
    toggleFollowing: false,
  });

  const { data: session } = useSession();

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [user, setUser] = useState<IUser | null>(null);
  const [isFollowing, setIsFollowing] = useState<Boolean>(false);
  const [hasFollowed, setHasFollowed] = useState<Boolean>(false);

  const fetchProfile = async () => {
    setLoader((prev) => ({ ...prev, fetingProfile: true }));

    try {
      const user = await axios.get(`/api/user/${userId}`);
      if (user.status !== 200) {
        toast.error("Failed to fetch profile data!");
      }
      setUser(user.data?.data.user as IUser);
      setIsFollowing(user.data.data.following);
      setHasFollowed(user.data.data.follower);
    } catch (error) {
      console.log("Error fetching profile:", error);
    } finally {
      setLoader((prev) => ({ ...prev, fetingProfile: false }));
    }
  };

  const followToUser = async () => {
    setLoader((prev) => ({ ...prev, toggleFollowing: true }));

    try {
      const response = axios.patch("/api/user/follow", {
        targetId: userId,
        following: !isFollowing,
      });
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.log("Error in following:", error);
      toast.error("Error in follow!");
    } finally {
      setLoader((prev) => ({ ...prev, toggleFollowing: false }));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return !session?.user ? (
    <div className='w-screen h-screen flex justify-center items-center'>
      <img src='/screenLoading.svg' alt='' className='w-40' />
    </div>
  ) : (
    <Layout>
      <div className=' text-white min-h-screen w-full'>
        <div className='max-w-xl mx-auto pb-20'>
          <div className='relative'>
            <div className='flex flex-col gap-5 pt-4 px-4'>
              <div className='w-full mt-4 flex justify-between items-start '>
                <ProfileInfo
                  displayName={user?.name as string}
                  pronouns={"He/Him"}
                  email={user?.email as string}
                />
                <div className='flex space-x-4'>
                  <div className='text-center'>
                    <div className='font-bold'>{user?.post?.length}</div>
                    <div className='text-sm text-gray-400'>posts</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-bold'>{user?.follower?.length}</div>
                    <div className='text-sm text-gray-400'>followers</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-bold'>{user?.following?.length}</div>
                    <div className='text-sm text-gray-400'>following</div>
                  </div>
                </div>
              </div>
              <div className=''>
                {session.user._id === userId ? (
                  <ProfileActions />
                ) : (
                  <Button
                    variant={"secondary"}
                    onClick={followToUser}
                    className='bg-blue-500'
                  >
                    {isFollowing
                      ? "Following"
                      : hasFollowed
                        ? "Follow Back"
                        : "Follow"}
                  </Button>
                )}
              </div>
              {/* <StoryHighlights highlights={highlights} /> */}
              <ContentTabs />
              <PostGrid posts={user?.post as IPost[]} />
            </div>
            {/* <EngagementBar likes={63} /> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default ProfilePage;
