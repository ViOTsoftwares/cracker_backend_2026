import fs from "fs";
import path from "path";
import { CategoryModel } from "../models/index.js";
import { Pagination } from "../lib/pagination.js";
import { ColumnFilter } from "../lib/columnFilter.js";
import { ENV } from "../config/env.js";
import { getFilenameOnly, deleteFile } from "../lib/imageHelper.js";

export const CreateCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    let image = "";
    if (req.file) {
      image = req.file.filename;
    }

    const newData = await CategoryModel.create({
      name,
      slug,
      description,
      image,
    });

    return res
      .status(200)
      .json({ success: true, message: "Added successfully", result: newData });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name or slug already exists",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const CategoryList = async (req, res) => {
  try {
    let { page, limit, filter, all } = req.query;
    if (all === "true") {
      const list = await CategoryModel.find({}).sort({ name: 1 });
      return res.status(200).json({
        success: true,
        message: "Get all categories",
        result: { list, count: list.length },
      });
    }

    filter = ColumnFilter(filter);
    const { skip } = Pagination({ page, limit });
    const sort = { createdAt: -1 };
    const list = await CategoryModel.find(filter || {})
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const count = await CategoryModel.countDocuments(filter || {});

    return res.status(200).json({
      success: true,
      message: "Get categories list",
      result: { list, count },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const UpdateCategory = async (req, res) => {
  try {
    const { name, slug, description, id } = req.body;
    const file = req.file;

    const existingCategory = await CategoryModel.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (existingCategory.image && file?.filename) {
      deleteFile(existingCategory.image, "categories");
    }

    let image;
    if (file?.filename) {
      image = file.filename;
    } else {
      image = getFilenameOnly(existingCategory.image);
    }

    await CategoryModel.updateOne(
      { _id: existingCategory._id },
      {
        name,
        slug,
        description,
        image,
      },
    );

    return res
      .status(200)
      .json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name or slug already exists",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const OneCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CategoryModel.findById(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Get category details",
      result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const DeleteCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await CategoryModel.findById(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (result.image) {
      deleteFile(result.image, "categories");
    }

    await CategoryModel.deleteOne({ _id: id });
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
