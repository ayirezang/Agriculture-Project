const mongoose = require("mongoose");

const buyerRequestSchema = new mongoose.Schema(
  {
    // ==========================================
    // BUYER WHO CREATED THE REQUEST
    // ==========================================
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // PRODUCE REQUIRED
    // ==========================================
    crop: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unit: {
      type: String,
      enum: ["kg", "tonnes", "bags", "crates"],
      default: "kg",
    },

    // ==========================================
    // BUYER'S MAXIMUM PRICE
    // ==========================================
    maxPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // BUYER LOCATION
    // ==========================================
    location: {
      town: {
        type: String,
        required: true,
        trim: true,
      },

      region: {
        type: String,
        required: true,
        trim: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    // ==========================================
    // PICKUP DISTANCE
    // ==========================================
    pickupRadius: {
      type: Number,
      default: 50,
      min: 1,
    },

    // ==========================================
    // OPTIONAL DETAILS
    // ==========================================
    description: {
      type: String,
      trim: true,
      default: "",
    },

    requiredBy: {
      type: Date,
    },

    // ==========================================
    // REQUEST STATUS
    // ==========================================
    // pending   = waiting for a farmer
    // matched   = farmer has been found
    // completed = transaction has been completed
    // cancelled = buyer cancelled the request
    // ==========================================
    status: {
      type: String,
      enum: [
        "pending",
        "matched",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // ==========================================
    // FARMER THAT MATCHED THIS REQUEST
    // ==========================================
    matchedFarmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==========================================
    // FARMER LISTING THAT MATCHED THIS REQUEST
    // ==========================================
    matchedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

// Quickly find pending requests for a crop
buyerRequestSchema.index({
  crop: 1,
  status: 1,
});

// Quickly find buyer requests by location
buyerRequestSchema.index({
  "location.town": 1,
  "location.region": 1,
});

// Quickly find requests belonging to a buyer
buyerRequestSchema.index({
  buyer: 1,
  status: 1,
});

module.exports = mongoose.model(
  "BuyerRequest",
  buyerRequestSchema
);