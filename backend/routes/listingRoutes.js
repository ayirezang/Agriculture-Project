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
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// Get all active produce listings
// Buyers will use this for the marketplace
router.get("/", getListings);

// Get one listing
router.get("/:id", getListingById);

// ==========================================
// FARMER ONLY
// ==========================================

// Create produce listing
router.post(
  "/",
  protect,
  authorizeRoles("farmer"),
  createListing
);

// Get logged-in farmer's listings
router.get(
  "/my/listings",
  protect,
  authorizeRoles("farmer"),
  getMyListings
);

// Update own listing
router.put(
  "/:id",
  protect,
  authorizeRoles("farmer"),
  updateListing
);

// Delete own listing
router.delete(
  "/:id",
  protect,
  authorizeRoles("farmer"),
  deleteListing
);

module.exports = router;