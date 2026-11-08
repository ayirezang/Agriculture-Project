const Listing = require("../models/Listing");
const BuyerRequest = require("../models/BuyerRequest");
const { runAgent, runBuyerAgent } = require("../agent/agentService.mjs");
const { findMatchingListings } = require("../services/matchingService");
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
    // Attach the buyer's contact details so the farmer can act on a match.
    const contactByName = new Map();
    requests.forEach((reqDoc) => {
      const name = reqDoc.buyer?.name;
      if (!name) return;
      contactByName.set(name.trim().toLowerCase(), {
        phone: reqDoc.buyer?.phone || "",
        buyerId: reqDoc.buyer?._id ? String(reqDoc.buyer._id) : "",
        requestId: String(reqDoc._id),
      });
    });

    const matches = (result.matches || [])
      .map((m) => {
        const contact = contactByName.get(
          String(m.buyer || "").trim().toLowerCase(),
        );
        return {
          ...m,
          phone: contact?.phone || "",
          buyerId: contact?.buyerId || "",
          requestId: contact?.requestId || "",
          fitScore: priceFit(m.offer) ?? m.fitScore ?? 0,
        };
      })
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
// POST /api/agent/buyer/run/:id
// Run the AI sourcing agent for one of the buyer's requests.
// Returns ranked farmer matches + an outreach draft.
const runBuyerSourcingAgent = async (req, res) => {
  let responded = false;
  const safeJson = (status, body) => {
    if (responded) return;
    responded = true;
    res.status(status).json(body);
  };
  try {
    const buyerRequest = await BuyerRequest.findById(req.params.id);
    if (!buyerRequest) {
      return safeJson(404, {
        success: false,
        message: "Buyer request not found",
      });
    }
    if (buyerRequest.buyer.toString() !== req.user._id.toString()) {
      return safeJson(403, {
        success: false,
        message: "You can only run the agent on your own requests",
      });
    }
    if (buyerRequest.status === "cancelled") {
      return safeJson(400, {
        success: false,
        message: "This request has been cancelled",
      });
    }
    if (buyerRequest.status === "completed") {
      return safeJson(400, {
        success: false,
        message: "This request has already been completed",
      });
    }

    const candidates = await findMatchingListings(buyerRequest);

    if (candidates.length === 0) {
      return safeJson(200, {
        success: true,
        message: "No active farmer listings match this request yet",
        matches: [],
        bestMatch: null,
        outreachDraft: "",
      });
    }

    const agentRequest = {
      crop: buyerRequest.crop,
      quantity: buyerRequest.quantity,
      unit: buyerRequest.unit,
      maxPrice: buyerRequest.maxPrice,
      location: {
        town: buyerRequest.location.town,
        region: buyerRequest.location.region,
      },
      pickupRadius: buyerRequest.pickupRadius,
      description: buyerRequest.description,
      requiredBy: buyerRequest.requiredBy,
    };

    const agentListings = candidates.map(({ listing, distanceKm, fitScore }) => ({
      id: listing._id.toString(),
      farmer: listing.farmer?.name || "Farmer",
      crop: listing.crop,
      quantity: listing.quantity,
      unit: listing.unit,
      pricePerKg: listing.minPrice,
      town: listing.location?.town,
      region: listing.location?.region,
      distanceKm,
      fitScore,
    }));

    const result = await runBuyerAgent(agentRequest, agentListings);
    const aiMatches = Array.isArray(result.matches) ? result.matches : [];
    const aiByListingId = new Map(
      aiMatches
        .filter((match) => match?.listingId)
        .map((match) => [String(match.listingId), match]),
    );
    const aiByFarmer = new Map(
      aiMatches
        .filter((match) => match?.farmer)
        .map((match) => [match.farmer, match]),
    );

    // The matching service already ranks real listings deterministically,
    // so always return its candidates. The AI supplies the reasons and the
    // outreach draft; if its reply was unusable we fall back gracefully.
    const matches = candidates
      .map(({ listing, distanceKm, fitScore }) => {
        const aiMatch =
          aiByListingId.get(listing._id.toString()) ||
          aiByFarmer.get(listing.farmer?.name) ||
          null;
        const reason =
          aiMatch?.reason ||
          [
            listing.minPrice <= buyerRequest.maxPrice
              ? "Within your maximum price"
              : "Above your maximum price — negotiate",
            distanceKm === null
              ? "Distance unknown"
              : distanceKm <= 0
                ? "Same town"
                : `${Math.round(distanceKm)} km from you`,
            `${listing.quantity} ${listing.unit} available`,
          ].join(" • ");
        return {
          listingId: listing._id,
          farmer: listing.farmer?.name || "Farmer",
          farmerId: listing.farmer?._id ? String(listing.farmer._id) : "",
          phone: listing.farmer?.phone || "",
          crop: listing.crop,
          quantity: listing.quantity,
          unit: listing.unit,
          price: listing.minPrice,
          town: listing.location?.town,
          region: listing.location?.region,
          distanceKm,
          fitScore,
          reason,
        };
      })
      .sort((a, b) => b.fitScore - a.fitScore);

    const bestMatch = matches[0] || null;
    const fallbackDraft = bestMatch
      ? `Hello ${bestMatch.farmer}, I saw your ${bestMatch.crop} listing ` +
        `on AgriConnect: ${bestMatch.quantity} ${bestMatch.unit} at ` +
        `GH₵${Number(bestMatch.price).toFixed(2)}/${bestMatch.unit} in ` +
        `${bestMatch.town || "your area"}. I need ` +
        `${buyerRequest.quantity} ${buyerRequest.unit} and your price is ` +
        `within my budget of GH₵${Number(buyerRequest.maxPrice).toFixed(2)}/` +
        `${buyerRequest.unit}. Is it still available, and can we arrange ` +
        `pickup or delivery? Thank you.`
      : "";

    safeJson(200, {
      success: true,
      message:
        result?.success === false
          ? "Agent finished with a direct match"
          : "Agent finished",
      requestId: buyerRequest._id,
      matches,
      bestMatch,
      outreachDraft: result.outreachDraft || fallbackDraft,
      ...(result?.success === false && result.raw
        ? { raw: result.raw }
        : {}),
    });
  } catch (error) {
    console.error("Run buyer agent error:", error);
    safeJson(500, {
      success: false,
      message: "Agent failed to run",
      error: error.message,
    });
  }
};

module.exports = { runSalesAgent, runBuyerSourcingAgent };
