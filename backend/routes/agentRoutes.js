const express = require("express");
const {
  runSalesAgent,
  runBuyerSourcingAgent,
} = require("../controllers/agentController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const router = express.Router();

router.post(
  "/run/:id",
  protect,
  authorizeRoles("farmer"),
  asyncHandler(runSalesAgent)
);

router.post(
  "/buyer/run/:id",
  protect,
  authorizeRoles("buyer"),
  asyncHandler(runBuyerSourcingAgent)
);

module.exports = router;
