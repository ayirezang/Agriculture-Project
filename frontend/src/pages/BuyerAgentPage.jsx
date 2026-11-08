import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  CircleDot,
  Copy,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Badge from "../components/ui/Badge";

const API_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

// Convert a local phone number (e.g. 024 123 4567)
// into the international format WhatsApp expects.
const toWhatsAppNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;

  return digits;
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "absolute";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
};

const steps = [
  ["Search farmers", "Active listings for the crop you need"],
  ["Rank matches", "Fit score from price, distance and quantity"],
  ["Draft outreach", "Draft only, never sent automatically"],
  ["Agree terms", "Bounded by your maximum price"],
];

const isActiveRequest = (request) =>
  !["cancelled", "completed"].includes(request?.status);

export default function BuyerAgentPage({ user, onNavigate }) {
  // ==========================================
  // BUYER'S REQUESTS
  // ==========================================

  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // AGENT RUN STATE
  // ==========================================

  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState("");
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [savedId, setSavedId] = useState("");

  const selectedRequest =
    requests.find((request) => request._id === selectedId) || null;

  // ==========================================
  // FETCH MY BUYER REQUESTS
  // ==========================================

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("agriconnect_token");

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/buyer-requests/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load your buying requests."
        );
      }

      const myRequests = (data.requests || []).filter(isActiveRequest);
      setRequests(myRequests);
      setSelectedId((prev) =>
        myRequests.some((request) => request._id === prev)
          ? prev
          : myRequests[0]?._id || ""
      );
    } catch (err) {
      console.error("Buyer agent requests error:", err);
      setError(
        err.message ||
          "Unable to connect to the AgriConnect backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ==========================================
  // ANIMATE STEPS WHILE THE AGENT RUNS
  // ==========================================

  useEffect(() => {
    if (!running) {
      setActiveStep(-1);
      return;
    }

    setActiveStep(0);

    const timer = setInterval(() => {
      setActiveStep((step) => (step < 3 ? step + 1 : step));
    }, 12000);

    return () => clearInterval(timer);
  }, [running]);

  // ==========================================
  // RUN THE BUYER AGENT
  // ==========================================

  const runAgent = async () => {
    if (!selectedId) return;

    setRunning(true);
    setRunError("");
    setResult(null);

    try {
      const token = localStorage.getItem("agriconnect_token");

      if (!token) {
        setRunError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/agent/buyer/run/${selectedId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setRunError(data.message || "Agent failed to run.");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Buyer agent run error:", err);
      setRunError(
        "Unable to reach the backend. Make sure it is running on port 5000."
      );
    } finally {
      setRunning(false);
    }
  };

  const matches = result?.matches || [];
  const bestMatch = result?.bestMatch || null;
  const draftText = result?.outreachDraft || "";

  const initialsFor = (name = "Farmer") =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const formatPrice = (price) => Number(price || 0).toFixed(2);

  const formatDistance = (distanceKm) => {
    if (distanceKm === null || distanceKm === undefined) {
      return "Distance unknown";
    }
    if (Number(distanceKm) <= 0) {
      return "Same town";
    }
    return `${Math.round(Number(distanceKm))} km away`;
  };

  const openOutreach = () => {
    setActionMessage("");
    setSavedId("");
    setOutreachOpen(true);
  };

  const saveOutreach = async ({
    status = "drafted",
    channel = "whatsapp",
  } = {}) => {
    const token = localStorage.getItem("agriconnect_token");

    if (!token) {
      setActionMessage("Your session has expired. Please login again.");
      return null;
    }

    if (!draftText.trim()) {
      setActionMessage("There is no draft to save yet.");
      return null;
    }

    setSaving(true);
    setActionMessage("");

    try {
      const response = await fetch(`${API_URL}/outreach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buyerRequestId: selectedRequest?._id,
          counterpartyId: bestMatch?.farmerId,
          counterpartyName: bestMatch?.farmer || "Farmer",
          counterpartyPhone: bestMatch?.phone || "",
          crop: selectedRequest?.crop,
          quantity: selectedRequest?.quantity,
          unit: selectedRequest?.unit,
          message: draftText,
          channel,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save outreach.");
      }

      setSavedId(data.outreach?._id || "");
      setActionMessage(
        status === "sent"
          ? "Outreach saved as sent."
          : "Draft saved to your outreach pipeline."
      );

      return data.outreach;
    } catch (err) {
      console.error("Save outreach error:", err);
      setActionMessage(err.message || "Unable to save outreach.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!draftText.trim()) {
      setActionMessage("There is no draft to copy yet.");
      return;
    }

    try {
      await copyText(draftText);
      setActionMessage(
        "Message copied. Paste it into WhatsApp, SMS or your email."
      );
    } catch (err) {
      console.error("Copy error:", err);
      setActionMessage(
        "Could not copy automatically. Select the text and copy it manually."
      );
    }
  };

  const handleWhatsApp = async () => {
    const number = toWhatsAppNumber(bestMatch?.phone);

    if (!number) {
      setActionMessage(
        "This match has no phone number. Use Copy and contact them directly."
      );
      return;
    }

    if (!draftText.trim()) {
      setActionMessage("There is no draft to send yet.");
      return;
    }

    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(draftText)}`,
      "_blank",
      "noopener,noreferrer"
    );

    await saveOutreach({ status: "sent", channel: "whatsapp" });
  };

  return (
    <div className="mx-auto max-w-[1450px] space-y-7">
      {/* ==========================================
          HERO
      ========================================== */}

      <div className="mesh rounded-[2rem] border border-emerald-100 p-6 sm:p-8">
        <Badge>BUYER SOURCING AGENT</Badge>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Your AI sourcing agent
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pick one of your buying requests and run the agent. It
              searches active farmer listings, ranks the best matches
              and drafts outreach — it never sends anything without
              your approval.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                running
                  ? "animate-pulse bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />

            {running
              ? "Agent thinking..."
              : result
              ? "Agent ready"
              : "Ready to run"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        {/* ==========================================
            LEFT: LAUNCH + RESULTS
        ========================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white">
                <Bot size={21} />
              </div>

              <div>
                <h2 className="font-extrabold">Run the agent</h2>

                <p className="text-xs text-slate-400">
                  Search → rank → outreach → agree terms
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Request selector */}

            <div>
              <span className="text-xs font-bold text-slate-600">
                Your buying request
              </span>

              <div className="mt-2 flex gap-2">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Package size={16} className="shrink-0 text-emerald-600" />

                  <select
                    value={selectedId}
                    onChange={(e) => {
                      setSelectedId(e.target.value);
                      setResult(null);
                      setRunError("");
                    }}
                    disabled={loading || running || requests.length === 0}
                    className="w-full bg-transparent text-sm font-semibold outline-none disabled:opacity-60"
                  >
                    {loading && <option>Loading requests...</option>}
                    {!loading && requests.length === 0 && (
                      <option value="">No active requests</option>
                    )}
                    {!loading &&
                      requests.map((request) => (
                        <option key={request._id} value={request._id}>
                          {request.crop} • {request.quantity} {request.unit} • GH₵{" "}
                          {formatPrice(request.maxPrice)}/{request.unit} •{" "}
                          {request.location?.town || "—"}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  onClick={fetchRequests}
                  disabled={loading || running}
                  className="rounded-2xl border border-slate-200 px-4 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {!loading && requests.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-extrabold text-slate-900">
                  You have no active buying requests
                </p>

                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  Post a request first, then run the agent to find
                  farmers who can supply it.
                </p>

                <button
                  onClick={() => onNavigate?.("marketplace")}
                  className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Post a buying request
                </button>
              </div>
            )}

            {/* Run button */}

            {requests.length > 0 && (
              <button
                onClick={runAgent}
                disabled={running}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {running ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Running agent... this takes 30–60s
                  </>
                ) : result ? (
                  "Run agent again"
                ) : (
                  <>
                    <Sparkles size={17} />
                    Find farmer matches
                  </>
                )}
              </button>
            )}

            {runError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {runError}
              </div>
            )}

            {/* Results */}

            {result && !result.matches?.length && !running && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                <p className="font-extrabold">No matches yet</p>

                <p className="mt-1 text-amber-700">
                  No active farmer listings match this request yet.
                  Try widening your pickup radius or maximum price,
                  then run the agent again.
                </p>
              </div>
            )}

            {result && matches.length > 0 && !running && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-extrabold">
                    Ranked farmer matches
                  </h3>

                  <Badge tone="green">
                    {matches.length}{" "}
                    {matches.length === 1 ? "match" : "matches"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.listingId || match.farmer}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-700">
                          {initialsFor(match.farmer)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-bold">{match.farmer}</p>

                          <p className="text-xs text-slate-400">
                            GH₵ {formatPrice(match.price)}/{match.unit} •{" "}
                            {match.quantity} {match.unit} available
                          </p>
                        </div>

                        <Badge tone="green">
                          {match.fitScore}% fit
                        </Badge>
                      </div>

                      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <MapPin size={13} className="text-emerald-600" />
                        {match.town || "Location unavailable"}
                        {match.region ? `, ${match.region}` : ""} •{" "}
                        {formatDistance(match.distanceKm)}
                      </div>

                      {match.reason && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {match.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==========================================
            RIGHT: STATUS, LIMITS, BEST MATCH
        ========================================== */}

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold">Agent run</h2>

              <Badge>{running ? "Working" : "Idle"}</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {steps.map(([title, detail], i) => {
                const done = running && i < activeStep;
                const current = running && i === activeStep;

                return (
                  <div key={title} className="flex gap-3">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        current
                          ? "bg-amber-100 text-amber-700"
                          : done
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {current ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : done ? (
                        <Check size={16} />
                      ) : (
                        <CircleDot size={16} />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-bold">{title}</p>

                      <p className="text-xs text-slate-400">{detail}</p>
                    </div>

                    {done && (
                      <ChevronRight
                        size={16}
                        className="mt-2 text-emerald-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-emerald-600" />
              <h2 className="font-extrabold">Your request limits</h2>
            </div>

            {selectedRequest ? (
              <>
                <div className="mt-5 grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Maximum price
                    </span>

                    <b>
                      GH₵ {formatPrice(selectedRequest.maxPrice)}/
                      {selectedRequest.unit}
                    </b>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Location
                    </span>

                    <b>
                      {selectedRequest.location?.town},{" "}
                      {selectedRequest.location?.region}
                    </b>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Quantity
                    </span>

                    <b>
                      {selectedRequest.quantity} {selectedRequest.unit}
                    </b>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Pickup radius
                    </span>

                    <b>{selectedRequest.pickupRadius || 0} km</b>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  The agent must not propose a price above your
                  stated maximum.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Select a request to see its limits.
              </p>
            )}
          </section>

          {bestMatch && (
            <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-300" />
                <h2 className="font-extrabold">Best farmer match</h2>
              </div>

              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/15 text-xs font-black text-emerald-300">
                    {initialsFor(bestMatch.farmer)}
                  </div>

                  <div>
                    <p className="font-bold">{bestMatch.farmer}</p>

                    <p className="text-xs text-slate-400">
                      {bestMatch.town || "Location unavailable"}
                      {bestMatch.region ? `, ${bestMatch.region}` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Price</p>

                    <p className="text-2xl font-black">
                      GH₵ {formatPrice(bestMatch.price)}
                      <span className="text-xs text-slate-400">
                        /{bestMatch.unit}
                      </span>
                    </p>
                  </div>

                  <Badge tone="green">
                    {bestMatch.fitScore}% fit
                  </Badge>
                </div>

                {bestMatch.reason && (
                  <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-slate-300">
                    {bestMatch.reason}
                  </p>
                )}
              </div>

              <button
                onClick={openOutreach}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-100"
              >
                <MessageSquare size={16} />
                Draft outreach message
              </button>
            </section>
          )}
        </div>
      </div>

      {/* ==========================================
          OUTREACH DRAFT MODAL
      ========================================== */}

      {outreachOpen && bestMatch && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4"
          onClick={() => setOutreachOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <Badge>Draft ready</Badge>

                <h2 className="mt-2 text-xl font-black">
                  Outreach to {bestMatch.farmer}
                </h2>
              </div>

              <button
                onClick={() => setOutreachOpen(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 max-h-[45vh] overflow-y-auto rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {result?.outreachDraft ||
                "No draft was generated for this match."}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                onClick={handleWhatsApp}
                disabled={saving || !draftText}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                Send on WhatsApp
              </button>

              <button
                onClick={handleCopy}
                disabled={!draftText}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy size={16} />
                Copy message
              </button>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() =>
                  saveOutreach({ status: "drafted", channel: "copy" })
                }
                disabled={saving || !draftText}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : savedId
                  ? "Draft saved"
                  : "Save draft"}
              </button>

              <button
                onClick={() => setOutreachOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {bestMatch?.phone ? (
              <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
                WhatsApp opens with the message pre-filled. You still
                press send yourself.
              </p>
            ) : (
              <p className="mt-3 text-center text-[11px] font-semibold text-amber-600">
                No phone number is available for this farmer. Copy the
                message and contact them directly.
              </p>
            )}

            {actionMessage && (
              <p className="mt-2 text-center text-xs font-semibold text-slate-600">
                {actionMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          BOUNDARY
      ========================================== */}

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" />

          <div>
            <p className="font-extrabold text-amber-900">
              Responsible MVP boundary
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              The agent does not handle payments or escrow, and it
              never sends messages automatically. It matches your
              request to active farmer listings, drafts outreach and
              keeps suggestions within your maximum price. Payment
              and delivery are finalized directly between you and the
              farmer.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
