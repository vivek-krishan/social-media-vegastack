import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/user.model";
import { z, ZodFormattedError } from "zod";
import { NextResponse } from "next/server";
import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";
import { changePasswordSchema } from "@/schemas/changePassword.schema";
import bcrypt from "bcryptjs";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../[...nextauth]/option";
import mongoose from "mongoose";

export async function PATCH(req: Request) {
  await dbConnect();

   const session = await getServerSession(authOptions);
   if (!session || !session.user) {
     return ApiError(402, false, "User is not logged in!");
   }

   const sessionUser: User = session.user as User;
   const userId = new mongoose.Types.ObjectId(sessionUser._id);

  try {
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return ApiError(400, false, "All fields are required");
    }

    const validationResult = changePasswordSchema.safeParse({
      oldPassword,
      newPassword,
    });

    // Collecting errors if validation fails
    if (!validationResult.success) {
      const formatted: ZodFormattedError<
        z.infer<typeof changePasswordSchema>,
        string
      > = validationResult.error.format();

      const errors: Record<string, string> = {};

      // Collect all error messages of different attribute (name, email, password, role) from the formatted result
      for (const key in formatted) {
        const field = formatted[key as keyof typeof formatted];
        if (field && "_errors" in field && field._errors.length > 0) {
          errors[key] = field._errors.join(", "); // or join(", ") if you want all messages
        }
      }

      const combinedErrorMessage = Object.values(errors).join(" | ");

      return ApiError(401, false, combinedErrorMessage);
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return ApiError(404, false, "User not found");
    }

    const isPasswordMatch = bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return ApiError(401, false, "Old password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    return ApiResponse(200, true, "Password changed successfully");

  } catch (error) {
    console.error("Error in changing password:", error);
    return ApiError(500, false, "Internal Server Error");
  }
}
