import fs from "fs";
import path from "path";
import { ProductModel, CategoryModel } from "../models/index.js";
import { Pagination } from "../lib/pagination.js";
import { ColumnFilter } from "../lib/columnFilter.js";
import { ENV } from "../config/env.js";
import { getFilenameOnly, deleteFile } from "../lib/imageHelper.js";

export const CreateProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      brand,
      originalPrice,
      offerPrice,
      stock,
      safetyInfo,
      isFeatured,
      notes,
    } = req.body;

    // Parse uploaded files
    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file) => file.filename);
    } else if (req.file) {
      images = [req.file.filename];
    }

    const newData = await ProductModel.create({
      name,
      slug,
      category,
      brand,
      images,
      originalPrice: Number(originalPrice || 0),
      offerPrice: Number(offerPrice || 0),
      stock: Number(stock || 0),
      safetyInfo,
      notes,
      isFeatured: isFeatured === "true" || isFeatured === true,
    });

    return res
      .status(200)
      .json({ success: true, message: "Product added successfully", result: newData });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product slug already exists",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const ProductList = async (req, res) => {
  try {
    let { page, limit, filter } = req.query;
    filter = ColumnFilter(filter);
    const { skip } = Pagination({ page, limit });
    const sort = { createdAt: -1 };

    // Support searching product by name
    if (filter && filter.name) {
      filter.name = { $regex: filter.name, $options: "i" };
    }

    const list = await ProductModel.find(filter || {})
      .populate("category", "name")
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const count = await ProductModel.countDocuments(filter || {});

    return res.status(200).json({
      success: true,
      message: "Get all products",
      result: { list, count },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const UpdateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      slug,
      category,
      brand,
      originalPrice,
      offerPrice,
      stock,
      safetyInfo,
      isFeatured,
      existingImages,
      notes,
    } = req.body;

    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Keep existing images that weren't deleted
    let images = [];
    if (existingImages) {
      const arr = Array.isArray(existingImages)
        ? existingImages
        : [existingImages];
      images = arr.map(getFilenameOnly);
    }

    // Identify deleted images to remove from disk
    const existingFilenames = existingProduct.images.map(getFilenameOnly);
    const deletedFilenames = existingFilenames.filter(
      (img) => !images.includes(img),
    );
    for (const delImg of deletedFilenames) {
      deleteFile(delImg, "products");
    }

    // Add new images
    if (req.files && Array.isArray(req.files)) {
      const newImages = req.files.map((file) => file.filename);
      images = [...images, ...newImages];
    } else if (req.file) {
      images.push(req.file.filename);
    }

    // Calculate discount
    const origPriceNum = Number(originalPrice || 0);
    const offPriceNum = Number(offerPrice || 0);
    const discountPercentage = origPriceNum
      ? Math.round(((origPriceNum - offPriceNum) / origPriceNum) * 100)
      : 0;

    await ProductModel.updateOne(
      { _id: existingProduct._id },
      {
        name,
        slug,
        category,
        brand,
        images,
        originalPrice: origPriceNum,
        offerPrice: offPriceNum,
        discountPercentage,
        stock: Number(stock || 0),
        safetyInfo,
        notes,
        isFeatured: isFeatured === "true" || isFeatured === true,
      },
    );

    return res
      .status(200)
      .json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product slug already exists",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const OneProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProductModel.findById(id).populate("category", "name");
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Get product details",
      result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const DeleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await ProductModel.findById(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete image files from disk
    if (result.images && Array.isArray(result.images)) {
      for (const img of result.images) {
        const filename = getFilenameOnly(img);
        deleteFile(filename, "products");
      }
    }

    await ProductModel.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const ExportProducts = async (req, res) => {
  try {
    const list = await ProductModel.find({}).populate("category", "name");
    return res.status(200).json({
      success: true,
      message: "Export all products",
      result: list,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const ImportProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ success: false, message: "Invalid product list" });
    }

    // Get all categories to match by name
    const categories = await CategoryModel.find({});
    const categoryMap = new Map(categories.map(c => [c.name.trim().toLowerCase(), c._id]));

    const importedProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const rowNum = i + 2; // Row number in CSV including header

      if (!p.name || !p.name.trim()) {
        errors.push(`Row ${rowNum}: Name is required`);
        continue;
      }

      if (!p.categoryName || !p.categoryName.trim()) {
        errors.push(`Row ${rowNum}: Category Name is required`);
        continue;
      }

      const catId = categoryMap.get(p.categoryName.trim().toLowerCase());
      if (!catId) {
        errors.push(`Row ${rowNum}: Category "${p.categoryName}" does not exist. Please create the category first.`);
        continue;
      }

      const origPrice = Number(p.originalPrice);
      const offPrice = Number(p.offerPrice);
      if (isNaN(origPrice) || origPrice < 0) {
        errors.push(`Row ${rowNum}: Invalid originalPrice`);
        continue;
      }
      if (isNaN(offPrice) || offPrice < 0) {
        errors.push(`Row ${rowNum}: Invalid offerPrice`);
        continue;
      }

      // Generate slug if not provided, or ensure slug format
      let slug = p.slug ? p.slug.trim() : "";
      if (!slug) {
        slug = p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }

      // Ensure slug uniqueness (append random or incremented number if duplicate)
      let uniqueSlug = slug;
      let counter = 1;
      while (await ProductModel.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const stockNum = p.stock ? Number(p.stock) : 0;
      const isFeaturedBool = p.isFeatured === "true" || p.isFeatured === true || String(p.isFeatured).toLowerCase() === "yes" || String(p.isFeatured).toLowerCase() === "true";

      const discountPercentage = origPrice
        ? Math.round(((origPrice - offPrice) / origPrice) * 100)
        : 0;

      importedProducts.push({
        name: p.name.trim(),
        slug: uniqueSlug,
        category: catId,
        brand: p.brand ? p.brand.trim() : "",
        originalPrice: origPrice,
        offerPrice: offPrice,
        discountPercentage,
        stock: isNaN(stockNum) ? 0 : stockNum,
        safetyInfo: p.safetyInfo ? p.safetyInfo.trim() : "",
        notes: p.notes ? p.notes.trim() : "",
        isFeatured: isFeaturedBool,
        images: [], // No images uploaded during bulk CSV import
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Import failed due to validation errors",
        errors,
      });
    }

    if (importedProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products found to import",
      });
    }

    await ProductModel.insertMany(importedProducts);

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${importedProducts.length} products`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during import",
    });
  }
};
