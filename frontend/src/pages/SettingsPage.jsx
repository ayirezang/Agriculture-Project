import { Bell, Lock, MessageSquare, Save, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";

export default function SettingsPage() {
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem("agriconnect_settings")) || {}; } catch { return {}; }
  })();
  const [saved, setSaved] = useState(false);
  const [minPrice, setMinPrice] = useState(stored.minPrice || "3.30");
  const [requireConfirmation, setRequireConfirmation] = useState(stored.requireConfirmation ?? true);
  const [counterOffer, setCounterOffer] = useState(stored.counterOffer ?? true);

  const save = () => {
    localStorage.setItem("agriconnect_settings", JSON.stringify({ minPrice, requireConfirmation, counterOffer }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-7">
      <SectionHeader eyebrow="Workspace" title="Settings" description="Control your profile, communication preferences and agent boundaries." />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          {[[UserRound, "Profile"], [ShieldCheck, "Agent limits"], [MessageSquare, "Messaging"], [Bell, "Notifications"], [Lock, "Security"]].map(([Icon, label], i) =>
            <button key={label} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${i === 1 ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={18}/>{label}</button>
          )}
        </aside>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold">Agent limits</h2>
            <p className="mt-1 text-sm text-slate-500">The agent may negotiate only within these explicit boundaries.</p>
            <div className="mt-6 grid gap-5">
              <label className="block"><span className="text-xs font-bold text-slate-600">Minimum acceptable maize price</span><div className="mt-2 flex"><span className="rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold">GH₵</span><input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full rounded-r-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"/></div></label>
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-4"><span><b className="block text-sm">Require confirmation before accepting</b><small className="text-xs text-slate-400">Recommended for MVP</small></span><input type="checkbox" checked={requireConfirmation} onChange={(e) => setRequireConfirmation(e.target.checked)} className="h-5 w-5 accent-emerald-600"/></label>
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-4"><span><b className="block text-sm">Allow one counter-offer</b><small className="text-xs text-slate-400">Never exceed your minimum</small></span><input type="checkbox" checked={counterOffer} onChange={(e) => setCounterOffer(e.target.checked)} className="h-5 w-5 accent-emerald-600"/></label>
            </div>
          </section>

          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-3"><ShieldCheck className="text-amber-700"/><div><h2 className="font-extrabold text-amber-900">Payment safety</h2><p className="mt-1 text-sm leading-6 text-amber-800">AgriConnect AI does not hold funds, initiate payments, or provide escrow in this MVP. Final payment and delivery are agreed directly between the parties.</p></div></div>
          </section>

          <button onClick={save} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">{saved ? "Saved ✓" : <><Save size={17}/> Save settings</>}</button>
          {saved && <Badge>Settings saved to this browser</Badge>}
        </div>
      </div>
    </div>
  );
}
