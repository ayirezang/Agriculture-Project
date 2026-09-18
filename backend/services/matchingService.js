const Listing = require("../models/Listing");
const BuyerRequest = require("../models/BuyerRequest");

const EARTH_RADIUS_KM = 6371;

// ==========================================
// ESCAPE REGEX SPECIAL CHARACTERS
// ==========================================
function escapeRegex(text) {
  return String(text).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// ==========================================
// DEGREES TO RADIANS
// ==========================================
function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// ==========================================
// HAVERSINE DISTANCE
// ==========================================
function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return EARTH_RADIUS_KM * c;
}

// ==========================================
// LOCATION DISTANCE
// ==========================================
function locationDistanceKm(a, b) {
  // Use GPS coordinates when available
  if (
    typeof a?.latitude === "number" &&
    typeof a?.longitude === "number" &&
    typeof b?.latitude === "number" &&
    typeof b?.longitude === "number"
  ) {
    return haversineKm(
      a.latitude,
      a.longitude,
      b.latitude,
      b.longitude
    );
  }

  // Same town
  if (
    a?.town &&
    b?.town &&
    a.town.trim().toLowerCase() ===
      b.town.trim().toLowerCase()
  ) {
    return 0;
  }

  // Same region
  if (
    a?.region &&
    b?.region &&
    a.region.trim().toLowerCase() ===
      b.region.trim().toLowerCase()
  ) {
    return 25;
  }

  return null;
}

// ==========================================
// QUANTITY MATCH SCORE
// ==========================================
function quantityMatchScore(listing, request) {
  // Different units receive a smaller score
  if (listing.unit !== request.unit) {
    return 15;
  }

  // Farmer has enough produce
  if (listing.quantity >= request.quantity) {
    return 20;
  }

  // Farmer has part of the required quantity
  const ratio =
    listing.quantity / request.quantity;

  return Math.round(ratio * 20);
}

// ==========================================
// OVERALL FIT SCORE
// ==========================================
function fitScore(
  listing,
  request,
  distanceKm
) {
  const priceRatio =
    request.maxPrice > 0
      ? Math.min(
          listing.minPrice / request.maxPrice,
          1
        )
      : 0;

  const priceScore =
    listing.minPrice <= request.maxPrice
      ? Math.round(
          (1 - priceRatio) * 40
        )
      : 0;

  const distanceScore =
    distanceKm === null
      ? 15
      : distanceKm <= 0
        ? 25
        : Math.round(
            Math.max(
              0,
              1 -
                distanceKm /
                  request.pickupRadius
            ) * 25
          );

  return (
    priceScore +
    distanceScore +
    quantityMatchScore(
      listing,
      request
    ) +
    15
  );
}

// ==========================================
// FIND MATCHING FARMER LISTINGS
// ==========================================
const findMatchingListings = async (
  request
) => {
  const filter = {
    status: "active",

    crop: new RegExp(
      `^${escapeRegex(request.crop)}$`,
      "i"
    ),

    minPrice: {
      $lte: Number(request.maxPrice),
    },
  };

  // ==========================================
  // MATCH BY REGION
  // ==========================================
  if (request.location?.region) {
    filter["location.region"] =
      new RegExp(
        `^${escapeRegex(
          request.location.region
        )}$`,
        "i"
      );
  }

  // ==========================================
  // FIND FARMER LISTINGS
  // ==========================================
  const candidates =
    await Listing.find(filter)
      .populate(
        "farmer",
        "name email phone role location"
      )
      .lean();

  // ==========================================
  // CALCULATE MATCHES
  // ==========================================
  const matches = candidates

    .map((listing) => {
      const distanceKm =
        locationDistanceKm(
          request.location,
          listing.location
        );

      return {
        listing,
        distanceKm,
      };
    })

    // ==========================================
    // FILTER OUT BAD MATCHES
    // ==========================================
    .filter(
      ({
        listing,
        distanceKm,
      }) => {
        // Outside buyer's pickup radius
        if (
          distanceKm !== null &&
          distanceKm >
            request.pickupRadius
        ) {
          return false;
        }

        // If units are the same, don't accept
        // listings with less than 70% of requested
        // quantity.
        if (
          listing.unit ===
            request.unit &&
          listing.quantity <
            request.quantity * 0.7
        ) {
          return false;
        }

        return true;
      }
    )

    // ==========================================
    // CALCULATE FIT SCORE
    // ==========================================
    .map(
      ({
        listing,
        distanceKm,
      }) => {
        const score =
          fitScore(
            listing,
            request,
            distanceKm
          );

        return {
          listing,
          distanceKm,
          fitScore: score,
        };
      }
    )

    // ==========================================
    // BEST MATCH FIRST
    // ==========================================
    .sort(
      (a, b) =>
        b.fitScore - a.fitScore
    );

  // Return the top 10 possible matches
  return matches.slice(0, 10);
};

