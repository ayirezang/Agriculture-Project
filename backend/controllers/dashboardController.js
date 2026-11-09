const Listing = require("../models/Listing");
const BuyerRequest = require("../models/BuyerRequest");
const Interest = require("../models/Interest");

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

    const active = listings.filter(
      (listing) => listing.status === "active"
    );

    const sold = listings.filter(
      (listing) => listing.status === "sold"
    );

    const soldListings = sold.length;

    const recentListings = listings.slice(0, 5);

    // Build transaction history from sold listings. If a buyer had an
    // accepted interest on a listing, use their name; otherwise fall
    // back to a generic label.
    const soldBuyerByListing = {};

    if (sold.length > 0) {
      const acceptedInterests = await Interest.find({
        listing: { $in: sold.map((listing) => listing._id) },
        status: "accepted",
      }).populate("sender", "name");

      for (const interest of acceptedInterests) {
        if (!interest.listing) continue;

        const key = String(interest.listing);

        if (!soldBuyerByListing[key]) {
          soldBuyerByListing[key] = interest.sender
            ? interest.sender.name
            : "Marketplace sale";
        }
      }
    }

    const transactions = sold
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
      )
      .map((listing) => {
        const price = Number(listing.minPrice || 0);
        const quantity = Number(listing.quantity || 0);

        return {
          id: listing._id,
          crop: listing.crop,
          buyer:
            soldBuyerByListing[String(listing._id)] ||
            "Marketplace sale",
          price: `GH₵ ${price.toFixed(2)}/${listing.unit}`,
          total: `GH₵ ${(price * quantity).toFixed(2)}`,
          status: "Completed",
          date: new Date(
            listing.updatedAt
          ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
        };
      });

    // Buyer matches: open buyer requests that fit one of this farmer's
    // active listings (same crop, buyer's maxPrice at or above the
    // listing's minPrice).
    const crops = [
      ...new Set(active.map((l) => String(l.crop).trim().toLowerCase())),
    ];

    const matches = [];
    const upliftPairs = [];

    if (crops.length > 0) {
      const candidates = await BuyerRequest.find({
        crop: { $in: crops },
        status: { $nin: ["cancelled", "completed"] },
      }).populate("buyer", "name email phone");

      for (const req of candidates) {
        const eligible = active.filter(
          (l) =>
            String(l.crop).trim().toLowerCase() ===
              String(req.crop).trim().toLowerCase() &&
            req.maxPrice >= l.minPrice
        );
        if (eligible.length === 0) continue;

        const best = eligible.sort((a, b) => b.minPrice - a.minPrice)[0];

        if (best.minPrice > 0) {
          upliftPairs.push(
            ((req.maxPrice - best.minPrice) / best.minPrice) * 100
          );
        }

        matches.push({ request: req, listing: best });
      }
    }

    const averagePriceUplift =
      upliftPairs.length > 0
        ? Math.round(
            upliftPairs.reduce((sum, v) => sum + v, 0) / upliftPairs.length
          )
        : 0;

    const buyerMatches = matches.map(({ request, listing }) => ({
      id: request._id,
      buyer: request.buyer ? request.buyer.name : "Buyer",
      crop: request.crop,
      offer: request.maxPrice,
      unit: request.unit,
      quantity: request.quantity,
      town: request.location?.town ?? null,
      region: request.location?.region ?? null,
      matchedListing: listing._id,
      listingMinPrice: listing.minPrice,
      status: request.status,
    }));

    // Open requests give farmers a way to respond even
    // when the buyer's price is slightly below their minimum.
    const openRequests = await BuyerRequest.find({
      status: "pending",
    })
      .populate("buyer", "name email phone location")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,

      stats: {
        totalListings,
        activeListings: active.length,
        soldListings,
        buyerMatches: buyerMatches.length,
        completedDeals: soldListings,
        averagePriceUplift,
      },

      recentListings,

      buyerMatches,

      openRequests: openRequests.map((request) => ({
        id: request._id,
        buyer: request.buyer
          ? request.buyer.name
          : "Buyer",
        crop: request.crop,
        offer: request.maxPrice,
        unit: request.unit,
        quantity: request.quantity,
        town:
          request.location?.town ?? null,
        region:
          request.location?.region ?? null,
        requiredBy:
          request.requiredBy ?? null,
        status: request.status,
      })),

      transactions,
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