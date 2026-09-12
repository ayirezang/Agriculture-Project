import { useMemo, useState } from "react";
import { Filter, MapPin, Search, ShieldCheck, SlidersHorizontal, Truck, X, MessageSquare } from "lucide-react";
import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";
import { buyerListings } from "../data/mockData";

export default function Marketplace() {
  const [crop, setCrop] = useState("All crops");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => buyerListings.filter((b) =>
    (crop === "All crops" || b.crop === crop) &&
    (!verifiedOnly || b.verified) &&
    `${b.buyer} ${b.location} ${b.crop}`.toLowerCase().includes(query.toLowerCase())
  ), [crop, query, verifiedOnly]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      <SectionHeader
        eyebrow="Two-sided marketplace"
        title="Buyer demand network"
        description="Live-style seeded buyer requests for the MVP. The agent uses these listings to find supply-demand matches."
        action={<button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"><Filter size={16}/> Filters</button>}
      />

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_auto]">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <Search size={18} className="text-slate-400"/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search buyer, crop or location..." />
        </div>
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none">
          <option>All crops</option><option>Maize</option><option>Cassava</option><option>Plantain</option>
        </select>
        <button onClick={() => setShowFilters(!showFilters)} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"><SlidersHorizontal size={16} className="mr-2 inline"/>More filters</button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
          <span className="font-bold text-emerald-800">Quick filters:</span>
          <button onClick={() => setQuery("Koforidua")} className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-sm">Near Koforidua</button>
          <button onClick={() => setVerifiedOnly(!verifiedOnly)} className={`rounded-full px-3 py-1.5 font-semibold shadow-sm ${verifiedOnly ? "bg-emerald-600 text-white" : "bg-white text-slate-600"}`}>Verified only</button>
          <button onClick={() => setQuery("")} className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-sm">Clear search</button>
          <button onClick={() => setShowFilters(false)} className="ml-auto p-2 text-slate-400"><X size={16}/></button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((buyer, index) => (
          <article key={buyer.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex gap-4">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-black ${buyer.color}`}>{buyer.initials}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold">{buyer.buyer}</h3>
                  <ShieldCheck size={16} className="text-emerald-500"/>
                </div>
                <p className="mt-1 text-xs text-slate-500">Registered buyer • {index + 4} completed transactions</p>
              </div>
              <Badge tone={buyer.id === 1 ? "green" : "blue"}>{buyer.status}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Crop</p><p className="mt-1 text-sm font-extrabold">{buyer.crop}</p></div>
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Demand</p><p className="mt-1 text-sm font-extrabold">{buyer.quantity}t</p></div>
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Offer</p><p className="mt-1 text-sm font-extrabold text-emerald-700">GH₵ {buyer.offer.toFixed(2)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Distance</p><p className="mt-1 text-sm font-extrabold">{buyer.distance}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span><MapPin size={14} className="mr-1 inline text-emerald-600"/>{buyer.location}</span>
              <span><Truck size={14} className="mr-1 inline text-emerald-600"/>Pickup / delivery negotiable</span>
              <button onClick={() => setSelected(buyer)} className="ml-auto font-bold text-emerald-600">View details →</button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge>Verified buyer</Badge>
                <h2 className="mt-3 text-2xl font-black">{selected.buyer}</h2>
                <p className="mt-1 text-sm text-slate-500">{selected.location} • {selected.distance}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-xl p-2 hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Crop</p><b>{selected.crop}</b></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Offer</p><b>GH₵ {selected.offer.toFixed(2)}/kg</b></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Demand</p><b>{selected.quantity} tonnes</b></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Status</p><b>{selected.status}</b></div>
            </div>
            <button onClick={() => setSelected(null)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">
              <MessageSquare size={16}/> Ask Agent to pursue this buyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
