import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";
import dbConnect from "@/lib/dbConnection";
import UserModel, { IUser } from "@/models/user.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";

// Get method for fetching user's data
export async function GET(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const sessionUserId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId || userId.trim() === "")
      return ApiError(400, false, "User Id is required!");

    const user = await UserModel.findById(userId)
      .select("-password -__v")
      .populate("post");

    if (!user) {
      return ApiError(404, false, "User not found");
    }

    if (user._id !== sessionUserId) {
      const loggedInUser = await UserModel.findById(sessionUserId);
      if (!loggedInUser)
        return ApiError(404, false, "Logged in user not found!");

      const hasFollowed = loggedInUser?.following?.includes(user._id);
      const isFollower = loggedInUser?.follower?.includes(user._id);

      return ApiResponse(200, true, "User fetched successfully", {
        user,
        following: hasFollowed,
        follower: isFollower,
      });
    }

    return ApiResponse(200, true, "User fetched successfully", {
      user,
      following: false,
      follower: false,
    });
  } catch (error) {
    console.log("error in fetching the data, ", error);
    return ApiError(500, false, "Internal server error");
  }
}

// Patch method for updating logged in user's name
export async function PATCH(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    if (!userId) return ApiError(400, false, "Post Id is required!");
    if (!userId) return ApiError(400, false, "User Id is required");

    const { name } = await req.json();

    if (!name) {
      return ApiError(400, false, "Name is required");
    }

    const user = await UserModel.findById(userId);
    if (!user) return ApiError(404, false, "User not found");

    if (user.name === name) {
      return ApiError(
        400,
        false,
        "New name cannot be the same as the old name"
      );
    }

    user.name = name;
    await user.save();

    return ApiResponse(200, true, "User updated successfully", user);
  } catch (error) {
    console.error("Error in updating user:", error);
    return ApiError(500, false, "Internal Server Error");
  }
}
