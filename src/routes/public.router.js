import express from "express";
import { ProductModel, CategoryModel, BannerModel } from "../models/index.js";

const router = express.Router();

// GET /api/public/categories
router.get("/categories", async (req, res) => {
  try {
    const list = await CategoryModel.find({}).sort({ name: 1 });
    return res.status(200).json({ success: true, result: list });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// GET /api/public/banners
router.get("/banners", async (req, res) => {
  try {
    const list = await BannerModel.find({ status: "active" }).sort({ sortOrder: 1 });
    return res.status(200).json({ success: true, result: list });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// GET /api/public/products
router.get("/products", async (req, res) => {
  try {
    let { page, limit, search, category, sort, minPrice, maxPrice } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.offerPrice = {};
      if (minPrice) filter.offerPrice.$gte = Number(minPrice);
      if (maxPrice) filter.offerPrice.$lte = Number(maxPrice);
    }

    let sortObj = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { offerPrice: 1 };
    else if (sort === "price_desc") sortObj = { offerPrice: -1 };
    else if (sort === "popular") sortObj = { ratings: -1 };
    else if (sort === "newest") sortObj = { createdAt: -1 };

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const list = await ProductModel.find(filter)
      .populate("category", "name slug image")
      .limit(limitNum)
      .skip(skip)
      .sort(sortObj);

    const count = await ProductModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      result: { list, count, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// GET /api/public/products/:slug
router.get("/products/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await ProductModel.findOne({ slug }).populate("category", "name slug image");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, result: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// GET /api/public/featured — isFeatured products
router.get("/featured", async (req, res) => {
  try {
    const list = await ProductModel.find({ isFeatured: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(8);
    return res.status(200).json({ success: true, result: list });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// GET /api/public/products/related/:slug
router.get("/products/related/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await ProductModel.findOne({ slug });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const related = await ProductModel.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .populate("category", "name slug image")
      .limit(4);
    return res.status(200).json({ success: true, result: related });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

export default router;
