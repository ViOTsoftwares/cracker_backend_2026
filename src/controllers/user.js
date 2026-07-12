import mongoose from "mongoose";
import { UserModel } from "../models/index.js";
import { getFilenameOnly, deleteFile } from "../lib/imageHelper.js";

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      result: req.user,
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (req.file) {
      if (user.profileImage) {
        deleteFile(user.profileImage, "profiles");
      }
      user.profileImage = req.file.filename;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      result: user,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /api/user/address
export const getAddresses = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      result: req.user.addresses || [],
    });
  } catch (error) {
    console.error("getAddresses error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// POST /api/user/address
export const addAddress = async (req, res) => {
  try {
    const { title, addressLine1, addressLine2, city, state, pincode, phone, isDefault } = req.body;
    
    if (!title || !addressLine1 || !city || !state || !pincode || !phone) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const defaultFlag = isDefault === true || isDefault === "true";

    // If this is set as default, mark all other user addresses as not default
    if (defaultFlag) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // If this is the user's first address, auto-default it
    const isFirstAddress = user.addresses.length === 0;

    user.addresses.push({
      title,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      pincode,
      phone,
      isDefault: isFirstAddress ? true : defaultFlag,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      result: user.addresses,
    });
  } catch (error) {
    console.error("addAddress error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// PUT /api/user/address/:addressId
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { title, addressLine1, addressLine2, city, state, pincode, phone, isDefault } = req.body;

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const defaultFlag = isDefault === true || isDefault === "true";

    if (defaultFlag) {
      user.addresses.forEach((addr) => {
        if (String(addr._id) !== String(addressId)) {
          addr.isDefault = false;
        }
      });
    }

    if (title !== undefined) address.title = title;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (phone !== undefined) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = defaultFlag;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      result: user.addresses,
    });
  } catch (error) {
    console.error("updateAddress error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// DELETE /api/user/address/:addressId
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = address.isDefault;

    // Use pull to remove the subdocument
    user.addresses.pull({ _id: addressId });

    // If we deleted the default address, set the first remaining address as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      result: user.addresses,
    });
  } catch (error) {
    console.error("deleteAddress error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
