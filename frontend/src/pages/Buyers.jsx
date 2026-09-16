import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  X,
  UserPlus,
  Loader2,
} from "lucide-react";

import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";

const API_URL = "http://localhost:5000/api";

export default function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD REAL BUYERS FROM BACKEND
  // ==========================================
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/auth/buyers`);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load buyers"
          );
        }

        setBuyers(data.buyers || []);
      } catch (error) {
        console.error("Error loading buyers:", error);

        setError(
          error.message ||
            "Unable to load registered buyers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, []);

  // ==========================================
  // SEARCH BUYERS
  // ==========================================
  const filtered = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return buyers;
    }

    return buyers.filter((buyer) =>
      `${buyer.name} ${buyer.type} ${buyer.region} ${buyer.town} ${buyer.crops}`
        .toLowerCase()
        .includes(search)
    );
  }, [buyers, query]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      {/* ==========================================
          HEADER
      ========================================== */}
      <SectionHeader
        eyebrow="Trust network"
        title="Buyer registry"
        description="A lightweight reputation layer helps farmers prioritize credible counterparties."
        action={
          <button
            onClick={() => setRegisterOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <UserPlus size={16} />
            Register as buyer
          </button>
        }
      />

      {/* ==========================================
          SEARCH
      ========================================== */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          className="w-full text-sm outline-none"
          placeholder="Search registered buyers..."
        />
      </div>

      {/* ==========================================
          LOADING
      ========================================== */}
      {loading && (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Loader2
              size={20}
              className="animate-spin"
            />
            Loading registered buyers...
          </div>
        </div>
      )}

      {/* ==========================================
          ERROR
      ========================================== */}
      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ==========================================
          EMPTY STATE
      ========================================== */}
      {!loading &&
        !error &&
        filtered.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <Building2
              size={35}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-extrabold">
              No buyers found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try a different search term.
            </p>
          </div>
        )}

      {/* ==========================================
          BUYER CARDS
      ========================================== */}
      {!loading &&
        !error &&
        filtered.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((buyer) => (
              <article
                key={buyer.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* ICON */}
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Building2 size={21} />
                  </div>

                  {/* BUYER INFO */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold">
                        {buyer.name}
                      </h3>

                      <ShieldCheck
                        size={16}
                        className={
                          buyer.verified === "Verified"
                            ? "text-emerald-500"
                            : "text-amber-500"
                        }
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {buyer.type} •{" "}
                      {buyer.region}
                    </p>
                  </div>

                  {/* STATUS */}
                  <Badge
                    tone={
                      buyer.verified ===
                      "Verified"
                        ? "green"
                        : "amber"
                    }
                  >
                    {buyer.verified}
                  </Badge>
                </div>

                {/* STATS */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold text-slate-400">
                      Deals
                    </p>

                    <p className="mt-1 font-extrabold">
                      {buyer.deals}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold text-slate-400">
                      Rating
                    </p>

                    <p className="mt-1 font-extrabold">
                      {buyer.rating ? (
                        <>
                          <Star
                            size={13}
                            className="mr-1 inline fill-current text-amber-500"
                          />

                          {buyer.rating}
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold text-slate-400">
                      Buys
                    </p>

                    <p className="mt-1 font-extrabold">
                      {buyer.crops}
                    </p>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                  <span className="text-slate-500">
                    <MapPin
                      size={14}
                      className="mr-1 inline"
                    />

                    {buyer.town
                      ? `${buyer.town}, ${buyer.region}`
                      : buyer.region}
                  </span>

                  <button
                    onClick={() =>
                      setSelected(buyer)
                    }
                    className="font-bold text-emerald-600"
                  >
                    View trust profile →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      {/* ==========================================
          TRUST PROFILE MODAL
      ========================================== */}
      {selected && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex justify-between gap-4">
              <div>
                <Badge>
                  {selected.verified}
                </Badge>

                <h2 className="mt-3 text-2xl font-black">
                  {selected.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selected.type} •{" "}
                  {selected.region}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelected(null)
                }
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-emerald-600"
                />

                <b>Trust profile</b>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {selected.deals} recorded deals,{" "}
                {selected.rating || "no"} rating,
                buying {selected.crops}.
              </p>

              {selected.town && (
                <p className="mt-2 text-sm text-slate-500">
                  <MapPin
                    size={14}
                    className="mr-1 inline"
                  />
                  {selected.town},{" "}
                  {selected.region}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          REGISTER MODAL
          ------------------------------------------
          We keep the existing UI for now.
          Actual backend registration will be
          connected separately so we don't create
          a fake registration flow.
      ========================================== */}
      {registerOpen && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4"
          onClick={() =>
            setRegisterOpen(false)
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">
                  Register as buyer
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Buyer accounts are created through
                  the main registration process.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRegisterOpen(false)
                }
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">
                To create a real buyer account,
                use the registration page and
                select <b>Buyer</b> as your role.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setRegisterOpen(false)
              }
              className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
            >
              Continue to registration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}