import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";
import dbConnect from "@/lib/dbConnection";
import UserModel, { IUser } from "@/models/user.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const user = await UserModel.findById(userId).populate("following");

    if (!user) return ApiError(404, false, "User not found!");

    const following = user.following as unknown as IUser[];

    return ApiResponse<IUser>(
      201,
      true,
      "Data fetched successfully",
      undefined,
      following
    );
  } catch (error) {
    console.log("Error in fetching data:", error);
    return ApiError(500, false, "Failed to fetching data");
  }
}
