"use client";
import React, { useState } from "react";
import { ThumbsUp, MessageSquare, Bookmark, Send } from "lucide-react";
import axios from "axios";
import CommentItem from "./CommentItem";
import { IComment } from "@/models/comment.model";

interface PostCardProps {
  user: {
    name: string;
    image: string;
    postedTime: string;
  };
  content: {
    text: string;
    image?: string;
  };
  engagement: {
    likes: number;
    isLiked?: boolean;
    comments: number;
    allComments: [];
  };
  postId: string;
}

const PostCard = ({ user, content, engagement, postId }: PostCardProps) => {
  const [loader, setLoader] = useState({
    isLiking: false,
    isCommenting: false,
  });
  const [likes, setLikes] = useState(engagement.likes);
  const [isLiked, setIsLiked] = useState(engagement.isLiked || false);
  const [comments, setComments] = useState(engagement.comments);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  const likePost = async () => {
    setLoader((prev) => ({ ...prev, isLiking: true }));
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1)); // Optimistic update
    setIsLiked(!isLiked);

    try {
      const response = await axios.patch("/api/posts/like", { postId });
    } catch (error) {
      console.error("Error in liking post:", error);
      // Revert optimistic update on error
      setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
      setIsLiked((prev) => !prev);
    } finally {
      setLoader((prev) => ({ ...prev, isLiking: false }));
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return; // Prevent empty comments
    setLoader((prev) => ({ ...prev, isCommenting: true }));

    const comment = {
      user: {
        name: user.name,
      },
      comment: commentText,
      createdAt: new Date(),
    };

    engagement.allComments.push(comment);

    try {
      const response = await axios.post("/api/posts/comment", {
        postId,
        comment: commentText,
      });
      setComments((prev) => prev + 1); // Update comment count
      setCommentText(""); // Clear input
      // setShowCommentInput(false);
    } catch (error) {
      console.error("Error in commenting:", error);
    } finally {
      setLoader((prev) => ({ ...prev, isCommenting: false }));
    }
  };

  return (
    <div className='bg-[#212228] rounded-lg mb-6'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center'>
            <div className='w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2'>
              <span className='font-bold'>
                {user.name.at(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className='flex items-center'>
                <h4 className='text-sm font-medium'>{user.name}</h4>
              </div>
              <p className='text-xs text-gray-400'>{user.postedTime}</p>
            </div>
          </div>
          <div className='flex items-center space-x-1'>
            <button>
              <Bookmark size={16} className='text-gray-400' />
            </button>
          </div>
        </div>
        <div className='mb-4'>
          <p className='text-sm text-gray-200 mb-3'>{content.text}</p>
          {content.image && (
            <div className='rounded-lg overflow-hidden'>
              <img src={content.image} alt='Post' className='w-full' />
            </div>
          )}
        </div>
        <div className='flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-3'>
          <button
            onClick={likePost}
            className={`flex items-center ${isLiked && engagement.isLiked ? "text-blue-400" : "text-gray-400"} cursor-pointer`}
            disabled={loader.isLiking}
          >
            {loader.isLiking ? (
              <img
                src='/like.gif' // Replace with your GIF path or URL
                alt='Liking...'
                className='w-5 h-5 mr-1'
              />
            ) : (
              <ThumbsUp size={16} className='mr-1' />
            )}
            <span>{likes} liked post</span>
          </button>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setShowCommentInput((prev) => !prev)}
              className='flex items-center text-gray-400 cursor-pointer'
            >
              <MessageSquare size={16} className='mr-1' />
              <span>Comment {comments}</span>
            </button>
          </div>
        </div>
        {showCommentInput && (
          <>
            <div className='mt-3 flex items-center space-x-2'>
              <input
                type='text'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder='Write a comment...'
                className='flex-1 bg-[#2a2b32] text-gray-200 text-sm rounded-lg p-2 outline-none'
                disabled={loader.isCommenting}
              />
              <button
                onClick={submitComment}
                className='text-blue-400'
                disabled={loader.isCommenting || !commentText.trim()}
              >
                <Send size={16} />
              </button>
            </div>
            {/* Comments */}
            {engagement.allComments.length === 0 ? (
              <span className='text-sm text-gray-400 mt-5'>
                No previous comments
              </span>
            ) : (
              <div className='space-y-4 mt-5'>
                {engagement.allComments.map((comment) => (
                  <CommentItem comment={comment} key={comment._id as string} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PostCard;
