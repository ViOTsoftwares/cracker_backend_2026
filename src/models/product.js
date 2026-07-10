import mongoose from "mongoose";
const { Schema } = mongoose;
const ReviewSchema = new Schema(
    {
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "" },
    },
    {
        timestamps: true,
    },
);
const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "category",
            required: true,
        },
        brand: {
            type: String,
            default: "",
            trim: true,
        },
        images: {
            type: [String],
            default: [],
        },
        originalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        offerPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        discountPercentage: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        safetyInfo: {
            type: String,
            default: "",
        },
        notes: {
            type: String,
            default: "",
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        ratings: {
            type: Number,
            default: 0,
        },
        reviews: [ReviewSchema],
    },
    {
        timestamps: true,
    },
);
import { getImageUrl } from "../lib/imageHelper.js";

ProductSchema.pre("save", function () {
    if (this.originalPrice && this.offerPrice) {
        this.discountPercentage = Math.round(
            ((this.originalPrice - this.offerPrice) / this.originalPrice) * 100,
        );
    } else {
        this.discountPercentage = 0;
    }
});

ProductSchema.set("toJSON", {
    transform: (doc, ret) => {
        if (ret.images && Array.isArray(ret.images)) {
            ret.images = ret.images.map(img => getImageUrl(img, "products"));
        }
        return ret;
    }
});

ProductSchema.set("toObject", {
    transform: (doc, ret) => {
        if (ret.images && Array.isArray(ret.images)) {
            ret.images = ret.images.map(img => getImageUrl(img, "products"));
        }
        return ret;
    }
});

export default mongoose.model("product", ProductSchema, "product");