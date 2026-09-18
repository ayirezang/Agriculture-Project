import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  X,
  MessageSquare,
  RefreshCw,
  Package,
  Loader2,
  CheckCircle2,
  UserPlus,
} from "lucide-react";

import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";

const API_URL = "http://localhost:5000/api";

export default function Marketplace({ user }) {
  const [listings, setListings] = useState([]);
  const [crop, setCrop] = useState("All crops");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // BUYER REQUEST FORM
  // ==========================================

  const [showRequestForm, setShowRequestForm] =
    useState(false);
  const [requestForm, setRequestForm] = useState({
    crop: "",
    quantity: "",
    unit: "kg",
    maxPrice: "",
    town: user?.location?.town || "",
    region: user?.location?.region || "",
    pickupRadius: "25",
    description: "",
    requiredBy: "",
  });
  const [requestLoading, setRequestLoading] =
    useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] =
    useState("");

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setRequestError("");
    setRequestSuccess("");
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError("");
    setRequestSuccess("");

    if (
      !requestForm.crop.trim() ||
      !requestForm.quantity ||
      !requestForm.maxPrice ||
      !requestForm.town.trim() ||
      !requestForm.region.trim()
    ) {
      setRequestError("Please fill in all required fields.");
      return;
    }

    if (Number(requestForm.quantity) <= 0) {
      setRequestError("Quantity must be greater than 0.");
      return;
    }

    if (Number(requestForm.maxPrice) < 0) {
      setRequestError("Maximum price cannot be negative.");
      return;
    }

    try {
      setRequestLoading(true);

      const token = localStorage.getItem("agriconnect_token");

      if (!token) {
        setRequestError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/buyer-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop: requestForm.crop.trim(),
          quantity: Number(requestForm.quantity),
          unit: requestForm.unit,
          maxPrice: Number(requestForm.maxPrice),
          location: {
            town: requestForm.town.trim(),
            region: requestForm.region.trim(),
          },
          pickupRadius: Number(requestForm.pickupRadius) || 25,
          description: requestForm.description.trim(),
          requiredBy: requestForm.requiredBy || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setRequestError(data.message || "Unable to submit your request.");
        return;
      }

      setRequestSuccess("Your buyer request has been posted successfully!");
      setRequestForm({
        crop: "",
        quantity: "",
        unit: "kg",
        maxPrice: "",
        town: user?.location?.town || "",
        region: user?.location?.region || "",
        pickupRadius: "25",
        description: "",
        requiredBy: "",
      });
    } catch (err) {
      console.error("Create buyer request error:", err);
      setRequestError(
        "Unable to connect to the server. Make sure the backend is running on port 5000."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // ==========================================
  // MAKE AN OFFER (pre-fills the buyer request)
  // ==========================================

  const handleMakeOffer = (listing) => {
    if (!user) return;

    setRequestForm((prev) => ({
      ...prev,
      crop: listing.crop,
      unit: listing.unit || prev.unit,
      town: listing.location?.town || prev.town,
      region: listing.location?.region || prev.region,
    }));

    setSelected(null);
    setShowRequestForm(true);
  };

  // ==========================================
  // FETCH REAL LISTINGS FROM BACKEND
  // ==========================================

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/listings`);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load marketplace listings."
        );
      }

      setListings(data.listings || []);
    } catch (err) {
      console.error("Marketplace error:", err);

      setError(
        err.message ||
          "Unable to connect to the AgriConnect backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // ==========================================
  // GET UNIQUE CROPS
  // ==========================================

  const crops = useMemo(() => {
    const uniqueCrops = [
      ...new Set(
        listings
          .map((listing) => listing.crop)
          .filter(Boolean)
      ),
    ];

    return ["All crops", ...uniqueCrops];
  }, [listings]);

  // ==========================================
  // FILTER LISTINGS
  // ==========================================

  const filtered = useMemo(() => {
    return listings.filter((listing) => {
      const matchesCrop =
        crop === "All crops" ||
        listing.crop?.toLowerCase() === crop.toLowerCase();

      const searchText = `
        ${listing.crop || ""}
        ${listing.location?.town || ""}
        ${listing.location?.region || ""}
        ${listing.farmer?.name || ""}
      `.toLowerCase();

      const matchesSearch = searchText.includes(
        query.toLowerCase()
      );

      return matchesCrop && matchesSearch;
    });
  }, [listings, crop, query]);

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setCrop("All crops");
    setQuery("");
  };

  // ==========================================
  // FORMAT PRICE
  // ==========================================

  const formatPrice = (price) => {
    return Number(price || 0).toFixed(2);
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Recently listed";

    return new Date(date).toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      {/* ==========================================
          HEADER
      ========================================== */}

      <SectionHeader
        eyebrow="Real marketplace"
        title="Available produce"
        description={
          user?.name
            ? `Browse produce listed by farmers. Welcome, ${user.name}.`
            : "Browse fresh produce listed by farmers."
        }
        action={
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <UserPlus size={16} />
                Post a request
              </button>
            )}

            <button
              onClick={fetchListings}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </div>
        }
      />

      {/* ==========================================
          SEARCH + FILTERS
      ========================================== */}

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_200px_auto]">
        {/* Search */}

        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <Search
            size={18}
            className="shrink-0 text-slate-400"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search crop, farmer or location..."
          />
        </div>

        {/* Crop */}

        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500"
        >
          {crops.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        {/* More Filters */}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          <SlidersHorizontal
            size={16}
            className="mr-2 inline"
          />

          More filters
        </button>
      </div>

      {/* ==========================================
          QUICK FILTERS
      ========================================== */}

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
          <span className="font-bold text-emerald-800">
            Quick filters:
          </span>

          <button
            onClick={() => setQuery("Koforidua")}
            className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Near Koforidua
          </button>

          <button
            onClick={() => setQuery("Eastern")}
            className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Eastern Region
          </button>

          <button
            onClick={clearFilters}
            className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Clear filters
          </button>

          <button
            onClick={() => setShowFilters(false)}
            className="ml-auto rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ==========================================
          RESULTS COUNT
      ========================================== */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-900">
            {filtered.length}
          </span>{" "}
          produce listing
          {filtered.length !== 1 ? "s" : ""}
        </p>

        {(query || crop !== "All crops") && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-emerald-600"
          />

          <h3 className="mt-4 text-lg font-extrabold text-slate-900">
            Loading marketplace...
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Getting the latest produce listings.
          </p>
        </div>
      )}

      {/* ==========================================
          ERROR
      ========================================== */}

      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h3 className="text-lg font-extrabold text-red-800">
            Unable to load marketplace
          </h3>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={fetchListings}
            className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* ==========================================
          LISTINGS
      ========================================== */}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((listing) => {
            const farmerName =
              listing.farmer?.name || "AgriConnect Farmer";

            const initials = farmerName
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <article
                key={listing._id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* ==========================================
                    FARMER HEADER
                ========================================== */}

                <div className="flex gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-sm font-black text-emerald-700">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900">
                        {farmerName}
                      </h3>

                      <ShieldCheck
                        size={16}
                        className="text-emerald-500"
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Farmer • Listed{" "}
                      {formatDate(listing.createdAt)}
                    </p>
                  </div>

                  <Badge tone="green">
                    {listing.status}
                  </Badge>
                </div>

                {/* ==========================================
                    PRODUCE INFORMATION
                ========================================== */}

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Crop
                    </p>

                    <p className="mt-1 text-sm font-extrabold">
                      {listing.crop}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Quantity
                    </p>

                    <p className="mt-1 text-sm font-extrabold">
                      {listing.quantity} {listing.unit}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Min. price
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-emerald-700">
                      GH₵ {formatPrice(listing.minPrice)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Available
                    </p>

                    <p className="mt-1 text-sm font-extrabold">
                      {listing.availableUntil
                        ? formatDate(
                            listing.availableUntil
                          )
                        : "Open"}
                    </p>
                  </div>
                </div>

                {/* ==========================================
                    LOCATION
                ========================================== */}

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>
                    <MapPin
                      size={14}
                      className="mr-1 inline text-emerald-600"
                    />

                    {listing.location?.town},{" "}
                    {listing.location?.region}
                  </span>

                  <span>
                    <Truck
                      size={14}
                      className="mr-1 inline text-emerald-600"
                    />

                    Pickup / delivery negotiable
                  </span>

                  <button
                    onClick={() =>
                      setSelected(listing)
                    }
                    className="ml-auto font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    View details →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ==========================================
          NO LISTINGS
      ========================================== */}

      {!loading &&
        !error &&
        filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
              <Package
                size={24}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-slate-900">
              No produce listings found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are currently no produce listings
              matching your search or filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Clear filters
            </button>
          </div>
        )}

      {/* ==========================================
          LISTING DETAILS MODAL
      ========================================== */}

      {selected && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge>
                  Produce listing
                </Badge>

                <h2 className="mt-3 text-2xl font-black text-slate-900">
                  {selected.crop}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selected.location?.town},{" "}
                  {selected.location?.region}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details */}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Farmer
                </p>

                <b>
                  {selected.farmer?.name ||
                    "AgriConnect Farmer"}
                </b>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Quantity
                </p>

                <b>
                  {selected.quantity}{" "}
                  {selected.unit}
                </b>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Minimum price
                </p>

                <b className="text-emerald-700">
                  GH₵{" "}
                  {formatPrice(selected.minPrice)}
                  /{selected.unit}
                </b>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Status
                </p>

                <b className="capitalize">
                  {selected.status}
                </b>
              </div>
            </div>

            {/* Description */}

            {selected.description && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-400">
                  DESCRIPTION
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selected.description}
                </p>
              </div>
            )}

            {/* Action */}

            <button
              onClick={() => handleMakeOffer(selected)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              <MessageSquare size={16} />

              Make an offer
            </button>
          </div>
        </div>
      )}
      {/* ==========================================
          BUYER REQUEST FORM MODAL
      ========================================== */}

      {showRequestForm && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/50 p-4"
          onClick={() => {
            setShowRequestForm(false);
            setRequestError("");
            setRequestSuccess("");
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <UserPlus size={12} />
                  Buyer request
                </div>

                <h2 className="mt-3 text-2xl font-black text-slate-900">
                  What are you looking for?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Post what you need and farmers will respond.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowRequestForm(false);
                  setRequestError("");
                  setRequestSuccess("");
                }}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success */}

            {requestSuccess && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />

                <div>
                  <p>{requestSuccess}</p>

                  <button
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestSuccess("");
                    }}
                    className="mt-1 text-xs font-black underline"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {!requestSuccess && (
              <form onSubmit={handleRequestSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-600">Crop *</span>
                    <input
                      name="crop"
                      value={requestForm.crop}
                      onChange={handleRequestChange}
                      placeholder="e.g. Maize"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold text-slate-600">Quantity *</span>
                    <div className="mt-2 flex">
                      <input
                        type="number"
                        min="1"
                        name="quantity"
                        value={requestForm.quantity}
                        onChange={handleRequestChange}
                        placeholder="e.g. 500"
                        className="w-full rounded-l-2xl border border-r-0 border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                      <select
                        name="unit"
                        value={requestForm.unit}
                        onChange={handleRequestChange}
                        className="rounded-r-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="tonnes">tonnes</option>
                        <option value="bags">bags</option>
                        <option value="crates">crates</option>
                      </select>
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-bold text-slate-600">Maximum price *</span>
                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                    <span className="mr-2 text-sm font-bold text-slate-400">GH₵</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="maxPrice"
                      value={requestForm.maxPrice}
                      onChange={handleRequestChange}
                      placeholder="3.50"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                    <span className="text-xs text-slate-400">/{requestForm.unit}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Farmers should not charge above this amount.
                  </p>
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-600">Town / City *</span>
                    <input
                      name="town"
                      value={requestForm.town}
                      onChange={handleRequestChange}
                      placeholder="e.g. Koforidua"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold text-slate-600">Region *</span>
                    <input
                      name="region"
                      value={requestForm.region}
                      onChange={handleRequestChange}
                      placeholder="e.g. Eastern Region"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-bold text-slate-600">Pickup radius (km)</span>
                  <input
                    type="number"
                    min="0"
                    name="pickupRadius"
                    value={requestForm.pickupRadius}
                    onChange={handleRequestChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-600">Description</span>
                  <textarea
                    name="description"
                    value={requestForm.description}
                    onChange={handleRequestChange}
                    rows="3"
                    placeholder="Quality requirements, delivery preferences, etc."
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-600">Required by</span>
                  <input
                    type="date"
                    name="requiredBy"
                    value={requestForm.requiredBy}
                    onChange={handleRequestChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                </label>

                {requestError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {requestError}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestError("");
                      setRequestSuccess("");
                    }}
                    className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {requestLoading && (
                      <Loader2 size={17} className="animate-spin" />
                    )}
                    {requestLoading ? "Posting request..." : "Post buyer request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}