"use client";
import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Smile,
} from "lucide-react";
import { IPost } from "@/models/post.model";
import axios from "axios";
import CommentItem from "./CommentItem";
import { IComment } from "@/models/comment.model";
import { Button } from "../ui/button";
import { toast } from "sonner";

import { commentSchema } from "@/schemas/comment.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";

interface PostDetailProps {
  post: IPost;
}

const PostDetail = ({ post }: PostDetailProps) => {
  const [loader, setLoader] = useState({
    fetchingPost: false,
    commenting: false,
  });
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [allComments, setAllComments] = useState<IComment[]>([]);
  const [postData, setPostData] = useState<IPost | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" },
  });

  const handleComment = async (data: z.infer<typeof commentSchema>) => {
    setLoader((prev) => ({ ...prev, commenting: true }));

    if (!postData) {
      toast.error("Post Details are not readable!");
      return;
    }

    const payload = {
      ...data,
      postId: postData._id,
    };
    try {
      const commentDetails = await axios.post("/api/posts/comment", payload);
      setAllComments((prev) => [...prev, commentDetails.data.data]);

      toast.success("Comment posted!");
      reset({ comment: "" }); // ✅ clears the input
    } catch (error) {
      console.log("Failed to comment:", error);
      toast.error("Failed to comment!");
    } finally {
      setLoader((prev) => ({ ...prev, commenting: false }));
    }
  };

  const fetchPostDetails = async () => {
    setLoader((prev) => ({ ...prev, fetchingPost: true }));
    try {
      const postDetails = await axios.get(`/api/posts/${post._id}`);
      setPostData(postDetails.data.data.post as IPost);
      setHasLiked(postDetails.data.data.hasLiked);
      setAllComments(postDetails.data.data.post.comments);
    } catch (error) {
      console.log("Error fetching post details:", error);
    } finally {
      setLoader((prev) => ({ ...prev, fetchingPost: false }));
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [post, fetchPostDetails]);

  return loader.fetchingPost ? (
    <div>
      <Image src='/screenLoading.svg' alt='' className='w-40' />
    </div>
  ) : (
    <div className='max-w-4xl max-h-[80vh] mx-auto flex flex-col md:flex-row rounded-xl overflow-hidden bg-gray-900'>
      {/* Left side - Image */}
      <div className='md:w-fit bg-black'>
        <Image
          src={postData?.image.url as string}
          alt={`Post by ${postData?.user?.name}`}
          className='h-full object-cover'
        />
      </div>
      {/* Right side - Post details, comments, etc. */}
      <div className='md:w-full flex flex-col h-full '>
        {/* Header - User info */}
        <div className='flex items-center justify-between p-4 border-b border-gray-800'>
          <div className='flex items-center'>
            <span className='font-semibold'>{postData?.user?.name}</span>
          </div>
          <button>
            <MoreHorizontal size={20} />
          </button>
        </div>
        {/* Post caption and comments */}
        <div className='flex-1 overflow-y-auto p-4'>
          {/* Post caption */}
          <div className='flex mb-4'>
            <div>
              <p>
                <span className='font-semibold mr-2'>
                  {postData?.user?.name}
                </span>
                {post.caption}
              </p>

              <p className='text-gray-500 text-xs mt-1'>
                {/* {getWeeksSince(postData?.createdAt as Date)} weeks */}
              </p>
            </div>
          </div>
          {/* Comments */}
          <div className='space-y-4'>
            {allComments.map((comment) => (
              <CommentItem comment={comment} key={comment._id as string} />
            ))}
          </div>
        </div>
        {/* Engagement section */}
        <div className='border-t border-gray-800'>
          <div className='p-4'>
            <div className='flex justify-between mb-2'>
              <div className='flex space-x-4'>
                <button className='hover:opacity-70 flex flex-col justify-center items-center'>
                  <Heart
                    size={24}
                    className={`${hasLiked ? "text-red-500 fill-red-500" : ""}`}
                  />
                  <span>{postData?.likes.length}</span>
                </button>
                <button className='hover:opacity-70'>
                  <MessageCircle size={24} />
                </button>
              </div>
            </div>

            {/* Date */}
            <p className='text-xs text-gray-500'>
              {/* {getWeeksSince(postData?.createdAt as Date)} weeks */}
            </p>
          </div>
          {/* Add comment section */}
          <form onSubmit={handleSubmit(handleComment)}>
            <div className='flex items-center p-4 border-t border-gray-800'>
              <button type='button' className='mr-3'>
                <Smile size={24} />
              </button>
              <input
                {...register("comment")}
                type='text'
                placeholder='Add a comment...'
                className='flex-1 bg-transparent border-none outline-none text-sm'
              />
              <Button
                type='submit'
                disabled={isSubmitting}
                className='text-blue-500 font-semibold ml-2'
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
            {errors.comment && (
              <p className='text-red-500 text-xs px-4'>
                {errors.comment.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
export default PostDetail;
