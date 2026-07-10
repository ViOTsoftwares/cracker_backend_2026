import mongoose from "mongoose";
import { getImageUrl } from "../lib/imageHelper.js";

const { Schema } = mongoose;

const AdminSchema = new Schema(
  {
    username: { type: String, default: "" },
    email: { type: String, default: "", unique: true },
    password: { type: String, default: "" },
    role: { type: String, default: "subadmin" },
    restriction: { type: Array, default: [] },
    profileImage: { type: String, default: "" },
    phone: { type: String, default: "" },

  },
  {
    timestamps: true,
  }
);

AdminSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.profileImage) {
      ret.profileImage = getImageUrl(ret.profileImage, "profiles");
    }
    return ret;
  }
});

AdminSchema.set("toObject", {
  transform: (doc, ret) => {
    if (ret.profileImage) {
      ret.profileImage = getImageUrl(ret.profileImage, "profiles");
    }
    return ret;
  }
});

export default mongoose.model("admin", AdminSchema, "admin");
