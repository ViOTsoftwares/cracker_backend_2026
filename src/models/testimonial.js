import mongoose from "mongoose";
import { getImageUrl } from "../lib/imageHelper.js";

const { Schema } = mongoose;

const TestimonialSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true, default: "" },
    logo: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

TestimonialSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.logo) {
      ret.logo = getImageUrl(ret.logo, "logos");
    }
    return ret;
  }
});

TestimonialSchema.set("toObject", {
  transform: (doc, ret) => {
    if (ret.logo) {
      ret.logo = getImageUrl(ret.logo, "logos");
    }
    return ret;
  }
});

export default mongoose.model("testimonial", TestimonialSchema, "testimonial");
