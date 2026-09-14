const Listing = require("../models/Listing");

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

    // Check required fields
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

    // Make sure quantity is valid
    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Make sure price is valid
    if (Number(minPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: "Minimum price cannot be negative",
      });
    }

    const listing = await Listing.create({
      farmer: req.user._id,

      crop: crop.trim(),

      quantity: Number(quantity),

      unit: unit || "kg",

      minPrice: Number(minPrice),

      location: {
        town: location.town.trim(),
        region: location.region.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      },

      description: description?.trim() || "",

      harvestDate: harvestDate || undefined,

      availableUntil: availableUntil || undefined,
    });

    // Return the listing with farmer information
    const populatedListing = await Listing.findById(listing._id)
      .populate("farmer", "name email phone role location");

    res.status(201).json({
      success: true,
      message: "Produce listing created successfully",
      listing: populatedListing,
    });
  } catch (error) {
    console.error("Create listing error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating listing",
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

    // Filter by crop
    if (crop) {
      filter.crop = {
        $regex: crop,
        $options: "i",
      };
    }

    // Filter by town
    if (town) {
      filter["location.town"] = {
        $regex: town,
        $options: "i",
      };
    }

    // Filter by region
    if (region) {
      filter["location.region"] = {
        $regex: region,
        $options: "i",
      };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.minPrice = {};

      if (minPrice) {
        filter.minPrice.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.minPrice.$lte = Number(maxPrice);
      }
    }

    // Filter by specific farmer
    if (farmer) {
      filter.farmer = farmer;
    }

    const listings = await Listing.find(filter)
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
    console.error("Get listings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching listings",
    });
  }
};

// ==========================================
// GET MY LISTINGS
// ==========================================
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({
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
    console.error("Get my listings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching your listings",
    });
  }
};

// ==========================================
// GET SINGLE LISTING
// ==========================================
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
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
    console.error("Get listing error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching listing",
    });
  }
};

// ==========================================
// UPDATE MY LISTING
// ==========================================
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Only the farmer who created the listing can update it
    if (listing.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own listings",
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

    if (crop !== undefined) listing.crop = crop.trim();

    if (quantity !== undefined) {
      if (Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        });
      }

      listing.quantity = Number(quantity);
    }

    if (unit !== undefined) listing.unit = unit;

    if (minPrice !== undefined) {
      if (Number(minPrice) < 0) {
        return res.status(400).json({
          success: false,
          message: "Minimum price cannot be negative",
        });
      }

      listing.minPrice = Number(minPrice);
    }

    if (location) {
      if (location.town !== undefined) {
        listing.location.town = location.town.trim();
      }

      if (location.region !== undefined) {
        listing.location.region = location.region.trim();
      }

      if (location.latitude !== undefined) {
        listing.location.latitude = location.latitude;
      }

      if (location.longitude !== undefined) {
        listing.location.longitude = location.longitude;
      }
    }

    if (description !== undefined) {
      listing.description = description.trim();
    }

    if (status !== undefined) {
      listing.status = status;
    }

    if (harvestDate !== undefined) {
      listing.harvestDate = harvestDate;
    }

    if (availableUntil !== undefined) {
      listing.availableUntil = availableUntil;
    }

    await listing.save();

    const updatedListing = await Listing.findById(listing._id).populate(
      "farmer",
      "name email phone role location"
    );

    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Update listing error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating listing",
    });
  }
};

// ==========================================
// DELETE MY LISTING
// ==========================================
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Only the owner can delete it
    if (listing.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own listings",
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting listing",
    });
  }
};

module.exports = {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
};