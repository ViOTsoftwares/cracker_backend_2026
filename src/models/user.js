import mongoose from "mongoose";

const { Schema } = mongoose;

const AddressSchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // e.g. "Home", "Work"
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserSchema = new Schema(
  {
    name: { type: String, default: "", trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: "", trim: true },
    profileImage: { type: String, default: "" },
    googleId: { type: String, unique: true, sparse: true },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

export default mongoose.model("user", UserSchema, "user");
