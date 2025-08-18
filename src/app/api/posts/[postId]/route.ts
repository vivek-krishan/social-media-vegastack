import ApiError from "@/helpers/ApiError";
import dbConnect from "@/lib/dbConnection";
import CommentModel from "@/models/comment.model";
import PostModel, { IPost } from "@/models/post.model";
import UserModel, { IUser } from "@/models/user.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import ApiResponse from "@/helpers/ApiResponse";
import mongoose from "mongoose";

// Get route for fetching a post by ID
export async function GET(
  req: Request,
  context: { params: { postId: string } }
) {
  await dbConnect(); // This ensures models are registered

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  try {
    const { postId } = await context.params;
    if (!postId) return ApiError(400, false, "Post Id is required!");

    const post = await PostModel.findById(postId)
      .populate("user", "-password -__v")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "-password -__v",
        },
        model: "CommentModel",
      });
    

    if (!post) return ApiError(404, false, "Post not found!");

    const userId = new mongoose.Types.ObjectId(session.user._id);
    const hasLiked = post.likes.includes(userId);

    return ApiResponse(200, true, "Post fetched", {
      post,
      hasLiked,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return ApiError(500, false, "Internal server error");
  }
}

// Patch route for updating a post by ID
export async function PATCH(
  req: Request,
  context: { params: { postId: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { postId } = context.params;
    const { caption } = await req.json();

    if (!caption) return ApiError(400, false, "Caption is required!");

    if (!postId) return ApiError(400, false, "Post Id not found!");

    const post = await PostModel.findById<IPost>(postId)
      .populate("user", "-password -__v")
      .populate("likes")
      .populate("comments");

    if (!post) return ApiError(404, false, "Post not found!");

    const user = await UserModel.findById<IUser>(userId).populate("post");
    if (!user) return ApiError(404, false, "User not found!");

    if (post.user._id !== userId || !user.post || user.post._id !== postId)
      return ApiError(401, false, "You can't edit this post!");

    post.caption = caption;
    await post.save();

    if (post.caption != caption)
      return ApiError(
        500,
        false,
        "Failed to update due to some internal error! Please try again later"
      );

    return ApiResponse<IPost>(201, false, "Post Updated", post);
  } catch (error) {
    console.log("Error in updating the post:", error);
    return ApiError(
      500,
      false,
      "Error in updating the post! Please try again later"
    );
  }
}

// Delete route for deleting a post by ID
export async function DELETE(
  req: Request,
  context: { params: { postId: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }
  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { postId } = context.params;
    if (!postId) return ApiError(404, false, "Post id is required!");

    const user = await UserModel.findById(userId);
    if (!user) return ApiError(404, false, "User not found!");

    const postObjectId = new mongoose.Types.ObjectId(postId);
    const isPostAvailable = user.post?.includes(postObjectId);

    if (!isPostAvailable)
      return ApiError(401, false, "You can't delete this post!");

    const deletedPost = await PostModel.findByIdAndDelete(postId);
    if (!deletedPost)
      return ApiError(
        500,
        false,
        "Failed to delete the post! Please try again later"
      );

    user.post = user.post?.filter((id) => id != postObjectId);
    user.save();

    return ApiResponse(201, true, "Post deleted successfully");
  } catch (error) {
    console.log("Error in deletion:", error);
    return ApiError(
      500,
      false,
      "Error in deletion of post! Please try again later"
    );
  }
}
