import { CMSModel } from "../models/index.js";
import { Pagination } from "../lib/pagination.js";
import { ColumnFilter } from "../lib/columnFilter.js";

export const CreateCMS = async (req, res) => {
  try {
    const { title, identifier, content } = req.body;

    const newData = await CMSModel.create({
      title,
      identifier,
      content,
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
export const CMSList = async (req, res) => {
  try {
    console.log("req.query---", req.query);

    let { page, limit, filter } = req.query;
    filter = ColumnFilter(filter);
    const { skip } = Pagination({ page, limit });
    console.log("-----", filter, limit, page);
    const sort = { createdAt: -1 };
    const list = await CMSModel.find(filter || {})
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const count = await CMSModel.countDocuments(filter || {});

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

export const UpdateCMS = async (req, res) => {
  try {
    const { title, identifier, content, id } = req.body;
    const existingData = await CMSModel.findById(id);
    await CMSModel.updateOne(
      { _id: existingData._id },
      {
        title,
        identifier,
        content,
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

export const OneCMS = async (req, res) => {
  try {
    console.log("req.query---", req.params);
    const { id } = req.params;
    const result = await CMSModel.findById(id);
    return res.status(200).json({
      success: true,
      message: "Get all projects",
      result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
export const DeleteCMS = async (req, res) => {
  try {
    console.log("req.query---", req.query);
    const { id } = req.body;

    await CMSModel.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: "Deleted succcessfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
