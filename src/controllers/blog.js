import BlogModel from "../models/blog.js";
import { Pagination } from "../lib/pagination.js";
import { ColumnFilter } from "../lib/columnFilter.js";

export const CreateBlog = async (req, res) => {
  try {
    const { title, slug, content, status } = req.body;
    const newData = await BlogModel.create({
      title,
      slug,
      content,
      status,
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
export const BlogList = async (req, res) => {
  try {
    let { page, limit, filter } = req.query;
    filter = ColumnFilter(filter);
    const sort = { createdAt: -1 };
    const { skip } = Pagination({ page, limit });
    const list = await BlogModel.find(filter || {})
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const count = await BlogModel.countDocuments(filter || {});

    return res.status(200).json({
      success: true,
      message: "Get all blogs",
      result: { list, count },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const UpdateBlog = async (req, res) => {
  try {
    const { title, slug, content, status, id } = req.body;
    const existingSetting = await BlogModel.findById(id);
    if (!existingSetting) {
      return res.status(404).json({ message: "Blog not found" });
    }
    await BlogModel.updateOne(
      { _id: existingSetting._id },
      {
        title,
        slug,
        content,
        status,
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

export const OneBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await BlogModel.findById(id);
    return res.status(200).json({
      success: true,
      message: "Get all blogs",
      result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
export const DeleteBlog = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await BlogModel.findById(id);

    await BlogModel.deleteOne({ _id: id });
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
