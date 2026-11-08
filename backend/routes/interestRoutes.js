const express = require("express");

const {
  createInterest,
  listInterests,
  updateInterest,
} = require("../controllers/interestController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Buyer -> listing, or farmer -> buyer request
router.post("/", protect, createInterest);

// Interests I sent and received
router.get("/", protect, listInterests);

// Accept or decline an interest (recipient only)
router.patch("/:id", protect, updateInterest);

module.exports = router;
