const mongoose = require("mongoose");

const Outreach = require("../models/Outreach");
const Listing = require("../models/Listing");
const BuyerRequest = require("../models/BuyerRequest");

const CHANNELS = ["whatsapp", "sms", "call", "copy"];

const STATUSES = [
  "drafted",
  "sent",
  "replied",
  "negotiating",
  "closed",
  "no_reply",
  "declined",
];

const isValidId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

// ==========================================
// CREATE OUTREACH
// Saves a draft (or an already-sent message)
// for the logged-in farmer or buyer.
// ==========================================
const createOutreach = async (req, res) => {
  try {
    const {
      listingId,
      buyerRequestId,
      counterpartyId,
      counterpartyName,
      counterpartyPhone,
      crop,
      quantity,
      unit,
      message,
      channel,
      status,
      notes,
    } = req.body;

    // Name is the only thing we cannot infer
    if (!counterpartyName || !String(counterpartyName).trim()) {
      return res.status(400).json({
        success: false,
        message: "A counterparty name is required",
      });
    }

    // ------------------------------------------
    // VALIDATE THE LISTING (FARMER SIDE)
    // ------------------------------------------
    let listing = null;

    if (listingId) {
      if (!isValidId(listingId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid listing id",
        });
      }

      listing = await Listing.findById(listingId);

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found",
        });
      }

      if (
        req.user.role === "farmer" &&
        listing.farmer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only log outreach for your own listings",
        });
      }
    }

    // ------------------------------------------
    // VALIDATE THE REQUEST (BUYER SIDE)
    // ------------------------------------------
    let buyerRequest = null;

    if (buyerRequestId) {
      if (!isValidId(buyerRequestId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid buyer request id",
        });
      }

      buyerRequest = await BuyerRequest.findById(buyerRequestId);

      if (!buyerRequest) {
        return res.status(404).json({
          success: false,
          message: "Buyer request not found",
        });
      }

      if (
        req.user.role === "buyer" &&
        buyerRequest.buyer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only log outreach for your own requests",
        });
      }
    }

    const finalChannel = CHANNELS.includes(channel) ? channel : "whatsapp";
    const finalStatus = STATUSES.includes(status) ? status : "drafted";

    const outreach = await Outreach.create({
      owner: req.user._id,
      ownerRole: req.user.role,
      listing: listing?._id || null,
      buyerRequest: buyerRequest?._id || null,
      counterparty: isValidId(counterpartyId) ? counterpartyId : null,
      counterpartyName: String(counterpartyName).trim(),
      counterpartyPhone: String(counterpartyPhone || "").trim(),
      crop: String(crop || listing?.crop || buyerRequest?.crop || "").trim(),
      quantity:
        Number(quantity) ||
        Number(listing?.quantity) ||
        Number(buyerRequest?.quantity) ||
        0,
      unit: String(unit || listing?.unit || buyerRequest?.unit || "kg"),
      message: String(message || "").trim(),
      channel: finalChannel,
      status: finalStatus,
      sentAt: finalStatus === "sent" ? new Date() : null,
      notes: String(notes || "").trim(),
    });

    res.status(201).json({
      success: true,
      message: "Outreach saved",
      outreach,
    });
  } catch (error) {
    console.error("Create outreach error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to save outreach",
    });
  }
};

// ==========================================
// LIST MY OUTREACH
// ==========================================
const listOutreach = async (req, res) => {
  try {
    const outreaches = await Outreach.find({
      owner: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      outreaches,
    });
  } catch (error) {
    console.error("List outreach error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load outreach",
    });
  }
};

// ==========================================
// UPDATE OUTREACH
// Used to move a draft along the pipeline:
// drafted -> sent -> replied -> closed.
// ==========================================
const updateOutreach = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid outreach id",
      });
    }

    const outreach = await Outreach.findById(id);

    if (!outreach) {
      return res.status(404).json({
        success: false,
        message: "Outreach not found",
      });
    }

    if (outreach.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own outreach",
      });
    }

    const { status, channel, notes, markSent } = req.body;

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid outreach status",
        });
      }

      outreach.status = status;
    }

    if (channel) {
      if (!CHANNELS.includes(channel)) {
        return res.status(400).json({
          success: false,
          message: "Invalid outreach channel",
        });
      }

      outreach.channel = channel;
    }

    if (typeof notes === "string") {
      outreach.notes = notes;
    }

    if (markSent) {
      if (!outreach.sentAt) {
        outreach.sentAt = new Date();
      }

      if (outreach.status === "drafted") {
        outreach.status = "sent";
      }
    }

    await outreach.save();

    res.status(200).json({
      success: true,
      message: "Outreach updated",
      outreach,
    });
  } catch (error) {
    console.error("Update outreach error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update outreach",
    });
  }
};

module.exports = {
  createOutreach,
  listOutreach,
  updateOutreach,
};
