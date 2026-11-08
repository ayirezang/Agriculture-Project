const express = require("express");

const {
  createOutreach,
  listOutreach,
  updateOutreach,
} = require("../controllers/outreachController");
const { protect } = require("../middleware/authMiddleware");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const router = express.Router();

router.post("/", protect, asyncHandler(createOutreach));
router.get("/", protect, asyncHandler(listOutreach));
router.patch("/:id", protect, asyncHandler(updateOutreach));

module.exports = router;
