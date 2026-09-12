import { ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react";
import SectionHeader from "../components/ui/SectionHeader";
import StatCard from "../components/ui/StatCard";

const months = [
  { month: "Apr", value: 38 }, { month: "May", value: 51 }, { month: "Jun", value: 46 },
  { month: "Jul", value: 63 }, { month: "Aug", value: 74 }, { month: "Sep", value: 88 },
];

export default function Analytics() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      <SectionHeader eyebrow="Performance" title="Marketplace analytics" description="Track whether the agent is creating real outcomes rather than just generating recommendations." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Match rate" value="82%" change="+9.4% vs. last month" icon={CheckCircle2} />
        <StatCard label="Avg. time to match" value="17h" change="↓ 5h improvement" icon={Clock} tone="blue" />
        <StatCard label="Farmer price uplift" value="12.8%" change="Above informal baseline" icon={TrendingUp} tone="purple" />
        <StatCard label="Completed value" value="GH₵ 18.4k" change="+21% this month" icon={DollarSign} tone="orange" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Volume</p><h2 className="mt-1 text-xl font-extrabold">Successful match index</h2></div><BarChart3 className="text-slate-300"/></div>
          <div className="mt-8 flex h-64 items-end gap-3 border-b border-slate-100">
            {months.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{m.value}</span>
                <div className="w-full max-w-14 rounded-t-xl bg-emerald-500/80" style={{ height: `${m.value * 2.1}px` }} />
                <span className="text-[11px] font-semibold text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Agent efficiency</p>
          <h2 className="mt-1 text-xl font-extrabold">Where time is spent</h2>
          <div className="mt-7 space-y-5">
            {[["Buyer discovery", "41%", "green"], ["Offer ranking", "23%", "blue"], ["Negotiation", "21%", "amber"], ["Confirmation", "15%", "slate"]].map(([name, val]) => (
              <div key={name}><div className="mb-2 flex justify-between text-xs font-bold"><span>{name}</span><span>{val}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{width: val}}/></div></div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2"><TrendingUp size={18} className="text-emerald-600"/><h2 className="font-extrabold">Product success metrics</h2></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["Listings matched within 48h", "82%", "+14%"],
            ["Repeat farmer usage", "67%", "+8%"],
            ["Repeat buyer registration", "74%", "+11%"],
          ].map(([name, value, change]) => (
            <div key={name} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{name}</p><div className="mt-2 flex items-end justify-between"><b className="text-2xl">{value}</b><span className="text-xs font-bold text-emerald-600">{change}</span></div></div>
          ))}
        </div>
      </section>
    </div>
  );
}
