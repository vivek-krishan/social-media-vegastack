import dbConnect from "@/lib/dbConnection";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import mongoose from "mongoose";
import UserModel, { IUser } from "@/models/user.model";
import ApiResponse from "@/helpers/ApiResponse";

// Get route for fetching all users (admin only)
export async function GET(req: Request) {
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
    const users = await UserModel.find({});
    if (!users || users.length === 0)
      return ApiResponse(201, true, "No users found!", []);

    return ApiResponse<IUser>(
      200,
      true,
      "Users fetched successfully",
      undefined,
      users
    );
  } catch (error) {
    console.log("Error in fetching data:", error);
    return ApiError(500, false, "Failed to fetching data");
  }
}
