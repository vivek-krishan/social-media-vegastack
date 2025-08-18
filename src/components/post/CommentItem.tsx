import React from "react";
import { Heart } from "lucide-react";
import { IComment } from "@/models/comment.model";
import { getWeeksSince } from "@/lib/utils";

interface CommentItemProps {
  comment: IComment;
}
const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className='flex group'>
      <div className='flex-1'>
        <div className='flex justify-between items-start'>
          <div>
            <p>
              <span className='font-semibold mr-2 text-blue-500 underline'>
                {comment.user.name}:
              </span>
              {comment.comment}
            </p>
            <div className='flex items-center mt-1 text-xs text-gray-500'>
              <span>{getWeeksSince(comment.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CommentItem;
