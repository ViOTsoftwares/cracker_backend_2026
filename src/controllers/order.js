import { OrderModel, ProductModel, CategoryModel, UserModel, EmailTemplateModel, SettingModel, NotificationModel } from "../models/index.js";
import { emitOne } from "../config/socket.js";
import { Pagination } from "../lib/pagination.js";
import { ColumnFilter } from "../lib/columnFilter.js";
import { renderEmailTemplate } from "../lib/mailTemplate.js";

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
    const setting = await SettingModel.findOne();
    const deliveryFee = setting?.deliveryFee || 0;

    // 1. Process items and verify stock availability
    let subtotal = 0;
    const orderItems = [];
    let itemsRowsHtml = "";

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

      itemsRowsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${itemPrice.toLocaleString()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(itemPrice * item.quantity).toLocaleString()}</td>
        </tr>
      `;
    }

    // 2. Create the Order
    const discount = 0; // Can be expanded with coupon code logic
    const total = subtotal + deliveryFee - discount;
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
      deliveryFee,
      paymentMethod: paymentMethodNormalized,
      paymentStatus: paymentMethodNormalized === "online" ? "paid" : "pending",
      orderStatus: "pending",
    });

    // 3. Send email confirmation using Database Template
    try {
      const templateIdentifier = "ORDER_PROCESSING";
      const templateExists = await EmailTemplateModel.findOne({ identifier: templateIdentifier });
      const emailVariables = {
        orderId,
        shippingTitle: shippingAddress.title || "Shipping Address",
        shippingAddressLine1: shippingAddress.addressLine1,
        shippingAddressLine2: shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}<br />` : "",
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPincode: shippingAddress.pincode,
        shippingPhone: shippingAddress.phone,
        itemsHtml: itemsRowsHtml,
        subtotal: subtotal.toLocaleString("en-IN"),
        total: total.toLocaleString("en-IN"),
        deliveryFeeText: deliveryFee > 0 ? `₹${deliveryFee.toLocaleString("en-IN")}` : "FREE",
        deliveryFeeColor: deliveryFee > 0 ? "#0f172a" : "#10b981",
      };

      if (req.user && req.user.email) {
        await renderEmailTemplate(templateIdentifier, req.user.email, emailVariables);
      }
      if (process.env.SMTP_USER) {
        await renderEmailTemplate(templateIdentifier, process.env.SMTP_USER, emailVariables);
      }
    } catch (emailError) {
      console.error("Order template email sending failed:", emailError);
    }

    // 4. Create Notification & Emit Web Socket Event
    try {
      const notification = await NotificationModel.create({
        title: "New Order Received",
        message: `Order ${orderId} has been placed for ₹${total.toLocaleString("en-IN")}.`,
        type: "new_order",
        data: { orderId: order._id },
      });

      emitOne("admin_room", "new_order", {
        notification,
        orderId,
      });
    } catch (wsError) {
      console.error("Failed to emit new order websocket event:", wsError);
    }

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

// GET /api/admin/orders (Admin only)
export const getAllOrdersAdmin = async (req, res) => {
  try {
    let { page, limit, filter } = req.query;
    filter = ColumnFilter(filter);
    const { skip } = Pagination({ page, limit });
    const sort = { createdAt: -1 };

    // Search by orderId or shipping address phone
    if (filter && filter.orderId) {
      filter.orderId = { $regex: filter.orderId, $options: "i" };
    }

    // Search by customer name
    if (filter && filter.customer) {
      const userQuery = filter.customer; // it is a regex object from ColumnFilter
      const matchedUsers = await UserModel.find({ name: userQuery }).select("_id");
      const userIds = matchedUsers.map((u) => u._id);
      filter.user = { $in: userIds };
      delete filter.customer;
    }

    // Match orders for the entire day of the selected date
    if (filter && filter.createdAt) {
      const targetDate = new Date(filter.createdAt);
      if (!isNaN(targetDate.getTime())) {
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    const list = await OrderModel.find(filter || {})
      .populate("user", "name email phone")
      .populate("items.product", "name")
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const count = await OrderModel.countDocuments(filter || {});

    return res.status(200).json({
      success: true,
      message: "Get all orders for admin",
      result: { list, count },
    });
  } catch (error) {
    console.error("getAllOrdersAdmin error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// PUT /api/admin/orders/:id/status (Admin only)
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, isRead } = req.body;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (isRead !== undefined) {
      order.isRead = isRead;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      result: order,
    });
  } catch (error) {
    console.error("updateOrderStatusAdmin error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /api/admin/orders/export-all (Admin only)
export const exportOrdersAdmin = async (req, res) => {
  try {
    let { filter } = req.query;
    
    if (filter) {
      filter = ColumnFilter(filter);

      if (filter && filter.orderId) {
        filter.orderId = { $regex: filter.orderId, $options: "i" };
      }

      if (filter && filter.customer) {
        const userQuery = filter.customer; 
        const matchedUsers = await UserModel.find({ name: userQuery }).select("_id");
        const userIds = matchedUsers.map((u) => u._id);
        filter.user = { $in: userIds };
        delete filter.customer;
      }

      if (filter && filter.createdAt) {
        const targetDate = new Date(filter.createdAt);
        if (!isNaN(targetDate.getTime())) {
          const startDate = new Date(targetDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(targetDate);
          endDate.setHours(23, 59, 59, 999);
          filter.createdAt = { $gte: startDate, $lte: endDate };
        }
      }
    }

    const list = await OrderModel.find(filter || {})
      .populate("user", "name email phone")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Get all orders for export",
      result: list,
    });
  } catch (error) {
    console.error("exportOrdersAdmin error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
