import dbConnect from "@/lib/dbConnection";
import PostModel, { IPost } from "@/models/post.model";
import ApiError from "@/helpers/ApiError";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";
import { UploadImages } from "@/helpers/imageKit";
import formidable from "formidable";
import fs from "fs";
import ApiResponse from "@/helpers/ApiResponse";
import { NextRequest } from "next/server";
import { toNodeStream } from "@/lib/utils";
import UserModel, { IUser } from "@/models/user.model";
import CommentModel from "@/models/comment.model";

// Required for formidable in Next.js API routes
export const config = {
  api: {
    bodyParser: false, // disable Next's default parser
  },
};

// Post route for Creating a new post
export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(
      402,
      false,
      "User is not logged in! Login to continue posting"
    );
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const nodeReq = toNodeStream(req); // ✅ convert Fetch Request -> Node stream

    const form = formidable({ multiples: false, keepExtensions: true });

    const data: any = await new Promise((resolve, reject) => {
      form.parse(nodeReq as any, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { caption } = data.fields;
    const file = data.files.image;

    console.log({ file: file[0], caption });

    if (!file) return ApiError(400, false, "Image file is required");
    if (!caption) return ApiError(400, false, "Caption is required");

    const uploadedImageDetails = await UploadImages(
      file[0].filepath,
      file[0].newFilename as string,
      { folderStructure: `posts/${sessionUser?.name?.split(" ").join("-")}` },
      ["post", "user-upload", sessionUser.name as string]
    );

    const post = await PostModel.create({
      caption: caption[0],
      image: {
        url: uploadedImageDetails.url,
        fileId: uploadedImageDetails.fileId,
      },
      user: userId,
      likes: [],
      comments: [],
    });

    if (!post)
      ApiError(400, false, "Error in creating post! please try again later");

    // Adding post to user's posts array
    const user = await UserModel.findById<IUser>(userId);
    if (!user) return ApiError(404, false, "User not found");

    user.post?.push(post._id);
    await user.save();

    return ApiResponse<IPost>(201, true, "Post created successfully", post);
  } catch (error) {
    console.error("Error creating post:", error);
    return ApiError(500, false, "Internal server error");
  }
}

