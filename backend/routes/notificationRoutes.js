const express = require("express");

const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// My notifications
router.get("/", protect, listNotifications);

// Mark every notification as read
router.patch(
  "/read-all",
  protect,
  markAllNotificationsRead
);

// Mark one notification as read
router.patch(
  "/:id/read",
  protect,
  markNotificationRead
);

module.exports = router;
