import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  CircleDot,
  Loader2,
  MessageSquare,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Badge from "../components/ui/Badge";

const API_URL = "/api";

const steps = [
  ["Search buyers", "Open buyer requests for this crop"],
  ["Rank matches", "Fit score from price, distance and quantity"],
  ["Draft outreach", "Draft only, never sent automatically"],
  ["Negotiate", "Bounded to your minimum price"],
];

export default function AgentPage({ user, onNavigate }) {
  // ==========================================
  // FARMER'S LISTINGS
  // ==========================================

  const [listings, setListings] = useState([]);
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

  const selectedListing =
    listings.find((l) => l._id === selectedId) || null;

  // ==========================================
  // FETCH MY LISTINGS
  // ==========================================

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("agriconnect_token");

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/listings/my/listings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load your listings."
        );
      }

      const my = data.listings || [];
      setListings(my);
      if (my.length > 0) {
        setSelectedId((prev) =>
          my.some((l) => l._id === prev) ? prev : my[0]._id
        );
      }
    } catch (err) {
      console.error("Agent listings error:", err);
      setError(
        err.message ||
          "Unable to connect to the AgriConnect backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ==========================================
  // ANIMATE STEPS WHILE THE AGENT RUNS (~30-60s)
  // ==========================================

  useEffect(() => {
    if (!running) {
      setActiveStep(-1);
      return;
    }

    setActiveStep(0);

    const timer = setInterval(() => {
      setActiveStep((s) => (s < 3 ? s + 1 : s));
    }, 12000);

    return () => clearInterval(timer);
  }, [running]);

  // ==========================================
  // RUN THE AGENT
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
        `${API_URL}/agent/run/${selectedId}`,
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
      console.error("Agent run error:", err);
      setRunError(
        "Unable to reach the backend. Make sure it is running on port 5000."
      );
    } finally {
      setRunning(false);
    }
  };

  const matches = result?.matches || [];
  const bestMatch = result?.bestMatch || null;

  const initialsFor = (name = "Buyer") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatPrice = (price) => Number(price || 0).toFixed(2);

  return (
    <div className="mx-auto max-w-[1450px] space-y-7">
      {/* ==========================================
          HERO
      ========================================== */}

      <div className="mesh rounded-[2rem] border border-emerald-100 p-6 sm:p-8">
        <Badge>AGENTIC WORKFLOW</Badge>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Your AI sales agent
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pick one of your listings and run the agent. It
              searches open buyer requests, ranks the best
              matches and drafts outreach — it never sends
              anything without your approval.
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
                  Search → rank → outreach → negotiate
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Listing selector */}

            <div>
              <span className="text-xs font-bold text-slate-600">
                Your produce listing
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
                    disabled={loading || running}
                    className="w-full bg-transparent text-sm font-semibold outline-none disabled:opacity-60"
                  >
                    {loading && <option>Loading listings...</option>}
                    {!loading &&
                      listings.map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.crop} • {l.quantity} {l.unit} • GH₵{" "}
                          {formatPrice(l.minPrice)}/{l.unit} •{" "}
                          {l.location?.town || "—"}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  onClick={fetchListings}
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

            {!loading && listings.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-extrabold text-slate-900">
                  You have no produce listings yet
                </p>

                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  Create a listing first, then run the agent to
                  find buyers for it.
                </p>

                <button
                  onClick={() => onNavigate?.("sell")}
                  className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  List your produce
                </button>
              </div>
            )}

            {/* Run button */}

            {listings.length > 0 && (
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
                    Run agent
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
                  No open buyer requests match this listing yet.
                  Ask a buyer to post a request (e.g. in the
                  Marketplace) and run the agent again.
                </p>
              </div>
            )}

            {result && matches.length > 0 && !running && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-extrabold">
                    Ranked buyer matches
                  </h3>

                  <Badge tone="green">
                    {matches.length}{" "}
                    {matches.length === 1 ? "match" : "matches"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {matches.map((match, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-700">
                          {initialsFor(match.buyer)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-bold">{match.buyer}</p>

                          <p className="text-xs text-slate-400">
                            Offers GH₵{" "}
                            {formatPrice(match.offer)}/kg
                          </p>
                        </div>

                        <Badge tone="green">
                          {match.fitScore}% fit
                        </Badge>
                      </div>

                      {match.reason && (
                        <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-500">
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

                      <p className="text-xs text-slate-400">
                        {detail}
                      </p>
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
              <h2 className="font-extrabold">Listing limits</h2>
            </div>

            {selectedListing ? (
              <>
                <div className="mt-5 grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Minimum price
                    </span>

                    <b>
                      GH₵ {formatPrice(selectedListing.minPrice)}/
                      {selectedListing.unit}
                    </b>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Location
                    </span>

                    <b>
                      {selectedListing.location?.town},{" "}
                      {selectedListing.location?.region}
                    </b>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Quantity
                    </span>

                    <b>
                      {selectedListing.quantity}{" "}
                      {selectedListing.unit}
                    </b>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  The agent must not accept an offer below your
                  stated minimum.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Select a listing to see its limits.
              </p>
            )}
          </section>

          {bestMatch && (
            <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-300" />
                <h2 className="font-extrabold">Best current match</h2>
              </div>

              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/15 text-xs font-black text-emerald-300">
                    {initialsFor(bestMatch.buyer)}
                  </div>

                  <div>
                    <p className="font-bold">{bestMatch.buyer}</p>

                    <p className="text-xs text-slate-400">
                      "Why this match" — see reason below
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Offer</p>

                    <p className="text-2xl font-black">
                      GH₵ {formatPrice(bestMatch.offer)}
                      <span className="text-xs text-slate-400">
                        /kg
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
                onClick={() => setOutreachOpen(true)}
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
                  Outreach to {bestMatch.buyer}
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

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setOutreachOpen(false);
                }}
                className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Approve draft
              </button>

              <button
                onClick={() => setOutreachOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
              Draft only — nothing is sent to the buyer until you
              approve and send it yourself.
            </p>
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
              listing to open buyer requests, drafts outreach and
              prepares a bounded negotiation path. Payment and
              delivery are finalized directly between you and the
              buyer.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}