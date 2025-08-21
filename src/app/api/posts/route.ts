import dbConnect from "@/lib/dbConnection";
import PostModel, { IPost } from "@/models/post.model";
import ApiError from "@/helpers/ApiError";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";
import { UploadImages } from "@/helpers/imageKit";
import formidable, { File as FormidableFile } from "formidable";
import ApiResponse from "@/helpers/ApiResponse";
import { NextRequest } from "next/server";
import { toNodeStream } from "@/lib/utils";
import UserModel, { IUser } from "@/models/user.model";

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
    const nodeReq: NodeJS.ReadableStream = toNodeStream(req);
    const form = formidable({ multiples: false, keepExtensions: true });

    // Define type for form data
    interface FormData {
      fields: Record<string, string>;
      files: Record<string, FormidableFile[]>;
    }

    const data: FormData = await new Promise((resolve, reject) => {
      form.parse(
        nodeReq as NodeJS.ReadableStream,
        (
          err: Error | null,
          fields: Record<string, string>,
          files: Record<string, FormidableFile[]>
        ) => {
          if (err) reject(err);
          resolve({ fields, files });
        }
      );
    });

    const { caption } = data.fields;
    const file = data.files.image; // file: FormidableFile[]

    console.log({ file: file, caption });

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

// Get route for fetching a post by ID
export async function GET(req: NextRequest) {
  await dbConnect(); // This ensures models are registered

  if (req) {
    console.log(req.body);
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId || postId.trim() === "")
      return ApiError(400, false, "Post Id is required!");

    const post = await PostModel.findById(postId)
      .populate("user", "-password -__v")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "-password -__v",
        },
        model: "CommentModel",
      });

    if (!post) return ApiError(404, false, "Post not found!");

    const userId = new mongoose.Types.ObjectId(session.user._id);
    const hasLiked = post.likes.includes(userId);

    return ApiResponse(200, true, "Post fetched", {
      post,
      hasLiked,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return ApiError(500, false, "Internal server error");
  }
}

// Patch route for updating a post by ID
export async function PATCH(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }

  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const { caption } = await req.json();

    if (!postId || postId.trim() === "")
      return ApiError(400, false, "Post Id is required!");

    if (!caption || caption.trim() === "")
      return ApiError(400, false, "Caption is required!");

    const post = await PostModel.findById<IPost>(postId)
      .populate("user", "-password -__v")
      .populate("likes")
      .populate("comments");

    if (!post) return ApiError(404, false, "Post not found!");

    const user = await UserModel.findById<IUser>(userId).populate("post");
    if (!user) return ApiError(404, false, "User not found!");

    if (post.user._id !== userId || !user.post || user.post._id !== postId)
      return ApiError(401, false, "You can't edit this post!");

    post.caption = caption;
    await post.save();

    if (post.caption != caption)
      return ApiError(
        500,
        false,
        "Failed to update due to some internal error! Please try again later"
      );

    return ApiResponse<IPost>(201, false, "Post Updated", post);
  } catch (error) {
    console.log("Error in updating the post:", error);
    return ApiError(
      500,
      false,
      "Error in updating the post! Please try again later"
    );
  }
}

// Delete route for deleting a post by ID
export async function DELETE(req: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return ApiError(402, false, "User is not logged in!");
  }
  const sessionUser: User = session.user as User;
  const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId || postId.trim() === "")
      return ApiError(400, false, "Post Id is required!");

    const user = await UserModel.findById(userId);
    if (!user) return ApiError(404, false, "User not found!");

    const postObjectId = new mongoose.Types.ObjectId(postId);
    const isPostAvailable = user.post?.includes(postObjectId);

    if (!isPostAvailable)
      return ApiError(401, false, "You can't delete this post!");

    const deletedPost = await PostModel.findByIdAndDelete(postId);
    if (!deletedPost)
      return ApiError(
        500,
        false,
        "Failed to delete the post! Please try again later"
      );

    user.post = user.post?.filter((id) => id != postObjectId);
    user.save();

    return ApiResponse(201, true, "Post deleted successfully");
  } catch (error) {
    console.log("Error in deletion:", error);
    return ApiError(
      500,
      false,
      "Error in deletion of post! Please try again later"
    );
  }
}
