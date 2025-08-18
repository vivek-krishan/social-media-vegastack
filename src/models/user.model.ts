import mongoose, { Document, Schema } from "mongoose";
import PostModel from "./post.model";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobile: number;
  password: string;
  follower?: mongoose.Types.ObjectId[];
  following?: mongoose.Types.ObjectId[];
  post?: mongoose.Types.ObjectId[];
  otp?: string;
  otpExpiry?: Date;
  role: "user" | "admin";
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    follower: [{ type: mongoose.Types.ObjectId, ref: "UserModel" }],
    following: [{ type: mongoose.Types.ObjectId, ref: "UserModel" }],
    post: [{ type: mongoose.Types.ObjectId, ref: "PostModel" }], // Posts created by the user
    otp: { type: String },
    otpExpiry: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  (mongoose.models.UserModel as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("UserModel", userSchema);

export default UserModel;
