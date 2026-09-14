import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Package,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";

import { buyerListings, transactions } from "../data/mockData";

export default function Dashboard({ user, onNavigate }) {
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Hero Section */}
      <section className="mesh overflow-hidden rounded-[2rem] border border-emerald-100 p-6 sm:p-8">
        <div className="max-w-3xl">

          <Badge>AI AGENT ONLINE</Badge>

          {/* Logged-in User */}
          <p className="mt-5 text-sm font-bold text-emerald-600">
            Welcome back, {user?.name || "Farmer"} 👋
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Turn your harvest into{" "}
            <span className="text-emerald-600">
              a real sale.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            AgriConnect AI actively searches the buyer network, ranks offers,
            and negotiates within your limits — so you spend less time looking
            for buyers.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              onClick={() => onNavigate("agent")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700"
            >
              <Bot size={18} />
              Find a buyer with AI
            </button>

            <button
              onClick={() => onNavigate("marketplace")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              View marketplace
            </button>

          </div>
        </div>
      </section>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Active listings"
          value="3"
          change="+1 this week"
          icon={Package}
          tone="green"
        />

        <StatCard
          label="Buyer matches"
          value="14"
          change="6 high-confidence matches"
          icon={Users}
          tone="blue"
        />

        <StatCard
          label="Avg. price uplift"
          value="+12.8%"
          change="vs. informal-sale baseline"
          icon={TrendingUp}
          tone="purple"
        />

        <StatCard
          label="Deals completed"
          value="7"
          change="2 completed this week"
          icon={CheckCircle2}
          tone="orange"
        />

      </div>

      {/* Marketplace + AI Agent */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_.85fr]">

        {/* Top Buyer Matches */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <SectionHeader
            eyebrow="Marketplace"
            title="Top buyer matches"
            description="Ranked by price, location, quantity fit and expected net value."
            action={
              <button
                onClick={() => onNavigate("marketplace")}
                className="text-xs font-bold text-emerald-600"
              >
                View all{" "}
                <ArrowUpRight
                  className="inline"
                  size={14}
                />
              </button>
            }
          />

          <div className="mt-6 space-y-3">

            {buyerListings.slice(0, 3).map((buyer) => (
              <div
                key={buyer.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center"
              >

                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xs font-black ${buyer.color}`}
                >
                  {buyer.initials}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="font-bold text-slate-900">
                      {buyer.buyer}
                    </p>

                    {buyer.verified && (
                      <Badge>
                        Verified
                      </Badge>
                    )}

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {buyer.quantity} {buyer.unit} • {buyer.location} •{" "}
                    {buyer.distance}
                  </p>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-lg font-extrabold text-slate-950">
                    GH₵ {buyer.offer.toFixed(2)}
                    <span className="text-xs font-semibold text-slate-400">
                      /kg
                    </span>
                  </p>

                  <Badge
                    tone={buyer.id === 1 ? "green" : "blue"}
                  >
                    {buyer.status}
                  </Badge>

                </div>

              </div>
            ))}

          </div>
        </section>

        {/* AI Agent Activity */}
        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <Badge>
                Agent activity
              </Badge>

              <h3 className="mt-3 text-xl font-extrabold">
                Working for you
              </h3>

            </div>

            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
              <Zap
                size={20}
                className="text-emerald-300"
              />
            </span>

          </div>

          <div className="mt-7 space-y-5">

            {[
              [
                "09:41",
                "Buyer search completed",
                "14 potential matches found",
              ],
              [
                "09:42",
                "Offers ranked",
                "3 buyers fit your constraints",
              ],
              [
                "09:43",
                "Outreach drafted",
                "Top buyer: Eastern Grains Ltd.",
              ],
            ].map(([time, title, detail]) => (
              <div
                key={time}
                className="flex gap-3"
              >

                <div className="pt-1 text-[10px] font-bold text-slate-500">
                  {time}
                </div>

                <div className="relative flex-1 border-l border-white/10 pl-4">

                  <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-slate-950" />

                  <p className="text-sm font-bold">
                    {title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {detail}
                  </p>

                </div>

              </div>
            ))}

          </div>

          <button
            onClick={() => onNavigate("agent")}
            className="mt-7 w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-50"
          >
            Open agent workspace
          </button>

        </section>

      </div>

      {/* Recent Transactions */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <SectionHeader
          eyebrow="History"
          title="Recent transactions"
          description="Closed and active matches from your marketplace activity."
        />

        <div className="mt-5 overflow-x-auto">

          <table className="w-full min-w-[700px] text-left">

            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">

                <th className="px-3 py-3">
                  Produce
                </th>

                <th className="px-3 py-3">
                  Buyer
                </th>

                <th className="px-3 py-3">
                  Price
                </th>

                <th className="px-3 py-3">
                  Total
                </th>

                <th className="px-3 py-3">
                  Status
                </th>

                <th className="px-3 py-3">
                  Date
                </th>

              </tr>
            </thead>

            <tbody>

              {transactions.map((row) => (
                <tr
                  key={row.buyer}
                  className="border-b border-slate-50 text-sm last:border-0"
                >

                  <td className="px-3 py-4 font-bold">
                    {row.crop}

                    <span className="ml-2 text-xs font-medium text-slate-400">
                      {row.quantity}
                    </span>
                  </td>

                  <td className="px-3 py-4 text-slate-600">
                    {row.buyer}
                  </td>

                  <td className="px-3 py-4 font-semibold">
                    {row.price}
                  </td>

                  <td className="px-3 py-4 font-bold">
                    {row.total}
                  </td>

                  <td className="px-3 py-4">

                    <Badge
                      tone={
                        row.status === "Completed"
                          ? "green"
                          : "amber"
                      }
                    >
                      {row.status}
                    </Badge>

                  </td>

                  <td className="px-3 py-4 text-slate-400">
                    {row.date}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </section>

    </div>
  );
}