import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  caption: string;
  image: { url: string; fileId: string };
  user: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    caption: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      fileId: { type: String, required: true },
    },
    user: { type: Schema.Types.ObjectId, ref: "UserModel", required: true }, // Create of the post
    likes: [{ type: mongoose.Types.ObjectId, ref: "UserModel" }], // array of all the users who have liked this post
    comments: [{ type: mongoose.Types.ObjectId, ref: "CommentModel" }],
  },
  { timestamps: true }
);

const PostModel =
  (mongoose.models.PostModel as mongoose.Model<IPost>) ||
  mongoose.model<IPost>("PostModel", postSchema);
export default PostModel;
