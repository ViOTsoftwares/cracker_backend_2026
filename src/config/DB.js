import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("✅ DB connected to", ENV.MONGO_URI);
  } catch (error) {
    console.error("❌ DB connection failed");
    console.error(error.message);
    process.exit(1);
  }
};
