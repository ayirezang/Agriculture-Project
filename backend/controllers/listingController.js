const Listing = require("../models/Listing");
const {
  matchListingToPendingRequests,
} = require("../services/matchingService");

// ==========================================
// CREATE PRODUCE LISTING
// ==========================================
const createListing = async (req, res) => {
  try {
    const {
      crop,
      quantity,
      unit,
      minPrice,
      location,
      description,
      harvestDate,
      availableUntil,
    } = req.body;

    // ==========================================
    // MAKE SURE ONLY FARMERS CAN CREATE LISTINGS
    // ==========================================
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message:
          "Only farmers can create produce listings",
      });
    }

    // ==========================================
    // CHECK REQUIRED FIELDS
    // ==========================================
    if (
      !crop ||
      !quantity ||
      minPrice === undefined ||
      !location?.town ||
      !location?.region
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Crop, quantity, minimum price, town and region are required",
      });
    }

    // ==========================================
    // VALIDATE QUANTITY
    // ==========================================
    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0",
      });
    }

    // ==========================================
    // VALIDATE PRICE
    // ==========================================
    if (Number(minPrice) < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum price cannot be negative",
      });
    }

    // ==========================================
    // VALIDATE UNIT
    // ==========================================
    const allowedUnits = [
      "kg",
      "tonnes",
      "bags",
      "crates",
    ];

    if (
      unit &&
      !allowedUnits.includes(unit)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid unit. Use kg, tonnes, bags or crates",
      });
    }

    // ==========================================
    // CREATE LISTING
    // ==========================================
    const listing = await Listing.create({
      farmer: req.user._id,

      crop: crop.trim(),

      quantity: Number(quantity),

      unit: unit || "kg",

      minPrice: Number(minPrice),

      location: {
        town: location.town.trim(),
        region: location.region.trim(),

        latitude:
          location.latitude !== undefined
            ? Number(location.latitude)
            : undefined,

        longitude:
          location.longitude !== undefined
            ? Number(location.longitude)
            : undefined,
      },

      description:
        description?.trim() || "",

      harvestDate:
        harvestDate || undefined,

      availableUntil:
        availableUntil || undefined,

      status: "active",
    });

    // ==========================================
    // AUTOMATIC BUYER REQUEST MATCHING
    // ==========================================
    let matchResult = null;

    try {
      matchResult =
        await matchListingToPendingRequests(
          listing._id
        );

      if (matchResult?.matched) {
        console.log(
          "=========================================="
        );

        console.log(
          "BUYER REQUEST MATCH FOUND"
        );

        console.log(
          `Listing: ${listing._id}`
        );

        console.log(
          `Buyer Request: ${matchResult.request?._id}`
        );

        console.log(
          "=========================================="
        );
      }
    } catch (matchError) {
      // We don't want a matching error to
      // prevent the farmer's listing from
      // being created successfully.
      console.error(
        "Automatic buyer matching error:",
        matchError
      );
    }

    // ==========================================
    // RETURN LISTING WITH FARMER INFORMATION
    // ==========================================
    const populatedListing =
      await Listing.findById(
        listing._id
      ).populate(
        "farmer",
        "name email phone role location"
      );

    // ==========================================
    // RESPONSE
    // ==========================================
    res.status(201).json({
      success: true,

      message:
        "Produce listing created successfully",

      listing: populatedListing,

      // Tell frontend whether a buyer was
      // automatically matched.
      matched:
        matchResult?.matched || false,

      match:
        matchResult?.matched
          ? {
              requestId:
                matchResult.request?._id,
              buyer:
                matchResult.request?.buyer,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "Create listing error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating listing",
    });
  }
};

// ==========================================
// GET ALL ACTIVE LISTINGS
// ==========================================
const getListings = async (req, res) => {
  try {
    const {
      crop,
      town,
      region,
      minPrice,
      maxPrice,
      farmer,
    } = req.query;

    const filter = {
      status: "active",
    };

    // ==========================================
    // FILTER BY CROP
    // ==========================================
    if (crop) {
      filter.crop = {
        $regex: crop,
        $options: "i",
      };
    }

    // ==========================================
    // FILTER BY TOWN
    // ==========================================
    if (town) {
      filter["location.town"] = {
        $regex: town,
        $options: "i",
      };
    }

    // ==========================================
    // FILTER BY REGION
    // ==========================================
    if (region) {
      filter["location.region"] = {
        $regex: region,
        $options: "i",
      };
    }

    // ==========================================
    // FILTER BY PRICE RANGE
    // ==========================================
    if (minPrice || maxPrice) {
      filter.minPrice = {};

      if (minPrice) {
        filter.minPrice.$gte =
          Number(minPrice);
      }

      if (maxPrice) {
        filter.minPrice.$lte =
          Number(maxPrice);
      }
    }

    // ==========================================
    // FILTER BY FARMER
    // ==========================================
    if (farmer) {
      filter.farmer = farmer;
    }

    // ==========================================
    // GET LISTINGS
    // ==========================================
    const listings =
      await Listing.find(filter)
        .populate(
          "farmer",
          "name email phone role location"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error(
      "Get listings error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching listings",
    });
  }
};

