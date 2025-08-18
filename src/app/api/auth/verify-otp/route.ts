import dbConnect from "@/lib/dbConnection";
import UserModel, { IUser } from "@/models/user.model";
import { verifySchema } from "@/schemas/verifyCode.schema";
import ApiError from "@/helpers/ApiError";
import ApiResponse from "@/helpers/ApiResponse";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, code } = await request.json();

    if (!email || !code) ApiError(404, false, "All fields are required");

    const result = verifySchema.safeParse({ code });

    if (!result.success) {
      const codeError = result.error.format().code?._errors || [];
      return ApiError(
        401,
        false,
        codeError?.length > 0 ? codeError?.join(", ") : "Otp validation failed"
      );
    }

    console.log([{ email }, { code }]);

    const user = await UserModel.findOne({ email });
    console.log(user)
    if (!user) return ApiError(404, false, "User not found!");

    if (user.isVerified) {
      return ApiError(402, false, "User is already verified!");
    }

    const isValidCode = user.otp === code;
    const isExpired = new Date(user.otpExpiry as Date) < new Date();

    if (!isValidCode) {
      return ApiError(401, false, "Otp is not correct!");
    }
    if (isExpired) {
      return ApiError(401, false, "Otp is expired! Please sign-up again");
    }

    user.isVerified = true;
    user.otp = ""; // Clear the OTP after successful verification
    user.otpExpiry = undefined; // Clear the OTP expiry date
    await user.save();

    // Extracting those fields which I don't want to sent to the frontend from the user
    // const userData = (({ otp, otpExpiry, password, ...object }) => object)(
    //     user
    // ); // Remove properties verificationToken, verificationTokenExpiry, and password

    return ApiResponse<IUser>(201, true, "User verified successfully");
  } catch (error) {
    console.error("Error in verifying the user", error);
    return ApiError(401, false, "Error in verifying the user");
  }
}
