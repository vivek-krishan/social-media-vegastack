import React from "react";
import PostItem from "./PostItem";
import { IPost } from "@/models/post.model";

interface PostGridProps {
  posts: IPost[];
}
const PostGrid = ({ posts }: PostGridProps) => {
  return (
    <div className='w-full mt-2 grid grid-cols-3 gap-1'>
      {posts?.map((post) => (
        <PostItem key={post._id as string} post={post} />
      ))}
    </div>
  );
};
export default PostGrid;
