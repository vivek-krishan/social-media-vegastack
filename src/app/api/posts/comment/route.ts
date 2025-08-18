import dbConnect from "@/lib/dbConnection";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import mongoose from "mongoose";
import { commentSchema } from "@/schemas/comment.schema";
import CommentModel, { IComment } from "@/models/comment.model";
import PostModel from "@/models/post.model";
import ApiResponse from "@/helpers/ApiResponse";

// post request for creating a new comment on any post
export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(
      402,
      false,
      "User is not logged in! Login to continue posting"
    );
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { postId, comment } = await req.json();

    if (!postId) return ApiError(400, false, "Post ID is required");
    if (!comment) return ApiError(400, false, "Comment is required");

    const validateInputs = commentSchema.safeParse({
      comment,
    });

    if (!validateInputs.success) {
      return ApiError(400, false, "Invalid comment input");
    }

    const post = await PostModel.findById(postId);
    if (!post) return ApiError(404, false, "Post not found");

    // Create a new comment
    const newComment = await CommentModel.create({
      user: userId,
      post: postId,
      comment,
    });

    const createdComment = await CommentModel.findById(newComment._id).populate(
      "user"
    );

    if (!createdComment)
      ApiError(400, false, "Error in creating comment! Please try again later");

    //    Update the post with the new comment
    post.comments.push(newComment._id);
    await post.save();

    return ApiResponse<IComment>(
      200,
      true,
      "Comment created successfully",
      createdComment as IComment
    );
  } catch (error) {
    console.log("Error in creating comment:", error);
    return ApiError(500, false, "Failed to create comment");
  }
}
