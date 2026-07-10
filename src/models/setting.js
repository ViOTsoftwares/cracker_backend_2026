import mongoose from "mongoose";
import { getImageUrl } from "../lib/imageHelper.js";

const { Schema } = mongoose;

const SettingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    project: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    client: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      default: "",
      lowercase: true,
    },
    logo: {
      type: String,
      default: "",
      required: true,
    },
    xlink: {
      type: String,
      default: "",
      required: false,
    },
    linkedinlink: {
      type: String,
      default: "",
      required: false,
    },
    instagramlink: {
      type: String,
      default: "",
      required: false,
    },
    facebooklink: {
      type: String,
      default: "",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

SettingSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.logo) {
      ret.logo = getImageUrl(ret.logo, "logos");
    }
    return ret;
  }
});

SettingSchema.set("toObject", {
  transform: (doc, ret) => {
    if (ret.logo) {
      ret.logo = getImageUrl(ret.logo, "logos");
    }
    return ret;
  }
});

export default mongoose.model("setting", SettingSchema, "setting");
