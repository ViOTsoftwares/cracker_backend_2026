import mongoose from "mongoose";

const CMSSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    identifier: { type: String, required: true, unique: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Page", CMSSchema);
