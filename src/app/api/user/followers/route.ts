import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";
import dbConnect from "@/lib/dbConnection";
import UserModel, { IUser } from "@/models/user.model";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function GET(req: Request) {
  await dbConnect();

    if (req) {
      // This is just to ensure the function is called in a server context
    }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const user = await UserModel.findById(userId).populate("follower");

    if (!user) return ApiError(404, false, "User not found!");

    const follower = user.follower as unknown as IUser[];

    return ApiResponse<IUser>(
      201,
      true,
      "Data fetched successfully",
      undefined,
      follower
    );
  } catch (error) {
    console.log("Error in fetching data:", error);
    return ApiError(500, false, "Failed to fetching data");
  }
}
