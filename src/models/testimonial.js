import mongoose from "mongoose";

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

export default mongoose.model("testimonial", TestimonialSchema, "testimonial");
