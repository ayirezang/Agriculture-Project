const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // ==========================================
    // PERSON WHO RECEIVES THIS NOTIFICATION
    // ==========================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // CONTACT DETAILS OF THE OTHER PERSON
    // ==========================================
    counterpartyName: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // WHAT THIS NOTIFICATION IS ABOUT
    // ==========================================
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },

    buyerRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuyerRequest",
    },

    interest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  user: 1,
  read: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);
