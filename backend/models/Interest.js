const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
  {
    // ==========================================
    // PERSON EXPRESSING INTEREST
    // ==========================================
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // PERSON WHO RECEIVES THE INTEREST
    // ==========================================
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // BUYER INTEREST IN A FARMER LISTING
    // ==========================================
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },

    // ==========================================
    // FARMER INTEREST IN A BUYER REQUEST
    // ==========================================
    buyerRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuyerRequest",
    },

    crop: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

interestSchema.index({
  sender: 1,
  listing: 1,
});

interestSchema.index({
  sender: 1,
  buyerRequest: 1,
});

interestSchema.index({
  recipient: 1,
  status: 1,
});

module.exports = mongoose.model(
  "Interest",
  interestSchema
);
