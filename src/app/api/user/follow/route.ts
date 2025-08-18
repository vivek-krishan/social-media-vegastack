import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";
import dbConnect from "@/lib/dbConnection";
import UserModel, { IUser } from "@/models/user.model";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function PATCH(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const followerId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { targetId, following } = await req.json();

    if (!targetId) return ApiError(404, false, "Target User's Id is required!");
    if (typeof following != "boolean")
      return ApiError(400, false, "Following status is required");

    const follower = await UserModel.findById<IUser>(followerId);
    if (!follower) return ApiError(404, false, "User not found!");

    const targetUser = await UserModel.findById<IUser>(targetId);
    if (!targetUser) return ApiError(404, false, "Target user not found!");

    if (following) {
      // Add target user to follower's following list
      if (!Array.isArray(follower.following)) {
        follower.following = [];
      }
      if (!follower.following.includes(targetId as mongoose.Types.ObjectId)) {
        follower.following.push(targetId);
      }
      // Add follower to target user's follower list
      if (!Array.isArray(targetUser.follower)) {
        targetUser.follower = [];
      }
      if (
        !targetUser.follower.includes(
          followerId as unknown as mongoose.Types.ObjectId
        )
      ) {
        targetUser.follower.push(
          followerId as unknown as mongoose.Types.ObjectId
        );
      }
    } else {
      // Remove target user from follower's following list
      if (Array.isArray(follower.following)) {
        follower.following = follower.following.filter(
          (id) => id.toString() !== targetId.toString()
        );
      }

      // Remove follower from target user's follower list
      if (Array.isArray(targetUser.follower)) {
        targetUser.follower = targetUser.follower.filter(
          (id) => id.toString() !== followerId.toString()
        );
      }
    }
    await follower.save();
    await targetUser.save();

    return ApiResponse(201, true, "Follow status updated successfully");
  } catch (error) {
    console.log("Error in following the user:", error);
    return ApiError(500, false, "Failed to follow! Please try again later");
  }
}
