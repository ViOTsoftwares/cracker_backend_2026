import fs from "fs";
import path from "path";
import { Pagination } from "../lib/pagination.js";
import { ColumnFilter } from "../lib/columnFilter.js";
import { BannerModel } from "../models/index.js";
import { ENV } from "../config/env.js";
import { getFilenameOnly, deleteFile } from "../lib/imageHelper.js";

export const CreateBanner = async (req, res) => {
  try {
    const { title, link, status, sortOrder } = req.body;
    
    if (!req.files || !req.files['desktopImage']?.[0]) {
      return res.status(400).json({ message: "Desktop image is required" });
    }
    if (!req.files['mobileImage']?.[0]) {
      return res.status(400).json({ message: "Mobile image is required" });
    }

    const desktopFile = req.files['desktopImage'][0];
    const mobileFile = req.files['mobileImage'][0];

    const desktopImage = desktopFile.filename;
    const mobileImage = mobileFile.filename;

    const newData = await BannerModel.create({
      title,
      link,
      desktopImage,
      mobileImage,
      status: status || "active",
      sortOrder: Number(sortOrder) || 0,
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

export const BannerList = async (req, res) => {
  try {
    let { page, limit, filter } = req.query;
    filter = ColumnFilter(filter);
    const { skip } = Pagination({ page, limit });
    const sort = { sortOrder: 1, createdAt: -1 };
    
    const list = await BannerModel.find(filter || {})
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const count = await BannerModel.countDocuments(filter || {});

    return res.status(200).json({
      success: true,
      message: "Get all banners",
      result: { list, count },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const UpdateBanner = async (req, res) => {
  try {
    const { title, link, status, sortOrder, id } = req.body;
    
    const existingData = await BannerModel.findById(id);
    if (!existingData) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const desktopFile = req.files?.['desktopImage']?.[0];
    const mobileFile = req.files?.['mobileImage']?.[0];

    // Delete old desktop image if a new one is uploaded
    if (desktopFile && existingData.desktopImage) {
      deleteFile(existingData.desktopImage, "banners");
    }

    // Delete old mobile image if a new one is uploaded
    if (mobileFile && existingData.mobileImage) {
      deleteFile(existingData.mobileImage, "banners");
    }

    const desktopImage = desktopFile 
      ? desktopFile.filename 
      : getFilenameOnly(existingData.desktopImage);

    const mobileImage = mobileFile 
      ? mobileFile.filename 
      : getFilenameOnly(existingData.mobileImage);

    await BannerModel.updateOne(
      { _id: existingData._id },
      {
        title,
        link,
        desktopImage,
        mobileImage,
        status: status || "active",
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : existingData.sortOrder,
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

export const OneBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await BannerModel.findById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Get banner successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const DeleteBanner = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await BannerModel.findById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    
    // Delete files
    if (result.desktopImage) {
      deleteFile(result.desktopImage, "banners");
    }
    if (result.mobileImage) {
      deleteFile(result.mobileImage, "banners");
    }

    await BannerModel.deleteOne({ _id: id });
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
