import dbConnect from "@/lib/dbConnection";
import UserModel, { IUser } from "@/models/user.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import mongoose from "mongoose";
import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";

// Get function for fetching single user details(admin only)
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
  if (sessionUser.role !== "admin")
    return ApiError(
      403,
      false,
      "Access denied! Only admins can access this route."
    );

  try {
    const { userId } = await req.json();

    if (!userId) {
      return ApiError(400, false, "User ID is required");
    }

    const user = await UserModel.findById(userId)
      .select("-password -__v")
      .populate("following", "-password -__v")
      .populate("follower", "-password -__v")
      .populate("post", "-password -__v");

    if (!user) {
      return ApiError(404, false, "User not found");
    }

    return ApiResponse<IUser>(200, true, "User fetched successfully", user);
  } catch (error) {
    console.log("error in fetching the data, ", error);
    return ApiError(500, false, "Internal server error");
  }
}

// Patch function for toggling the user active status(admin only)
export async function PATCH(
  req: Request,
  context: { params: { userId: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  if (sessionUser.role !== "admin")
    return ApiError(
      403,
      false,
      "Access denied! Only admins can access this route."
    );

  try {
    const { userId } = context.params;
    if (!userId) return ApiError(400, false, "User Id is required");

    const user = await UserModel.findById(userId);
    if (!user) return ApiError(404, false, "User not found");

    user.isActive = !user.isActive; // Toggle active status
    await user.save();

    return ApiResponse(200, true, "Status Updated", user);
  } catch (error) {
    console.error("Error in updating user:", error);
    return ApiError(500, false, "Internal Server Error");
  }
}
