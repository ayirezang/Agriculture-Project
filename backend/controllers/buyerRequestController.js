const BuyerRequest = require("../models/BuyerRequest");
const { findMatchingListings } = require("../services/matchingService");

// ==========================================
// CREATE BUYER REQUEST
// ==========================================
const createBuyerRequest = async (req, res) => {
  try {
    const {
      crop,
      quantity,
      unit,
      maxPrice,
      location,
      pickupRadius,
      description,
      requiredBy,
    } = req.body;

    // Validate required fields
    if (
      !crop ||
      !quantity ||
      maxPrice === undefined ||
      !location?.town ||
      !location?.region
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Crop, quantity, maximum price, town and region are required",
      });
    }

    // Validate quantity
    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Validate maximum price
    if (Number(maxPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: "Maximum price cannot be negative",
      });
    }

    // Validate unit
    const allowedUnits = [
      "kg",
      "tonnes",
      "bags",
      "crates",
    ];

    if (unit && !allowedUnits.includes(unit)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid unit. Use kg, tonnes, bags or crates",
      });
    }

    // Validate pickup radius
    if (
      pickupRadius !== undefined &&
      Number(pickupRadius) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Pickup radius must be greater than 0",
      });
    }

    // Create buyer request
    const request = await BuyerRequest.create({
      buyer: req.user._id,

      crop: crop.trim(),

      quantity: Number(quantity),

      unit: unit || "kg",

      maxPrice: Number(maxPrice),

      location: {
        town: location.town.trim(),
        region: location.region.trim(),
        latitude:
          location.latitude !== undefined
            ? Number(location.latitude)
            : undefined,
        longitude:
          location.longitude !== undefined
            ? Number(location.longitude)
            : undefined,
      },

      pickupRadius:
        pickupRadius !== undefined
          ? Number(pickupRadius)
          : 50,

      description: description?.trim() || "",

      requiredBy: requiredBy || undefined,
    });


    

    // Return buyer information
    const populatedRequest =
      await BuyerRequest.findById(request._id).populate(
        "buyer",
        "name email phone role location"
      );

    res.status(201).json({
      success: true,
      message: "Buyer request created successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Create buyer request error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating buyer request",
    });
  }
};

// ==========================================
// GET MY BUYER REQUESTS
// ==========================================
const getMyBuyerRequests = async (req, res) => {
  try {
    const requests = await BuyerRequest.find({
      buyer: req.user._id,
    })
      .populate(
        "buyer",
        "name email phone role location"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get buyer requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching buyer requests",
    });
  }
};

// ==========================================
// GET SINGLE BUYER REQUEST
// ==========================================
const getBuyerRequestById = async (req, res) => {
  try {
    const request = await BuyerRequest.findById(
      req.params.id
    ).populate(
      "buyer",
      "name email phone role location"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Buyer request not found",
      });
    }

    // Only the owner can view their request
    if (
      request.buyer._id.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only view your own requests",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error(
      "Get buyer request error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching request",
    });
  }
};

// ==========================================
// GET MATCHING FARMER LISTINGS
// ==========================================
const getBuyerRequestMatches = async (req, res) => {
  try {
    // Find the buyer request
    const request = await BuyerRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Buyer request not found",
      });
    }

    // Only the buyer who created the request
    // can see its matches
    if (
      request.buyer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only view matches for your own requests",
      });
    }

    // Only open requests should be matched
    if (request.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "This buyer request has been cancelled",
      });
    }

    if (request.status === "fulfilled") {
      return res.status(400).json({
        success: false,
        message:
          "This buyer request has already been fulfilled",
      });
    }

    // Search REAL farmer listings in MongoDB
    const matches = await findMatchingListings(
      request
    );

    res.status(200).json({
      success: true,

      count: matches.length,

      request: {
        id: request._id,
        crop: request.crop,
        quantity: request.quantity,
        unit: request.unit,
        maxPrice: request.maxPrice,
        location: request.location,
        pickupRadius: request.pickupRadius,
        requiredBy: request.requiredBy,
        status: request.status,
      },

      matches,
    });
  } catch (error) {
    console.error(
      "Get buyer request matches error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while finding matching farmers",
    });
  }
};

// ==========================================
// CANCEL BUYER REQUEST
// ==========================================
const cancelBuyerRequest = async (req, res) => {
  try {
    const request = await BuyerRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Buyer request not found",
      });
    }

    // Only the owner can cancel
    if (
      request.buyer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only cancel your own requests",
      });
    }

    // Prevent cancelling an already fulfilled request
    if (request.status === "fulfilled") {
      return res.status(400).json({
        success: false,
        message:
          "A fulfilled request cannot be cancelled",
      });
    }

    // Prevent cancelling twice
    if (request.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "This buyer request is already cancelled",
      });
    }

    request.status = "cancelled";

    await request.save();

    res.status(200).json({
      success: true,
      message:
        "Buyer request cancelled successfully",
      request,
    });
  } catch (error) {
    console.error(
      "Cancel buyer request error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while cancelling request",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createBuyerRequest,
  getMyBuyerRequests,
  getBuyerRequestById,
  getBuyerRequestMatches,
  cancelBuyerRequest,
};