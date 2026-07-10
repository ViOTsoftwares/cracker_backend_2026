import fs from "fs";
import path from "path";
import { Pagination } from "../lib/pagination.js";
import { ColumnFilter } from "../lib/columnFilter.js";
import { TestimonialModel } from "../models/index.js";
import { ENV } from "../config/env.js";
import { getFilenameOnly, deleteFile } from "../lib/imageHelper.js";

export const CreateTestimonial = async (req, res) => {
  try {
    const { title, description, name } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
    const file = req.file;
    const logo = file.filename;

    const newData = await TestimonialModel.create({
      title,
      description,
      logo,
      name,
    });

    return res
      .status(200)
      .json({ success: true, message: "Added successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
export const TestimonialList = async (req, res) => {
  try {
    console.log("req.query---", req.query);

    let { page, limit, filter } = req.query;
    filter = ColumnFilter(filter);
    const { skip } = Pagination({ page, limit });
    console.log("-----", filter, limit, page);
    const sort = { createdAt: -1 };
    const list = await TestimonialModel.find(filter || {})
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const count = await TestimonialModel.countDocuments(filter || {});

    return res.status(200).json({
      success: true,
      message: "Get all projects",
      result: { list, count },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const UpdateTestimonial = async (req, res) => {
  try {
    const { title, description, name, id } = req.body;
    const file = req.file;
    // Find existing setting
    const existingData = await TestimonialModel.findById(id);
    if (!existingData) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    //  Delete old image if exists
    if (existingData.logo && file?.filename) {
      deleteFile(existingData.logo, "logos");
    }

    let logo;
    if (file?.filename) {
      logo = file.filename;
    } else {
      logo = getFilenameOnly(existingData.logo);
    }

    // Update DB
    await TestimonialModel.updateOne(
      { _id: existingData._id },
      {
        title,
        description,
        logo,
        name,
      },
    );

    return res
      .status(200)
      .json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const OneTestimonial = async (req, res) => {
  try {
    console.log("req.query---", req.params);
    const { id } = req.params;
    const result = await TestimonialModel.findById(id);
    return res.status(200).json({
      success: true,
      message: "Get one projects",
      result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
export const DeleteTestimonial = async (req, res) => {
  try {
    console.log("req.query---", req.query);
    const { id } = req.body;
    const result = await TestimonialModel.findById(id);
    if (result.logo && result) {
      deleteFile(result.logo, "logos");
    }
    await TestimonialModel.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: "Deleted succcessfully",
      result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
