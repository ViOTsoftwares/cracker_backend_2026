import jwt from "jsonwebtoken";
import { UserModel } from "../models/index.js";
import { renderEmailTemplate } from "../lib/mailTemplate.js";
import { sendEmail } from "../config/mail.js";
import { ENV } from "../config/env.js";

// Helper to generate a 6-digit numeric OTP
const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// POST /api/user/auth/send-otp
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Find or create user
    let user = await UserModel.findOne({ email: emailNormalized });
    if (!user) {
      user = await UserModel.create({
        email: emailNormalized,
        isVerified: false,
      });
    }

    if (user.status === "inactive") {
      return res.status(400).json({ success: false, message: "Your account is inactive. Please contact support." });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(`[OTP] Generated OTP ${otp} for ${emailNormalized}`);

    // Try sending email via DB template
    try {
      await renderEmailTemplate("OTP_VERIFICATION", emailNormalized, {
        USER_NAME: user.name || "Customer",
        OTP_CODE: otp,
        EXPIRY_MINUTES: 10,
      });
    } catch (templateError) {
      console.warn("DB Email template rendering failed. Sending fallback OTP email.", templateError);
      
      // Fallback direct email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Verification Code</h2>
          <p>Hello,</p>
          <p>Your one-time verification code (OTP) for logging into your account is:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 30px 0; color: #f97316; background-color: #fff7ed; padding: 15px; border-radius: 8px;">
            ${otp}
          </div>
          <p>This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">This is an automated system email.</p>
        </div>
      `;
      await sendEmail(emailNormalized, "Your Login Verification Code", htmlContent);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("sendOTP error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// POST /api/user/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const emailNormalized = email.toLowerCase().trim();

    const user = await UserModel.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.status === "inactive") {
      return res.status(400).json({ success: false, message: "Your account is inactive. Please contact support." });
    }

    // Verify OTP and Expiration
    if (!user.otp || user.otp !== String(otp) || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Set user as verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Create session token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" } // User tokens are valid for 7 days
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      result: user,
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// POST /api/user/auth/google
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "Google ID token is required" });
    }

    // Verify token with Google's API
    let payload;
    try {
      const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!googleResponse.ok) {
        throw new Error("Google tokeninfo endpoint returned error");
      }
      payload = await googleResponse.json();
    } catch (verifyErr) {
      console.error("Google token verification failed:", verifyErr);
      return res.status(400).json({ success: false, message: "Invalid Google token" });
    }

    // Validate client ID if not in testing/mock mode
    if (ENV.GOOGLE_CLIENT_ID && !ENV.GOOGLE_CLIENT_ID.startsWith("mock-")) {
      if (payload.aud !== ENV.GOOGLE_CLIENT_ID) {
        return res.status(400).json({ success: false, message: "Google client ID mismatch" });
      }
    }

    const { email, name, sub: googleId } = payload;
    if (!email) {
      return res.status(400).json({ success: false, message: "Google account does not provide an email" });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Find or create user
    let user = await UserModel.findOne({
      $or: [{ googleId }, { email: emailNormalized }],
    });

    if (user) {
      // Sync Google ID / Name if missing
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.name && name) {
        user.name = name;
        modified = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = await UserModel.create({
        email: emailNormalized,
        name: name || "",
        googleId,
        isVerified: true,
      });
    }

    if (user.status === "inactive") {
      return res.status(400).json({ success: false, message: "Your account is inactive. Please contact support." });
    }

    // Create session token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      result: user,
    });
  } catch (error) {
    console.error("googleLogin error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
