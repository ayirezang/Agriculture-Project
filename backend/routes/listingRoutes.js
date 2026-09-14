const express = require("express");

const {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// Get all active produce listings
router.get("/", getListings);

// Get one listing
router.get("/:id", getListingById);

// ==========================================
// PROTECTED
// ==========================================

// Create produce listing
router.post("/", protect, createListing);

// Get logged-in farmer's listings
router.get("/my/listings", protect, getMyListings);

// Update own listing
router.put("/:id", protect, updateListing);

// Delete own listing
router.delete("/:id", protect, deleteListing);

module.exports = router;