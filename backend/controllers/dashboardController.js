const Listing = require("../models/Listing");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const listings = await Listing.find({
      farmer: userId,
    })
      .populate(
        "farmer",
        "name email phone role location"
      )
      .sort({ createdAt: -1 });

    const totalListings = listings.length;

    const activeListings = listings.filter(
      (listing) => listing.status === "active"
    ).length;

    const soldListings = listings.filter(
      (listing) => listing.status === "sold"
    ).length;

    const recentListings = listings.slice(0, 5);

    res.status(200).json({
      success: true,

      stats: {
        totalListings,
        activeListings,
        soldListings,
        buyerMatches: 0,
        completedDeals: soldListings,
        averagePriceUplift: 0,
      },

      recentListings,

      buyerMatches: [],

      transactions: [],
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while loading dashboard",
    });
  }
};

module.exports = {
  getDashboard,
};