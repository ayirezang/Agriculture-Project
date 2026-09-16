const express = require("express");

const {
  getDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// ========================================
// FARMER DASHBOARD
// Only logged-in farmers can access this
// ========================================
router.get(
  "/",
  protect,
  authorizeRoles("farmer"),
  getDashboard
);

module.exports = router;