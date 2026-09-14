const mongoose = require("mongoose");

const produceListingSchema = new mongoose.Schema(
  {
    // Farmer who created the listing
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Crop being sold
    crop: {
      type: String,
      required: true,
      trim: true,
    },

    // Quantity available
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    // Unit of measurement
    unit: {
      type: String,
      enum: ["kg", "tonnes", "bags", "crates"],
      default: "kg",
    },

    // Minimum price the farmer is willing to accept
    minPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Farmer's location
    location: {
      town: {
        type: String,
        required: true,
        trim: true,
      },

      region: {
        type: String,
        trim: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    // Optional description
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Whether the produce is still available
    status: {
      type: String,
      enum: ["available", "reserved", "sold", "cancelled"],
      default: "available",
    },

    // When the farmer expects the produce to be available
    availableFrom: {
      type: Date,
    },

    // Optional date when the produce expires/should be sold
    availableUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProduceListing", produceListingSchema);