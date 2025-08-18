import dbConnect from "@/lib/dbConnection";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import UserModel, { IUser } from "@/models/user.model";
import ApiResponse from "@/helpers/ApiResponse";

export async function GET(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    console.log({query});
    if (!query) {
      return ApiError(400, false, "Search query is required!");
    }

    const regex = new RegExp(query, "i");

    // If query is numeric, handle mobile search separately
    const isNumeric = /^\d+$/.test(query);

    const users = await UserModel.find({
      $or: [
        { name: regex },
        { email: regex },
        ...(isNumeric ? [{ mobile: Number(query) }] : []), // only check mobile if numeric
      ],
    }).select("-password -__v");

    if (!users || users.length === 0) {
      return ApiError(404, false, "No users found!");
    }

    return ApiResponse<IUser[]>(
      200,
      true,
      "Users fetched successfully",
      undefined,
      users
    );
  } catch (error) {
    console.error("Error searching users:", error);
    return ApiError(500, false, "Failed to search users");
  }
}
