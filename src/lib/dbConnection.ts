import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

const dbConnect = async () => {
  if (connection.isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    const db = await mongoose.connect(
      `${process.env.MONGODB_URI as string}/${process.env.DB_NAME}`
    );
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB", connection.isConnected);

    // Explicitly import models to ensure registration
    await import("@/models/user.model");
    await import("@/models/post.model");
    await import("@/models/comment.model");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default dbConnect;
