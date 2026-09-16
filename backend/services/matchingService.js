const Listing = require("../models/Listing");

// Convert supported units to kilograms
const convertToKg = (quantity, unit) => {
  if (unit === "kg") {
    return quantity;
  }

  if (unit === "tonnes") {
    return quantity * 1000;
  }

  // We cannot safely convert bags/crates
  // because their weight can vary.
  return null;
};

// Calculate distance between two coordinates
const calculateDistanceKm = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return null;
  }

  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

// Calculate how well a listing matches a buyer request
const calculateMatchScore = (
  request,
  listing,
  distanceKm
) => {
  let score = 0;

  // -----------------------------
  // 1. CROP MATCH - 35 POINTS
  // -----------------------------
  const requestCrop = request.crop
    .toLowerCase()
    .trim();

  const listingCrop = listing.crop
    .toLowerCase()
    .trim();

  if (requestCrop === listingCrop) {
    score += 35;
  } else {
    return 0;
  }

  // -----------------------------
  // 2. PRICE MATCH - 25 POINTS
  // -----------------------------
  if (listing.minPrice <= request.maxPrice) {
    const priceDifference =
      request.maxPrice - listing.minPrice;

    const pricePercentage =
      request.maxPrice > 0
        ? priceDifference / request.maxPrice
        : 0;

    if (pricePercentage >= 0.2) {
      score += 25;
    } else if (pricePercentage >= 0.1) {
      score += 20;
    } else if (pricePercentage >= 0.05) {
      score += 15;
    } else {
      score += 10;
    }
  } else {
    return 0;
  }

  // -----------------------------
  // 3. QUANTITY MATCH - 20 POINTS
  // -----------------------------
  const requestKg = convertToKg(
    request.quantity,
    request.unit
  );

  const listingKg = convertToKg(
    listing.quantity,
    listing.unit
  );

  if (requestKg !== null && listingKg !== null) {
    if (listingKg >= requestKg) {
      score += 20;
    } else if (listingKg >= requestKg * 0.75) {
      score += 15;
    } else if (listingKg >= requestKg * 0.5) {
      score += 10;
    }
  } else if (request.unit === listing.unit) {
    if (listing.quantity >= request.quantity) {
      score += 20;
    } else if (
      listing.quantity >= request.quantity * 0.75
    ) {
      score += 15;
    }
  }

  // -----------------------------
  // 4. LOCATION - 20 POINTS
  // -----------------------------
  if (distanceKm !== null) {
    if (distanceKm <= request.pickupRadius) {
      if (distanceKm <= 10) {
        score += 20;
      } else if (distanceKm <= 25) {
        score += 17;
      } else if (distanceKm <= 50) {
        score += 12;
      } else {
        score += 5;
      }
    } else {
      return 0;
    }
  } else {
    // Fallback if GPS coordinates aren't available
    const sameTown =
      request.location.town.toLowerCase().trim() ===
      listing.location.town.toLowerCase().trim();

    const sameRegion =
      request.location.region.toLowerCase().trim() ===
      listing.location.region.toLowerCase().trim();

    if (sameTown) {
      score += 20;
    } else if (sameRegion) {
      score += 12;
    } else {
      score += 5;
    }
  }

  return score;
};

// Find farmer listings matching a buyer request
const findMatchingListings = async (request) => {
  const listings = await Listing.find({
    status: "active",
    crop: {
      $regex: `^${request.crop}$`,
      $options: "i",
    },
  })
    .populate(
      "farmer",
      "name email phone role location"
    )
    .sort({ createdAt: -1 });

  const matches = [];

  for (const listing of listings) {
    const distanceKm = calculateDistanceKm(
      request.location.latitude,
      request.location.longitude,
      listing.location.latitude,
      listing.location.longitude
    );

    const score = calculateMatchScore(
      request,
      listing,
      distanceKm
    );

    if (score <= 0) {
      continue;
    }

    matches.push({
      listing,
      matchScore: score,
      distanceKm:
        distanceKm !== null
          ? Number(distanceKm.toFixed(1))
          : null,
    });
  }

  // Highest match first
  matches.sort(
    (a, b) => b.matchScore - a.matchScore
  );

  return matches;
};

module.exports = {
  findMatchingListings,
};