const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    // ==========================================
    // FARMER WHO OWNS THE LISTING
    // ==========================================
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // PRODUCE INFORMATION
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

    // Farmer's minimum acceptable price
    minPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // FARM LOCATION
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
    // ADDITIONAL INFORMATION
    // ==========================================
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // LISTING STATUS
    // ==========================================
    status: {
      type: String,
      enum: ["active", "sold", "cancelled"],
      default: "active",
      index: true,
    },

    // ==========================================
    // AVAILABILITY
    // ==========================================
    harvestDate: {
      type: Date,
    },

    availableUntil: {
      type: Date,
    },

    // ==========================================
    // AUTOMATIC EXPIRY
    // ==========================================
    // Stale listings disappear from the marketplace
    // unless the farmer renews them.
    // ==========================================
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES FOR FASTER BUYER SEARCH
// ==========================================

// Helps search active listings by crop
listingSchema.index({
  crop: 1,
  status: 1,
});

// Helps search listings by location
listingSchema.index({
  "location.town": 1,
  "location.region": 1,
});

// Helps search listings by price
listingSchema.index({
  minPrice: 1,
  status: 1,
});

module.exports = mongoose.model("Listing", listingSchema);