const express = require("express");

const {
  createBuyerRequest,
  getMyBuyerRequests,
  getBuyerRequestById,
  getBuyerRequestMatches,
  cancelBuyerRequest,
} = require("../controllers/buyerRequestController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// CREATE BUYER REQUEST
// POST /api/buyer-requests
// BUYER ONLY
// ==========================================
router.post(
  "/",
  protect,
  authorizeRoles("buyer"),
  createBuyerRequest
);

// ==========================================
// GET MY BUYER REQUESTS
// GET /api/buyer-requests/my
// BUYER ONLY
// ==========================================
router.get(
  "/my",
  protect,
  authorizeRoles("buyer"),
  getMyBuyerRequests
);

// ==========================================
// GET MATCHING FARMER LISTINGS
// GET /api/buyer-requests/:id/matches
// BUYER ONLY
// ==========================================
// IMPORTANT:
// This route must come BEFORE /:id
// so "matches" is not treated as an ID.
router.get(
  "/:id/matches",
  protect,
  authorizeRoles("buyer"),
  getBuyerRequestMatches
);

// ==========================================
// GET SINGLE BUYER REQUEST
// GET /api/buyer-requests/:id
// BUYER ONLY
// ==========================================
router.get(
  "/:id",
  protect,
  authorizeRoles("buyer"),
  getBuyerRequestById
);

// ==========================================
// CANCEL BUYER REQUEST
// PUT /api/buyer-requests/:id/cancel
// BUYER ONLY
// ==========================================
router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("buyer"),
  cancelBuyerRequest
);

module.exports = router;