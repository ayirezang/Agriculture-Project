const Interest = require("../models/Interest");
const Notification = require("../models/Notification");
const Listing = require("../models/Listing");
const BuyerRequest = require("../models/BuyerRequest");

// ==========================================
// CREATE INTEREST
// ==========================================
// A buyer can express interest in a listing.
// A farmer can express interest in a buyer request.
// The recipient always gets a notification.
// ==========================================
const createInterest = async (req, res) => {
  try {
    const {
      listingId,
      buyerRequestId,
      message,
    } = req.body;

    const userId = req.user._id;

    let listing = null;
    let buyerRequest = null;
    let recipient = null;
    let crop = "";

    // ==========================================
    // BUYER -> FARMER LISTING
    // ==========================================
    if (listingId) {
      if (req.user.role !== "buyer") {
        return res.status(403).json({
          success: false,
          message:
            "Only buyers can express interest in a listing.",
        });
      }

      listing = await Listing.findById(
        listingId
      );

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found.",
        });
      }

      if (
        String(listing.farmer) ===
        String(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot express interest in your own listing.",
        });
      }

      const existing = await Interest.findOne({
        sender: userId,
        listing: listing._id,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "You already expressed interest in this listing.",
          interest: existing,
        });
      }

      recipient = listing.farmer;
      crop = listing.crop;
    }

    // ==========================================
    // FARMER -> BUYER REQUEST
    // ==========================================
    else if (buyerRequestId) {
      if (req.user.role !== "farmer") {
        return res.status(403).json({
          success: false,
          message:
            "Only farmers can express interest in a buyer request.",
        });
      }

      buyerRequest =
        await BuyerRequest.findById(
          buyerRequestId
        );

      if (!buyerRequest) {
        return res.status(404).json({
          success: false,
          message:
            "Buyer request not found.",
        });
      }

      if (
        String(buyerRequest.buyer) ===
        String(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot express interest in your own request.",
        });
      }

      const existing = await Interest.findOne({
        sender: userId,
        buyerRequest: buyerRequest._id,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "You already expressed interest in this request.",
          interest: existing,
        });
      }

      recipient = buyerRequest.buyer;
      crop = buyerRequest.crop;
    }

    // ==========================================
    // NOTHING TO RESPOND TO
    // ==========================================
    else {
      return res.status(400).json({
        success: false,
        message:
          "listingId or buyerRequestId is required.",
      });
    }

    const interest = await Interest.create({
      sender: userId,
      recipient,
      listing: listing?._id,
      buyerRequest: buyerRequest?._id,
      crop,
      message:
        typeof message === "string"
          ? message.trim()
          : "",
    });

    // ==========================================
    // NOTIFY THE OTHER SIDE
    // ==========================================
    await Notification.create({
      user: recipient,
      type: listing
        ? "interest_in_listing"
        : "interest_in_request",
      title: listing
        ? "New buyer interest"
        : "A farmer is interested",
      body: `${req.user.name} is interested in your ${crop} ${
        listing ? "listing" : "request"
      }.`,
      counterpartyName:
        req.user.name || "",
      phone: req.user.phone || "",
      listing: listing?._id,
      buyerRequest: buyerRequest?._id,
      interest: interest._id,
    });

    return res.status(201).json({
      success: true,
      message: "Interest sent.",
      interest,
    });
  } catch (error) {
    console.error(
      "Create interest error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while sending interest.",
    });
  }
};

// ==========================================
// LIST MY INTERESTS (SENT + RECEIVED)
// ==========================================
const listInterests = async (req, res) => {
  try {
    const userId = req.user._id;

    const interests = await Interest.find({
      $or: [
        { sender: userId },
        { recipient: userId },
      ],
    })
      .populate(
        "sender",
        "name phone role location"
      )
      .populate(
        "recipient",
        "name phone role location"
      )
      .populate(
        "listing",
        "crop quantity unit minPrice status"
      )
      .populate(
        "buyerRequest",
        "crop quantity unit maxPrice status"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: interests.length,
      interests,
    });
  } catch (error) {
    console.error(
      "List interests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while loading interests.",
    });
  }
};

// ==========================================
// ACCEPT OR DECLINE AN INTEREST
// ==========================================
const updateInterest = async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !["accepted", "declined"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be accepted or declined.",
      });
    }

    const interest = await Interest.findById(
      req.params.id
    );

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: "Interest not found.",
      });
    }

    if (
      String(interest.recipient) !==
      String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the recipient can respond to this interest.",
      });
    }

    interest.status = status;
    await interest.save();

    await Notification.create({
      user: interest.sender,
      type: `interest_${status}`,
      title:
        status === "accepted"
          ? "Interest accepted"
          : "Interest declined",
      body: `${req.user.name} ${status} your interest in ${interest.crop}.`,
      counterpartyName:
        req.user.name || "",
      phone: req.user.phone || "",
      listing: interest.listing,
      buyerRequest: interest.buyerRequest,
      interest: interest._id,
    });

    return res.status(200).json({
      success: true,
      message: `Interest ${status}.`,
      interest,
    });
  } catch (error) {
    console.error(
      "Update interest error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating interest.",
    });
  }
};

module.exports = {
  createInterest,
  listInterests,
  updateInterest,
};
