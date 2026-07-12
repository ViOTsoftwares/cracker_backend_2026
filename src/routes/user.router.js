import express from "express";
import * as UserAuth from "../controllers/userAuth.js";
import * as UserCtrl from "../controllers/user.js";
import * as OrderCtrl from "../controllers/order.js";
import { userAuthMiddleware } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../lib/multer.js";

const router = express.Router();

// ── Authentication Routes (Public) ──
router.post("/auth/send-otp", UserAuth.sendOTP);
router.post("/auth/verify-otp", UserAuth.verifyOTP);
router.post("/auth/google", UserAuth.googleLogin);

// ── Profile Routes (Authenticated) ──
router.get("/profile", userAuthMiddleware, UserCtrl.getProfile);
router.put(
  "/profile",
  userAuthMiddleware,
  uploadProfileImage.single("profileImage"),
  UserCtrl.updateProfile
);

// ── Address Management Routes (Authenticated) ──
router
  .route("/address")
  .get(userAuthMiddleware, UserCtrl.getAddresses)
  .post(userAuthMiddleware, UserCtrl.addAddress);

router
  .route("/address/:addressId")
  .put(userAuthMiddleware, UserCtrl.updateAddress)
  .delete(userAuthMiddleware, UserCtrl.deleteAddress);

// ── Order Management Routes (Authenticated) ──
router
  .route("/orders")
  .get(userAuthMiddleware, OrderCtrl.getMyOrders)
  .post(userAuthMiddleware, OrderCtrl.createOrder);

router.get("/orders/:id", userAuthMiddleware, OrderCtrl.getOrderDetails);

export default router;
