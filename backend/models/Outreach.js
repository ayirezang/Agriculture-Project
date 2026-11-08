const mongoose = require("mongoose");

// ==========================================
// OUTREACH
// One row in a user's outreach pipeline.
// Works for both farmers (selling to a buyer)
// and buyers (sourcing from a farmer).
// The counterparty does NOT need an AgriConnect
// account: a name and phone number are enough.
// ==========================================

const outreachSchema = new mongoose.Schema(
  {
    // ==========================================
    // WHO OWNS THIS OUTREACH
    // ==========================================
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ownerRole: {
      type: String,
      enum: ["farmer", "buyer"],
      required: true,
    },

    // ==========================================
    // WHAT THE OUTREACH IS ABOUT
    // ==========================================
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      default: null,
    },

    buyerRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuyerRequest",
      default: null,
    },

    // ==========================================
    // THE OTHER SIDE
    // ==========================================
    counterparty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    counterpartyName: {
      type: String,
      required: true,
      trim: true,
    },

    counterpartyPhone: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // WHAT IS BEING OFFERED / REQUESTED
    // ==========================================
    crop: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },

    unit: {
      type: String,
      default: "kg",
    },

    // ==========================================
    // THE MESSAGE THE USER SENDS
    // ==========================================
    message: {
      type: String,
      trim: true,
      default: "",
    },

    channel: {
      type: String,
      enum: ["whatsapp", "sms", "call", "copy"],
      default: "whatsapp",
    },

    // ==========================================
    // PIPELINE STATUS
    // drafted    = message prepared, not sent
    // sent       = message sent, no reply yet
    // replied    = counterparty replied
    // negotiating = price/quantity being discussed
    // closed     = deal agreed
    // no_reply   = no answer after follow-up
    // declined   = counterparty said no
    // ==========================================
    status: {
      type: String,
      enum: [
        "drafted",
        "sent",
        "replied",
        "negotiating",
        "closed",
        "no_reply",
        "declined",
      ],
      default: "drafted",
      index: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    followUpAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

outreachSchema.index({ owner: 1, status: 1 });
outreachSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Outreach", outreachSchema);
