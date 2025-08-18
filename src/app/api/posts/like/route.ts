import dbConnect from "@/lib/dbConnection";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import mongoose from "mongoose";
import PostModel from "@/models/post.model";
import ApiResponse from "@/helpers/ApiResponse";
import { getIO } from "@/lib/socket";

// patch controller for toggling post likes
export async function PATCH(req: Request) {
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
    const { postId } = await req.json();

    if (!postId) return ApiError(400, false, "Post ID is required");

    // Check if the post exists
    const post = await PostModel.findById(postId);

    if (!post) return ApiError(404, false, "Post not found");

    // Check if the user has already liked the post
    const existingLike = post.likes.find(
      (like) => like.toString() === userId.toString()
    );

    if (existingLike) {
      // User has already liked the post, so remove the like
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
    } else {
      // User has not liked the post, so add the like
      post.likes.push(userId);
    }
    post.save();

    // Socket Implementation
    const io = await getIO(); // Now async
    const postOwnerId = post.user.toString();
    const likerId = sessionUser._id;
    if (postOwnerId !== likerId) {
      io.to(postOwnerId).emit("notification", {
        type: "like",
        postId: post._id.toString(),
        userId: likerId,
        message: "Someone liked your post!",
      });
    }

    return ApiResponse(200, true, "Post like toggled successfully", {
      post,
      liked: !existingLike, // Return whether the post is now liked
    });
  } catch (error) {
    console.log("Error in toggling like:", error);
    return ApiError(500, false, "Failed to toggle like");
  }
}
