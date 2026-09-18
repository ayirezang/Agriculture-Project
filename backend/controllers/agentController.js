const Listing = require("../models/Listing");
const BuyerRequest = require("../models/BuyerRequest");
const { runAgent } = require("../agent/agentService.mjs");
// POST /api/agent/run
// Run the AI agent for one of the farmer's listings.
// Returns ranked buyer matches + an outreach draft.
const runSalesAgent = async (req, res) => {
  let responded = false;
  const safeJson = (status, body) => {
    if (responded) return;
    responded = true;
    res.status(status).json(body);
  };
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return safeJson(404, {
        success: false,
        message: "Listing not found",
      });
    }
    if (listing.farmer.toString() !== req.user._id.toString()) {
      return safeJson(403, {
        success: false,
        message: "You can only run the agent on your own listings",
      });
    }
    const agentListing = {
      crop: listing.crop,
      quantity: listing.quantity,
      unit: listing.unit,
      minPrice: listing.minPrice,
      location: {
        town: listing.location.town,
        region: listing.location.region,
      },
    };
    const requests = await BuyerRequest.find({
      crop: listing.crop.toLowerCase(),
      status: "open",
      maxPrice: { $gte: listing.minPrice },
    }).populate("buyer", "name email phone role");
    const buyerDemands = requests.map((reqDoc) => ({
      id: reqDoc._id.toString(),
      name: reqDoc.buyer?.name || "Buyer",
      crop: reqDoc.crop,
      pricePerKg: reqDoc.maxPrice,
      quantity: reqDoc.quantity,
      town: reqDoc.location.town,
      verified: true,
    }));
    if (buyerDemands.length === 0) {
      return safeJson(200, {
        success: true,
        message: "No open buyer requests match this listing yet",
        matches: [],
        bestMatch: null,
        outreachDraft: "",
      });
    }
    const result = await runAgent(agentListing, buyerDemands);
    safeJson(200, {
      success: true,
      message: "Agent finished",
      listingId: listing._id,
      ...result,
    });
  } catch (error) {
    console.error("Run agent error:", error);
    safeJson(500, {
      success: false,
      message: "Agent failed to run",
      error: error.message,
    });
  }
};
module.exports = { runSalesAgent };
