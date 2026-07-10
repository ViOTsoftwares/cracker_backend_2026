import mongoose from "mongoose";

const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

import { getImageUrl } from "../lib/imageHelper.js";

CategorySchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.image) {
      ret.image = getImageUrl(ret.image, "categories");
    }
    return ret;
  }
});

CategorySchema.set("toObject", {
  transform: (doc, ret) => {
    if (ret.image) {
      ret.image = getImageUrl(ret.image, "categories");
    }
    return ret;
  }
});

export default mongoose.model("category", CategorySchema, "category");
