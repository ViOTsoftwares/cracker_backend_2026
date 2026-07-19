import mongoose from "mongoose";

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
    deliveryFee: {
      type: Number,
      default: 0,
      required: false,
    },
    deliveryFeeType: {
      type: String,
      default: "free",
      enum: ["free", "fixed", "percentage"],
      required: false,
    },
    footerShopLinks: [
      {
        label: { type: String, required: true },
        link: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("setting", SettingSchema, "setting");
