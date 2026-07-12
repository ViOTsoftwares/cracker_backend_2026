import mongoose from "mongoose";

const { Schema } = mongoose;

const BannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desktopImage: {
      type: String,
      required: true,
    },
    mobileImage: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("banner", BannerSchema, "banner");
