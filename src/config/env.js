import dotenv from "dotenv";
import path from "path";

const NODE_ENV = process.env.NODE_ENV || "dev";
console.log("------->", process.env.NODE_ENV);
dotenv.config({
  path: path.resolve(`env/.env.${NODE_ENV}`),
});

console.log(`Environment loaded: ${NODE_ENV}`);

export const ENV = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  IMAGE_URL: process.env.IMAGE_URL,
  TINY_API_KEY: process.env.TINY_API_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  PORT: process.env.PORT,
  ALLOW_ORIGIN: process.env.ALLOW_ORIGIN,
  FRONTEND_URL: process.env.FRONTEND_URL,
};
