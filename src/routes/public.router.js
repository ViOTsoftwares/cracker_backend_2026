import express from "express";
import { ProductModel, CategoryModel, BannerModel, SettingModel } from "../models/index.js";
import { ENV } from "../config/env.js";

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

// GET /api/public/settings
router.get("/settings", async (req, res) => {
  try {
    const result = await SettingModel.findOne();
    return res.status(200).json({ success: true, result });
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

// GET /api/public/share/product/:slug
router.get("/share/product/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await ProductModel.findOne({ slug });
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Resolve the primary image URL
    let imageUrl = "";
    if (product.images && product.images.length > 0) {
      const primaryImg = product.images[0];
      if (primaryImg.startsWith("http://") || primaryImg.startsWith("https://")) {
        imageUrl = primaryImg;
      } else {
        const baseUrl = ENV.IMAGE_URL || `${req.protocol}://${req.get("host")}/image`;
        imageUrl = `${baseUrl}/products/${primaryImg}`;
      }
    }

    // Determine the frontend URL where the app is hosted
    let frontendUrl = ENV.FRONTEND_URL || "https://cracker-frontend-2026-theta.vercel.app";
    if (!ENV.FRONTEND_URL && ENV.ALLOW_ORIGIN) {
      const origins = ENV.ALLOW_ORIGIN.split(",").map(o => o.trim());
      const vercelOrigin = origins.find(o => o.includes("vercel.app"));
      if (vercelOrigin) {
        frontendUrl = vercelOrigin;
      } else if (origins.length > 0) {
        const local5173 = origins.find(o => o.includes("5173"));
        if (local5173) {
          frontendUrl = local5173;
        } else {
          frontendUrl = origins[0];
        }
      }
    }

    const productUrl = `${frontendUrl}/products/${product.slug}`;

    // Clean description to avoid breaking HTML attributes
    const cleanDesc = product.description
      ? product.description.replace(/"/g, "&quot;").replace(/\r?\n/g, " ")
      : "Buy premium fireworks online at CrackersSiva!";

    res.setHeader("Content-Type", "text/html");
    return res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${product.name}</title>
    <!-- Open Graph tags for WhatsApp / Facebook / Twitter rich link previews -->
    <meta property="og:title" content="${product.name}" />
    <meta property="og:description" content="${cleanDesc}" />
    ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ""}
    <meta property="og:url" content="${productUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="CrackersSiva" />
    
    <!-- Automatic client redirection to the frontend product page -->
    <script>
      window.location.href = "${productUrl}";
    </script>
    <meta http-equiv="refresh" content="0;url=${productUrl}" />
  </head>
  <body>
    <p>Redirecting to ${product.name} at CrackersSiva...</p>
  </body>
</html>`);
  } catch (error) {
    console.error("Error in share route:", error);
    return res.status(500).send("Something went wrong");
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
