import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import adminRouter from "./routes/admin.router.js";
import publicRouter from "./routes/public.router.js";
// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect environment
const env = process.env.NODE_ENV || "dev";

// Load correct env file
dotenv.config({
  path: path.join(__dirname, "env", `.env.${env}`),
});

console.log("ENV FILE =>", `.env.${env}`);
console.log("MONGO_URI =>", process.env.MONGO_URI);
import qs from "qs";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/DB.js";
import { ENV } from "./config/env.js";

const app = express();

app.use(express.json());
const allowedOrigins = ENV.ALLOW_ORIGIN?.split(",")?.map((origin) => origin.trim());
console.log("allowedOrigins", allowedOrigins);
app.set("query parser", (str) => qs.parse(str));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use("/image", express.static(path.join(__dirname, "./uploads")));
app.use("/api/admin", adminRouter);
app.use("/api/public", publicRouter);
connectDB();

export default app;
