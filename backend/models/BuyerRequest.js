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
    status: {
      type: String,
      enum: ["open", "matched", "fulfilled", "cancelled"],
      default: "open",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

// Quickly find open requests for a particular crop
buyerRequestSchema.index({
  crop: 1,
  status: 1,
});

// Quickly find buyer requests by location
buyerRequestSchema.index({
  "location.town": 1,
  "location.region": 1,
});

module.exports = mongoose.model(
  "BuyerRequest",
  buyerRequestSchema
);