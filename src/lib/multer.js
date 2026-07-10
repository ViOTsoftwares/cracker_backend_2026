import multer from "multer";
import path from "path";
import fs from "fs";

// Storage config
const LogoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "src/uploads/logos");
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});


// Image-only filter
const fileFilter = (_req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("Only image files (PNG, JPG, WEBP) are allowed"));
  } else {
    cb(null, true);
  }
};

// Multer instance
export const uploadLogo = multer({
  storage:LogoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter,
});


const ProductStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "src/uploads/products");
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const CategoryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "src/uploads/categories");
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

export const uploadProduct = multer({
  storage: ProductStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

export const uploadCategory = multer({
  storage: CategoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter,
});

const ProfileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = "src/uploads/profiles";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

export const uploadProfileImage = multer({
  storage: ProfileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter,
});

const BannerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = "src/uploads/banners";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

export const uploadBanner = multer({
  storage: BannerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

