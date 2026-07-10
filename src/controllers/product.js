import fs from "fs";
import path from "path";
import { ProductModel } from "../models/index.js";
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
