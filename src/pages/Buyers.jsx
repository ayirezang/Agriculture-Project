import { useMemo, useState } from "react";
import { Building2, CheckCircle2, MapPin, Search, ShieldCheck, Star, X, UserPlus } from "lucide-react";
import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";

const initialBuyers = [
  { name: "Eastern Grains Ltd.", type: "Aggregator", region: "Eastern Region", deals: 38, rating: 4.9, crops: "Maize • Soybean", verified: "Verified" },
  { name: "Golden Harvest Foods", type: "Processor", region: "Greater Accra", deals: 24, rating: 4.8, crops: "Maize • Cassava", verified: "Verified" },
  { name: "Nana K. Trading", type: "Trader", region: "Eastern Region", deals: 17, rating: 4.7, crops: "Maize • Plantain", verified: "Verified" },
  { name: "Volta Agro Processors", type: "Processor", region: "Volta Region", deals: 31, rating: 4.8, crops: "Cassava • Yam", verified: "Verified" },
];

export default function Buyers() {
  const [buyers, setBuyers] = useState(initialBuyers);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [newBuyer, setNewBuyer] = useState({ name: "", type: "Trader", region: "", crops: "" });

  const filtered = useMemo(() => buyers.filter((b) =>
    `${b.name} ${b.type} ${b.region} ${b.crops}`.toLowerCase().includes(query.toLowerCase())
  ), [buyers, query]);

  const register = (e) => {
    e.preventDefault();
    if (!newBuyer.name.trim() || !newBuyer.region.trim()) return;
    const item = { ...newBuyer, deals: 0, rating: 0, verified: "Pending verification", crops: newBuyer.crops || "Not specified" };
    setBuyers((b) => [item, ...b]);
    setNewBuyer({ name: "", type: "Trader", region: "", crops: "" });
    setRegisterOpen(false);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      <SectionHeader
        eyebrow="Trust network"
        title="Buyer registry"
        description="A lightweight reputation layer helps farmers prioritize credible counterparties."
        action={<button onClick={() => setRegisterOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><UserPlus size={16}/> Register as buyer</button>}
      />
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-slate-400"/><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full text-sm outline-none" placeholder="Search registered buyers..." />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((buyer) => (
          <article key={`${buyer.name}-${buyer.region}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Building2 size={21}/></div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold">{buyer.name}</h3><ShieldCheck size={16} className={buyer.verified === "Verified" ? "text-emerald-500" : "text-amber-500"}/></div><p className="mt-1 text-xs text-slate-400">{buyer.type} • {buyer.region}</p></div>
              <Badge tone={buyer.verified === "Verified" ? "green" : "amber"}>{buyer.verified}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400">Deals</p><p className="mt-1 font-extrabold">{buyer.deals}</p></div>
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400">Rating</p><p className="mt-1 font-extrabold">{buyer.rating ? <><Star size={13} className="mr-1 inline fill-current text-amber-500"/>{buyer.rating}</> : "—"}</p></div>
              <div className="col-span-2 rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400">Buys</p><p className="mt-1 font-extrabold">{buyer.crops}</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
              <span className="text-slate-500"><MapPin size={14} className="mr-1 inline"/> {buyer.region}</span>
              <button onClick={() => setSelected(buyer)} className="font-bold text-emerald-600">View trust profile →</button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between gap-4"><div><Badge>{selected.verified}</Badge><h2 className="mt-3 text-2xl font-black">{selected.name}</h2><p className="mt-1 text-sm text-slate-500">{selected.type} • {selected.region}</p></div><button onClick={() => setSelected(null)} className="rounded-xl p-2 hover:bg-slate-100"><X size={18}/></button></div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-600"/><b>Trust profile</b></div>
              <p className="mt-2 text-sm text-slate-500">{selected.deals} recorded deals, {selected.rating || "no"} rating, buying {selected.crops}.</p>
            </div>
          </div>
        </div>
      )}

      {registerOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4" onClick={() => setRegisterOpen(false)}>
          <form onSubmit={register} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="text-xl font-black">Register as buyer</h2><button type="button" onClick={() => setRegisterOpen(false)} className="rounded-xl p-2 hover:bg-slate-100"><X size={18}/></button></div>
            <div className="mt-5 space-y-3">
              <input required value={newBuyer.name} onChange={(e) => setNewBuyer({...newBuyer, name: e.target.value})} placeholder="Business name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"/>
              <select value={newBuyer.type} onChange={(e) => setNewBuyer({...newBuyer, type: e.target.value})} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"><option>Trader</option><option>Aggregator</option><option>Processor</option><option>Bulk buyer</option></select>
              <input required value={newBuyer.region} onChange={(e) => setNewBuyer({...newBuyer, region: e.target.value})} placeholder="Region / location" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"/>
              <input value={newBuyer.crops} onChange={(e) => setNewBuyer({...newBuyer, crops: e.target.value})} placeholder="Crops you buy" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"/>
              <button className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Submit registration</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
