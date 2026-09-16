const express = require("express");

const {
  registerUser,
  loginUser,
  getBuyers,
} = require("../controllers/authController");

const router = express.Router();

// ==========================================
// AUTH ROUTES
// ==========================================

router.post("/register", registerUser);

router.post("/login", loginUser);

// ==========================================
// BUYER REGISTRY
// ==========================================

router.get("/buyers", getBuyers);

module.exports = router;