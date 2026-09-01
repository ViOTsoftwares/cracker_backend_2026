import express from "express";

import * as AdminCrt from "../controllers/admin.js";
import { adminAuthMiddleware } from "../middlewares/auth.middleware.js";
import { adminPermission } from "../middlewares/permission.middleware.js";
import * as SettingCrt from "../controllers/settings.js";
import * as ProductCrt from "../controllers/product.js";
import * as BlogCrt from "../controllers/blog.js";
import * as CMSCrt from "../controllers/cms.js";
import * as TestimonialCrt from "../controllers/testimonial.js";
import * as ModuleCrt from "../controllers/module.js";
import * as EmailTemplateCrt from "../controllers/emailTemplate.js";
import * as CategoryCrt from "../controllers/category.js";
import * as BannerCrt from "../controllers/banner.js";
import * as OrderCrt from "../controllers/order.js";
import * as NotificationCrt from "../controllers/notification.js";
import * as UserCrt from "../controllers/user.js";

import { uploadLogo, uploadProduct, uploadCategory, uploadProfileImage, uploadBanner } from "../lib/multer.js";

const router = express.Router();

router.post("/login", AdminCrt.adminLogin);
router.patch("/change-password", adminAuthMiddleware, AdminCrt.changePassword);
router.post("/logout", AdminCrt.adminLogout);
router.get("/me", adminAuthMiddleware, AdminCrt.getMe);
router.put("/update-profile", adminAuthMiddleware, uploadProfileImage.single("profileImage"), AdminCrt.updateProfile);

// admins
router
  .route("/admin")
  .get(adminAuthMiddleware, adminPermission("Admin", "view"), AdminCrt.AdminList)
  .post(adminAuthMiddleware, adminPermission("Admin", "add"), AdminCrt.CreateAdmin)
  .put(adminAuthMiddleware, adminPermission("Admin", "edit"), AdminCrt.UpdateAdmin)
  .delete(
    adminAuthMiddleware,
    adminPermission("Admin", "delete"),
    AdminCrt.DeleteAdmin,
  );
router.get(
  "/admin/:id",
  adminAuthMiddleware,
  adminPermission("Admin", "view"),
  AdminCrt.OneAdmin,
);

// settings
router
  .route("/settings")
  .get(adminAuthMiddleware, SettingCrt.GetSetting)
  .post(
    adminAuthMiddleware,
    uploadLogo.fields([
      { name: "logo", maxCount: 1 },
      { name: "favicon", maxCount: 1 },
    ]),
    SettingCrt.UpdateSetting,
  );

// blog
router
  .route("/blog")
  .get(adminAuthMiddleware, BlogCrt.BlogList)
  .post(adminAuthMiddleware, BlogCrt.CreateBlog)
  .put(adminAuthMiddleware, BlogCrt.UpdateBlog)
  .delete(adminAuthMiddleware, BlogCrt.DeleteBlog);
router.get("/blog/:id", adminAuthMiddleware, BlogCrt.OneBlog);

// dashboard
router.route("/dashboard").get(adminAuthMiddleware, AdminCrt.getAllDataCounts);

// category
router
  .route("/category")
  .get(adminAuthMiddleware, CategoryCrt.CategoryList)
  .post(
    adminAuthMiddleware,
    uploadCategory.single("image"),
    CategoryCrt.CreateCategory,
  )
  .put(
    adminAuthMiddleware,
    uploadCategory.single("image"),
    CategoryCrt.UpdateCategory,
  )
  .delete(adminAuthMiddleware, CategoryCrt.DeleteCategory);
router.get("/category/:id", adminAuthMiddleware, CategoryCrt.OneCategory);

// product
router
  .route("/product")
  .get(adminAuthMiddleware, ProductCrt.ProductList)
  .post(
    adminAuthMiddleware,
    uploadProduct.array("images", 10),
    ProductCrt.CreateProduct,
  )
  .put(
    adminAuthMiddleware,
    uploadProduct.array("images", 10),
    ProductCrt.UpdateProduct,
  )
  .delete(adminAuthMiddleware, ProductCrt.DeleteProduct);
