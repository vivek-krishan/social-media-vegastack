import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";
import dbConnect from "@/lib/dbConnection";
import UserModel, { IUser } from "@/models/user.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import mongoose from "mongoose";

// Get method for fetching user data by userId
export async function GET(
  req: Request,
  context: { params: { userId: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const loggedInUserId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { userId } = context.params;

    if (!userId) {
      return ApiError(400, false, "User ID is required");
    }

    const user = await UserModel.findById(userId)
      .select("-password -__v")
      .populate("post");

    if (!user) {
      return ApiError(404, false, "User not found");
    }

    const loggedInUser = await UserModel.findById(loggedInUserId);
    if (!loggedInUser) ApiError(404, false, "logged in not found!");

    const hasFollowed = loggedInUser?.following?.includes(user._id);
    const isFollower = loggedInUser?.follower?.includes(user._id);

    return ApiResponse(200, true, "User fetched successfully", {
      user,
      following: hasFollowed,
      follower: isFollower,
    });
  } catch (error) {
    console.log("error in fetching the data, ", error);
    return ApiError(500, false, "Internal server error");
  }
}

export async function PATCH(
  req: Request,
  context: { params: { userId: string } }
) {
  await dbConnect();

  try {
    const { userId } = context.params;
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
