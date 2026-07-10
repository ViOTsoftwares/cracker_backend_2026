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

import { getImageUrl } from "../lib/imageHelper.js";

BannerSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.desktopImage) {
      ret.desktopImage = getImageUrl(ret.desktopImage, "banners");
    }
    if (ret.mobileImage) {
      ret.mobileImage = getImageUrl(ret.mobileImage, "banners");
    }
    return ret;
  }
});

BannerSchema.set("toObject", {
  transform: (doc, ret) => {
    if (ret.desktopImage) {
      ret.desktopImage = getImageUrl(ret.desktopImage, "banners");
    }
    if (ret.mobileImage) {
      ret.mobileImage = getImageUrl(ret.mobileImage, "banners");
    }
    return ret;
  }
});

export default mongoose.model("banner", BannerSchema, "banner");