router.get("/product/export-all", adminAuthMiddleware, ProductCrt.ExportProducts);
router.post("/product/import", adminAuthMiddleware, ProductCrt.ImportProducts);
router.get("/product/:id", adminAuthMiddleware, ProductCrt.OneProduct);

// order
router.get("/orders", adminAuthMiddleware, OrderCrt.getAllOrdersAdmin);
router.get("/orders/export-all", adminAuthMiddleware, OrderCrt.exportOrdersAdmin);
router.put("/orders/:id/status", adminAuthMiddleware, OrderCrt.updateOrderStatusAdmin);

// CMS
router
  .route("/cms")
  .get(adminAuthMiddleware, CMSCrt.CMSList)
  .post(adminAuthMiddleware, CMSCrt.CreateCMS)
  .put(adminAuthMiddleware, CMSCrt.UpdateCMS)
  .delete(adminAuthMiddleware, CMSCrt.DeleteCMS);
router.get("/cms/:id", adminAuthMiddleware, CMSCrt.OneCMS);

// Email Templates
router
  .route("/email-template")
  .get(adminAuthMiddleware, EmailTemplateCrt.EmailTemplateList)
  .post(adminAuthMiddleware, EmailTemplateCrt.CreateEmailTemplate)
  .put(adminAuthMiddleware, EmailTemplateCrt.UpdateEmailTemplate)
  .delete(adminAuthMiddleware, EmailTemplateCrt.DeleteEmailTemplate);
router.get(
  "/email-template/:id",
  adminAuthMiddleware,
  EmailTemplateCrt.OneEmailTemplate,
);

// Modules
router
  .route("/module")
  .get(adminAuthMiddleware, ModuleCrt.ModuleList)
  .post(adminAuthMiddleware, ModuleCrt.CreateModule)
  .put(adminAuthMiddleware, ModuleCrt.UpdateModule)
  .delete(adminAuthMiddleware, ModuleCrt.DeleteModule);
router.get("/module/:id", adminAuthMiddleware, ModuleCrt.OneModule);

// TestimonialCrt
router
  .route("/testimonial")
  .get(adminAuthMiddleware, TestimonialCrt.TestimonialList)
  .post(
    adminAuthMiddleware,
    uploadLogo.single("logo"),
    TestimonialCrt.CreateTestimonial,
  )
  .put(
    adminAuthMiddleware,
    uploadLogo.single("logo"),
    TestimonialCrt.UpdateTestimonial,
  )
  .delete(adminAuthMiddleware, TestimonialCrt.DeleteTestimonial);
router.get(
  "/testimonial/:id",
  adminAuthMiddleware,
  TestimonialCrt.OneTestimonial,
);

// Banners
router
  .route("/banner")
  .get(adminAuthMiddleware, BannerCrt.BannerList)
  .post(
    adminAuthMiddleware,
    uploadBanner.fields([
      { name: "desktopImage", maxCount: 1 },
      { name: "mobileImage", maxCount: 1 },
    ]),
    BannerCrt.CreateBanner,
  )
  .put(
    adminAuthMiddleware,
    uploadBanner.fields([
      { name: "desktopImage", maxCount: 1 },
      { name: "mobileImage", maxCount: 1 },
    ]),
    BannerCrt.UpdateBanner,
  )
  .delete(adminAuthMiddleware, BannerCrt.DeleteBanner);
router.get(
  "/banner/:id",
  adminAuthMiddleware,
  BannerCrt.OneBanner,
);

// Notifications
router.get("/notifications", adminAuthMiddleware, NotificationCrt.getNotifications);
router.put("/notifications/:id/read", adminAuthMiddleware, NotificationCrt.markAsRead);

// Users
router.get("/users", adminAuthMiddleware, UserCrt.UserListAdmin);
router.get("/users/:id", adminAuthMiddleware, UserCrt.OneUserAdmin);

export default router;
