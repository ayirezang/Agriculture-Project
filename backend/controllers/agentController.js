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
    const escapeRegex = (text) =>
      String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const requests = await BuyerRequest.find({
      crop: new RegExp(
        `^${escapeRegex(listing.crop.trim().toLowerCase())}$`,
        "i",
      ),
      status: { $nin: ["cancelled", "fulfilled"] },
    }).populate("buyer", "name email phone role");
    const priceFit = (offer) => {
      const min = Number(listing.minPrice) || 0;
      if (!(min > 0)) return 100;
      const offerValue = Number(offer);
      if (!Number.isFinite(offerValue)) return null;
      return Math.round(Math.min(offerValue / min, 1) * 100);
    };
    const buyerDemands = requests.map((reqDoc) => ({
      id: reqDoc._id.toString(),
      name: reqDoc.buyer?.name || "Buyer",
      crop: reqDoc.crop,
      pricePerKg: reqDoc.maxPrice,
      quantity: reqDoc.quantity,
      town: reqDoc.location.town,
      verified: true,
      fitScore: priceFit(reqDoc.maxPrice),
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
    if (result?.success === false) {
      return safeJson(200, {
        success: false,
        message: result.message,
        matches: [],
        bestMatch: null,
        outreachDraft: "",
        raw: result.raw,
      });
    }
    const matches = (result.matches || [])
      .map((m) => ({
        ...m,
        fitScore: priceFit(m.offer) ?? m.fitScore ?? 0,
      }))
      .sort((a, b) => b.fitScore - a.fitScore);
    safeJson(200, {
      success: true,
      message: "Agent finished",
      listingId: listing._id,
      ...result,
      matches,
      bestMatch: matches[0] || null,
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
