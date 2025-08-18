"use client";
import { IPost } from "@/models/post.model";
import React, { useState } from "react";
import PopUp from "../ui/PopUp";
import PostDetail from "./PostDetails";

interface PostItemProps {
  post: IPost;
}
const PostItem = ({ post }: PostItemProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div className='aspect-square' onClick={() => setIsPreviewOpen(true)}>
        <img
          src={post?.image?.url}
          alt={`Post ${post.id}`}
          className='w-full h-full object-cover'
        />
      </div>
      {isPreviewOpen && (
        <PopUp onClose={() => setIsPreviewOpen(false)} key={post._id as string}>
          <PostDetail post={post} />
        </PopUp>
      )}
    </>
  );
};
export default PostItem;
