import dbConnect from "@/lib/dbConnection";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import ApiError from "@/helpers/ApiError";
import PostModel from "@/models/post.model";
import ApiResponse from "@/helpers/ApiResponse";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(401, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    // Pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Aggregation pipeline to fetch posts with isLiked field
    const allPosts = await PostModel.aggregate([
      // Match all posts (no filter since we want all posts)
      { $match: {} },
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

    if (allPosts.length === 0) {
      return ApiResponse(200, false, "No posts found", []);
    }

    // Count total posts for pagination info
    const totalPosts = await PostModel.countDocuments();

    return ApiResponse(200, true, "Feed fetched", {
      posts: allPosts,
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error: unknown) {
    console.error("Error in fetching data:", error);
    return ApiError(500, false, "Failed to fetch data");
  }
}
