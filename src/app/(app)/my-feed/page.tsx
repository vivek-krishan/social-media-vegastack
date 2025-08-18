"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import PostCreate from "@/components/post/PostCreate";
import PostCard from "@/components/post/PostCard";
import axios from "axios";
import { IPost } from "@/models/post.model";
import { toast } from "sonner";
import { getWeeksSince } from "@/lib/utils";
import { IComment } from "@/models/comment.model";
const MyFeed = () => {
  const [loader, setLoader] = useState({
    feedLoading: false,
    postLoading: false,
    commentLoading: false,
    likeLoading: false,
  });
  
  console.log(loader);
  const [feedData, setFeedData] = useState<IPost[]>([]);

  const fetchFeed = async () => {
    setLoader((prev) => ({ ...prev, feedLoading: true }));
    try {
      const feedResponse = await axios.get<IPost[]>("/api/feed/my-feed");
      // Assuming feedResponse.data contains the feed data
      setFeedData(feedResponse.data.data.posts);
      toast.success("Login successful");
    } catch (error) {
      console.log("Error fetching feed:", error);
    } finally {
      setLoader((prev) => ({ ...prev, feedLoading: false }));
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <Layout>
      <div className='max-w-xl mx-auto py-4'>
        <PostCreate />
        {feedData.map((post) => (
          <PostCard
            user={{
              name: post.user?.name,
              image: "https://randomuser.me/api/portraits/men/36.jpg",
              postedTime: getWeeksSince(post.createdAt) as unknown as string,
            }}
            content={{
              text: post.caption,
              image: post.image.url,
            }}
            engagement={{
              likes: post.likes.length,
              isLiked: post.isLiked,
              comments: post.comments.length,
              allComments: post.comments as IComment[],
            }}
            postId={post._id}
          />
        ))}
      </div>
    </Layout>
  );
};
export default MyFeed;
