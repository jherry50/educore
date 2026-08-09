import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGO_URI);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed");

    console.error(error);

    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}