// ==========================================
// AUTOMATICALLY MATCH A BUYER REQUEST
// ==========================================
// This function takes a pending buyer request,
// finds the best farmer listing and saves the
// relationship in MongoDB.
//
// pending
//    ↓
// matched
// ==========================================
const matchBuyerRequest = async (
  requestId
) => {
  try {
    const request =
      await BuyerRequest.findById(
        requestId
      );

    if (!request) {
      return {
        matched: false,
        message:
          "Buyer request not found",
      };
    }

    // Don't rematch requests that are no longer pending
    if (
      request.status !== "pending"
    ) {
      return {
        matched: false,
        message:
          "Buyer request is no longer pending",
      };
    }

    // ==========================================
    // FIND POSSIBLE FARMERS
    // ==========================================
    const matches =
      await findMatchingListings(
        request
      );

    // No farmer found
    if (
      !matches ||
      matches.length === 0
    ) {
      return {
        matched: false,
        message:
          "No matching farmer found yet",
        matches: [],
      };
    }

    // ==========================================
    // TAKE THE BEST MATCH
    // ==========================================
    const bestMatch =
      matches[0];

    const farmer =
      bestMatch.listing.farmer;

    // ==========================================
    // SAVE MATCH TO BUYER REQUEST
    // ==========================================
    request.status = "matched";

    request.matchedFarmer =
      farmer?._id ||
      farmer;

    request.matchedListing =
      bestMatch.listing._id;

    await request.save();

    // ==========================================
    // RETURN MATCH INFORMATION
    // ==========================================
    return {
      matched: true,

      message:
        "Farmer successfully matched",

      request,

      match: bestMatch,
    };
  } catch (error) {
    console.error(
      "Match buyer request error:",
      error
    );

    throw error;
  }
};

// ==========================================
// FIND AND AUTOMATICALLY MATCH PENDING
// REQUESTS FOR A NEW FARMER LISTING
// ==========================================
// We will call this when a farmer creates
// a new listing.
//
// Example:
//
// Farmer posts:
// Maize - 500kg - GHS 3.60
//
// This function searches pending buyer
// requests for a suitable match.
// ==========================================
const matchListingToPendingRequests =
  async (listingId) => {
    try {
      const listing =
        await Listing.findById(
          listingId
        );

      if (!listing) {
        return {
          matched: false,
          message:
            "Listing not found",
        };
      }

      // Only active listings can match buyers
      if (
        listing.status !== "active"
      ) {
        return {
          matched: false,
          message:
            "Listing is not active",
        };
      }

      // ==========================================
      // FIND PENDING BUYER REQUESTS
      // ==========================================
      const pendingRequests =
        await BuyerRequest.find({
          status: "pending",

          crop: new RegExp(
            `^${escapeRegex(
              listing.crop
            )}$`,
            "i"
          ),

          maxPrice: {
            $gte: Number(
              listing.minPrice
            ),
          },
        }).sort({
          createdAt: 1,
        });

      // ==========================================
      // CHECK EACH REQUEST
      // ==========================================
      for (
        const request of pendingRequests
      ) {
        // Find possible matches for this request
        const matches =
          await findMatchingListings(
            request
          );

        // Find the newly-created listing
        // inside the matching results
        const matchingListing =
          matches.find(
            (match) =>
              match.listing._id.toString() ===
              listing._id.toString()
          );

        // This listing does not satisfy
        // this buyer's requirements
        if (!matchingListing) {
          continue;
        }

        // ==========================================
        // MATCH FOUND
        // ==========================================
        request.status =
          "matched";

        request.matchedFarmer =
          listing.farmer;

        request.matchedListing =
          listing._id;

        await request.save();

        console.log(
          `Buyer request ${request._id} matched with listing ${listing._id}`
        );

        // One listing should satisfy one request
        // for now.
        return {
          matched: true,
          request,
          listing,
          match: matchingListing,
        };
      }

      return {
        matched: false,
        message:
          "No pending buyer request matched this listing",
      };
    } catch (error) {
      console.error(
        "Match listing to buyer requests error:",
        error
      );

      throw error;
    }
  };

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  findMatchingListings,
  matchBuyerRequest,
  matchListingToPendingRequests,
};