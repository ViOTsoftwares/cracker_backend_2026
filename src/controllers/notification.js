import { NotificationModel } from "../models/index.js";

// GET /api/admin/notifications
export const getNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await NotificationModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await NotificationModel.countDocuments({ isRead: false });

    return res.status(200).json({
      success: true,
      result: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/admin/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      result: notification,
    });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
