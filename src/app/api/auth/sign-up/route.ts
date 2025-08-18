import dbConnect from "@/lib/dbConnection";
import UserModel, { IUser } from "@/models/user.model";
import bcrypt from "bcryptjs";
import { z, ZodFormattedError } from "zod";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";
import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";
import { signUpSchema } from "@/schemas/signUp.schema";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();
  try {
    const { name, email, mobile, password } = await request.json();
    if (!name || !mobile || !email || !password) {
      return ApiError(400, false, "All fields are required");
    }

    const validationResult = signUpSchema.safeParse({
      name,
      email,
      mobile,
      password,
    });

    // Error collection
    if (!validationResult.success) {
      const formatted: ZodFormattedError<
        z.infer<typeof signUpSchema>,
        string
      > = validationResult.error.format();

      const errors: Record<string, string> = {};

      // Collect all error messages of different attribute (name, email, mobile, password) from the formatted result
      for (const key in formatted) {
        const field = formatted[key as keyof typeof formatted];
        if (field && "_errors" in field && field._errors.length > 0) {
          errors[key] = field._errors.join(", "); // or join(", ") if you want all messages
        }
      }

      const combinedErrorMessage = Object.values(errors).join(" | ");

      return ApiError(401, false, combinedErrorMessage);
    }

    const existingVerifiedUser = await UserModel.findOne<IUser>({
      email,
      mobile,
      isVerified: true,
    });
    if (existingVerifiedUser)
      return ApiError(409, false, "User already exist!");

    const existingUserByEmail = await UserModel.findOne({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUserByEmail.password = hashedPassword;
      existingUserByEmail.otp = otp;
      existingUserByEmail.otpExpiry = new Date(Date.now() + 3600000);

      await existingUserByEmail.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry date to 1 hour from now

      await UserModel.create({
        name,
        email,
        mobile,
        isVerified: false,
        password: hashedPassword,
        otp,
        otpExpiry: expiryDate,
      });
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(email, name, otp);
    console.log("emailResponse: ", emailResponse);
    if (!emailResponse.success) {
      return ApiError(500, false, emailResponse.message);
    }

    return ApiResponse(
      201,
      true,
      existingUserByEmail
        ? "This email is already registered but not verified. Please verify your email"
        : "User registered successfully. Please verify your email"
    );
  } catch (error) {
    console.error("Error in user registration:", error);
    return ApiError(401, false, "Internal server error during signing up");
  }
}
