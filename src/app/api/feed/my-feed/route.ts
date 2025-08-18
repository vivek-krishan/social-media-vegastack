import dbConnect from "@/lib/dbConnection";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import mongoose from "mongoose";
import UserModel from "@/models/user.model";
import PostModel from "@/models/post.model";
import ApiResponse from "@/helpers/ApiResponse";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(401, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const user = await UserModel.findById(userId);
    if (!user) return ApiError(404, false, "User not found!");

    // Pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Get followed user IDs
    const followingIds =
      user.following?.map((u: mongoose.Types.ObjectId) => u.toString()) || [];

    if (followingIds.length === 0) {
      return ApiResponse(200, false, "No posts found", []);
    }

    // Aggregation pipeline to fetch posts with isLiked field
    const posts = await PostModel.aggregate([
      // Match posts from followed users
      {
        $match: {
          user: {
            $in: followingIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      // Sort by createdAt descending
      { $sort: { createdAt: -1 } },
      // Pagination
      { $skip: skip },
      { $limit: limit },
      // Add isLiked field
      {
        $addFields: {
          isLiked: { $in: [userId, "$likes"] },
        },
      },
      // Populate user field
      {
        $lookup: {
          from: "usermodels", // Collection name (lowercase, pluralized by Mongoose)
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { password: 0, __v: 0 } }],
        },
      },
      { $unwind: "$user" }, // Unwind user array to single object
      // Populate likes field
      {
        $lookup: {
          from: "usermodels",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
          pipeline: [{ $project: { password: 0, __v: 0 } }],
        },
      },
      // Populate comments field
      {
        $lookup: {
          from: "commentmodels",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
          pipeline: [
            {
              $lookup: {
                from: "usermodels",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [{ $project: { password: 0, __v: 0 } }],
              },
            },
            { $unwind: "$user" },
          ],
        },
      },
    ]);

    if (posts.length === 0) {
      return ApiResponse(200, false, "No posts found", []);
    }

    // Count total posts for pagination info
    const totalPosts = await PostModel.countDocuments({
      user: { $in: followingIds },
    });

    return ApiResponse(200, true, "Feed fetched", {
      posts,
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error: any) {
    console.error("Error in fetching the data:", error.message, error.stack);
    return ApiError(500, false, "Internal server error");
  }
}
