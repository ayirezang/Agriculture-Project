const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    crop: {
      type: String,
      required: true,
      trim: true,
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

    minPrice: {
      type: Number,
      required: true,
      min: 0,
    },

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

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "sold", "cancelled"],
      default: "active",
    },

    harvestDate: {
      type: Date,
    },

    availableUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Listing", listingSchema);