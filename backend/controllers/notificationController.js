const Notification = require("../models/Notification");

// ==========================================
// LIST MY NOTIFICATIONS
// ==========================================
const listNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications =
      await Notification.find({
        user: userId,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    const unreadCount =
      await Notification.countDocuments({
        user: userId,
        read: false,
      });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error(
      "List notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while loading notifications.",
    });
  }
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================
const markNotificationRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        { read: true },
        { new: true }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating notification.",
    });
  }
};

// ==========================================
// MARK EVERY NOTIFICATION AS READ
// ==========================================
const markAllNotificationsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        read: false,
      },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating notifications.",
    });
  }
};

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
