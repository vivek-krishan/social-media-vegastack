import dbConnect from "@/lib/dbConnection";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import mongoose from "mongoose";
import UserModel, { IUser } from "@/models/user.model";
import ApiResponse from "@/helpers/ApiResponse";

// This get route will provide all the users except the logged-in user
export async function GET(req: Request) {
  await dbConnect();

    if (req) {
      // This is just to ensure the function is called in a server context
    }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  try {
    const sessionUser: User = session.user as User;
    const loggedInUserId = new mongoose.Types.ObjectId(sessionUser._id);

    // Exclude current user
    const users = await UserModel.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -otp -otpExpiry -__v"); // exclude sensitive fields

    if (!users || users.length === 0) {
      return ApiResponse<IUser[]>(200, false, "No other users found", []);
    }

    return ApiResponse<IUser[]>(200, true, "Data fetched successfully", users);
  } catch (error) {
    console.log("Error in fetching data:", error);
    return ApiError(500, false, "Failed to fetch data");
  }
}