// ==========================================
// GET MY LISTINGS
// ==========================================
const getMyListings = async (req, res) => {
  try {
    const listings =
      await Listing.find({
        farmer: req.user._id,
      })
        .populate(
          "farmer",
          "name email phone role location"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error(
      "Get my listings error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching your listings",
    });
  }
};

// ==========================================
// GET SINGLE LISTING
// ==========================================
const getListingById = async (req, res) => {
  try {
    const listing =
      await Listing.findById(
        req.params.id
      ).populate(
        "farmer",
        "name email phone role location"
      );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error(
      "Get listing error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching listing",
    });
  }
};

// ==========================================
// UPDATE MY LISTING
// ==========================================
const updateListing = async (req, res) => {
  try {
    const listing =
      await Listing.findById(
        req.params.id
      );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // ==========================================
    // CHECK OWNER
    // ==========================================
    if (
      listing.farmer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only update your own listings",
      });
    }

    const {
      crop,
      quantity,
      unit,
      minPrice,
      location,
      description,
      status,
      harvestDate,
      availableUntil,
    } = req.body;

    // ==========================================
    // UPDATE CROP
    // ==========================================
    if (crop !== undefined) {
      listing.crop = crop.trim();
    }

    // ==========================================
    // UPDATE QUANTITY
    // ==========================================
    if (quantity !== undefined) {
      if (Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be greater than 0",
        });
      }

      listing.quantity =
        Number(quantity);
    }

    // ==========================================
    // UPDATE UNIT
    // ==========================================
    if (unit !== undefined) {
      const allowedUnits = [
        "kg",
        "tonnes",
        "bags",
        "crates",
      ];

      if (
        !allowedUnits.includes(unit)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid unit. Use kg, tonnes, bags or crates",
        });
      }

      listing.unit = unit;
    }

    // ==========================================
    // UPDATE PRICE
    // ==========================================
    if (minPrice !== undefined) {
      if (Number(minPrice) < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Minimum price cannot be negative",
        });
      }

      listing.minPrice =
        Number(minPrice);
    }

    // ==========================================
    // UPDATE LOCATION
    // ==========================================
    if (location) {
      if (
        location.town !== undefined
      ) {
        listing.location.town =
          location.town.trim();
      }

      if (
        location.region !== undefined
      ) {
        listing.location.region =
          location.region.trim();
      }

      if (
        location.latitude !== undefined
      ) {
        listing.location.latitude =
          Number(location.latitude);
      }

      if (
        location.longitude !== undefined
      ) {
        listing.location.longitude =
          Number(location.longitude);
      }
    }

    // ==========================================
    // UPDATE DESCRIPTION
    // ==========================================
    if (
      description !== undefined
    ) {
      listing.description =
        description.trim();
    }

    // ==========================================
    // UPDATE STATUS
    // ==========================================
    if (status !== undefined) {
      const allowedStatuses = [
        "active",
        "sold",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid listing status",
        });
      }

      listing.status = status;
    }

    // ==========================================
    // UPDATE HARVEST DATE
    // ==========================================
    if (
      harvestDate !== undefined
    ) {
      listing.harvestDate =
        harvestDate;
    }

    // ==========================================
    // UPDATE AVAILABLE UNTIL
    // ==========================================
    if (
      availableUntil !== undefined
    ) {
      listing.availableUntil =
        availableUntil;
    }

    await listing.save();

    // ==========================================
    // IF LISTING IS ACTIVE, CHECK FOR
    // PENDING BUYER REQUESTS
    // ==========================================
    let matchResult = null;

    if (
      listing.status === "active"
    ) {
      try {
        matchResult =
          await matchListingToPendingRequests(
            listing._id
          );
      } catch (matchError) {
        console.error(
          "Automatic buyer matching after update error:",
          matchError
        );
      }
    }

    // ==========================================
    // RETURN UPDATED LISTING
    // ==========================================
    const updatedListing =
      await Listing.findById(
        listing._id
      ).populate(
        "farmer",
        "name email phone role location"
      );

    res.status(200).json({
      success: true,

      message:
        "Listing updated successfully",

      listing: updatedListing,

      matched:
        matchResult?.matched || false,

      match:
        matchResult?.matched
          ? {
              requestId:
                matchResult.request?._id,
              buyer:
                matchResult.request?.buyer,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "Update listing error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating listing",
    });
  }
};

// ==========================================
// DELETE MY LISTING
// ==========================================
const deleteListing = async (req, res) => {
  try {
    const listing =
      await Listing.findById(
        req.params.id
      );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // ==========================================
    // CHECK OWNER
    // ==========================================
    if (
      listing.farmer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own listings",
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Listing deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete listing error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting listing",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
};