import { OrderModel, ProductModel } from "../models/index.js";

// Helper to generate a unique readable Order ID
const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // e.g. 260712
  const randNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `CS-${dateStr}-${randNum}`;
};

// POST /api/user/orders
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }

    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: "Valid shipping address is required" });
    }

    const paymentMethodNormalized = paymentMethod || "cod";

    // 1. Process items and verify stock availability
    let subtotal = 0;
    const orderItems = [];

    // Verify stock and calculate price
    for (const item of items) {
      const product = await ProductModel.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      const itemPrice = product.offerPrice || product.originalPrice;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // 2. Create the Order
    const discount = 0; // Can be expanded with coupon code logic
    const total = subtotal - discount;
    const orderId = generateOrderId();

    const order = await OrderModel.create({
      orderId,
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        title: shippingAddress.title || "Shipping Address",
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        phone: shippingAddress.phone,
      },
      subtotal,
      discount,
      total,
      paymentMethod: paymentMethodNormalized,
      paymentStatus: paymentMethodNormalized === "online" ? "paid" : "pending",
      orderStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! 🎆",
      result: order,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /api/user/orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({ user: req.user._id })
      .populate({
        path: "items.product",
        select: "name slug images brand",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: orders,
    });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /api/user/orders/:id
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await OrderModel.findOne({ _id: id, user: req.user._id })
      .populate({
        path: "items.product",
        select: "name slug images brand",
      });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      result: order,
    });
  } catch (error) {
    console.error("getOrderDetails error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
