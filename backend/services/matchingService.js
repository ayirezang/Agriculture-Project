const Listing = require("../models/Listing");

const EARTH_RADIUS_KM = 6371;

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function locationDistanceKm(a, b) {
  if (
    typeof a?.latitude === "number" &&
    typeof a?.longitude === "number" &&
    typeof b?.latitude === "number" &&
    typeof b?.longitude === "number"
  ) {
    return haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
  }

  if (
    a?.town &&
    b?.town &&
    a.town.trim().toLowerCase() === b.town.trim().toLowerCase()
  ) {
    return 0;
  }

  if (
    a?.region &&
    b?.region &&
    a.region.trim().toLowerCase() === b.region.trim().toLowerCase()
  ) {
    return 25;
  }

  return null;
}

function quantityMatchScore(listing, request) {
  if (listing.unit !== request.unit) return 15;

  if (listing.quantity >= request.quantity) return 20;

  const ratio = listing.quantity / request.quantity;
  return Math.round(ratio * 20);
}

function fitScore(listing, request, distanceKm) {
  const priceRatio =
    request.maxPrice > 0
      ? Math.min(listing.minPrice / request.maxPrice, 1)
      : 0;

  const priceScore =
    listing.minPrice <= request.maxPrice
      ? Math.round((1 - priceRatio) * 40)
      : 0;

  const distanceScore =
    distanceKm === null
      ? 15
      : distanceKm <= 0
        ? 25
        : Math.round(Math.max(0, 1 - distanceKm / request.pickupRadius) * 25);

  return priceScore + distanceScore + quantityMatchScore(listing, request) + 15;
}

const findMatchingListings = async (request) => {
  const filter = {
    status: "active",
    crop: new RegExp(`^${escapeRegex(request.crop)}$`, "i"),
    minPrice: { $lte: Number(request.maxPrice) },
  };

  if (request.location?.region) {
    filter["location.region"] = new RegExp(
      `^${escapeRegex(request.location.region)}$`,
      "i"
    );
  }

  const candidates = await Listing.find(filter)
    .populate("farmer", "name email phone role location")
    .lean();

  const matches = candidates
    .map((listing) => {
      const distanceKm = locationDistanceKm(
        request.location,
        listing.location
      );
      return { listing, distanceKm };
    })
    .filter(({ listing, distanceKm }) => {
      if (distanceKm !== null && distanceKm > request.pickupRadius) {
        return false;
      }

      if (
        listing.unit === request.unit &&
        listing.quantity < request.quantity * 0.7
      ) {
        return false;
      }

      return true;
    })
    .map(({ listing, distanceKm }) => {
      const score = fitScore(listing, request, distanceKm);
      return {
        listing,
        distanceKm,
        fitScore: score,
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);

  return matches.slice(0, 10);
};

module.exports = {
  findMatchingListings,
};