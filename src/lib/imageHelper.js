import { ENV } from "../config/env.js";
import fs from "fs";
import path from "path";

export const getImageUrl = (filename, folder) => {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  return `${ENV.IMAGE_URL}/${folder}/${filename}`;
};

export const getFilenameOnly = (imgStr) => {
  if (!imgStr) return "";
  if (imgStr.includes("/")) {
    return imgStr.substring(imgStr.lastIndexOf("/") + 1);
  }
  return imgStr;
};

export const deleteFile = (filename, folder) => {
  if (!filename) return;
  let fileRelativePath;
  if (filename.includes("/image/")) {
    fileRelativePath = filename.split("/image/")[1];
  } else if (filename.startsWith("http://") || filename.startsWith("https://")) {
    fileRelativePath = filename.substring(filename.lastIndexOf("/") + 1);
    fileRelativePath = `${folder}/${fileRelativePath}`;
  } else {
    fileRelativePath = `${folder}/${filename}`;
  }
  const filePath = path.join(process.cwd(), "src/uploads", fileRelativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
