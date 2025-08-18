import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "UserModel", required: true },
    post: { type: Schema.Types.ObjectId, ref: "PostModel", required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const CommentModel =
  (mongoose.models.CommentModel as mongoose.Model<IComment>) ||
  mongoose.model<IComment>("CommentModel", commentSchema);

export default CommentModel;
