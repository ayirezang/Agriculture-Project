import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";

const API_URL = "/api";

export default function BuyerDashboard({ user, onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBuyerDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("agriconnect_token");

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/buyer-requests/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load buyer dashboard"
        );
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error("Buyer dashboard error:", error);

      setError(
        error.message ||
          "Unable to load buyer dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerDashboard();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-emerald-600"
            />

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading your buyer dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-black text-red-800">
            Unable to load buyer dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={fetchBuyerDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const openRequests = requests.filter((request) =>
    ["pending", "matched"].includes(request.status)
  );

  const matchedRequests = requests.filter(
    (request) => request.status === "matched"
  );

  const completedRequests = requests.filter(
    (request) => request.status === "completed"
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* =====================================
          HERO
      ====================================== */}

      <section className="mesh overflow-hidden rounded-[2rem] border border-emerald-100 p-6 sm:p-8">

        <div className="max-w-3xl">

          <Badge>
            BUYER AI AGENT ONLINE
          </Badge>

          <p className="mt-5 text-sm font-bold text-emerald-600">
            Welcome back, {user?.name || "Buyer"}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Find the right produce
            <span className="text-emerald-600">
              {" "}directly from farmers.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            AgriConnect AI helps you find farmers who have
            the crops, quantities and prices you need.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              onClick={() => onNavigate("marketplace")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700"
            >
              <Search size={18} />
              Find produce
            </button>

            <button
              onClick={() => onNavigate("agent")}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
            >
              <Bot size={18} />
              Run AI agent
            </button>

          </div>

        </div>

      </section>

      {/* =====================================
          STATISTICS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Buying requests"
          value={requests.length}
          change={`${openRequests.length} currently open`}
          icon={ShoppingCart}
          tone="green"
        />

        <StatCard
          label="Open requests"
          value={openRequests.length}
          change="Waiting for farmers"
          icon={Package}
          tone="blue"
        />

        <StatCard
          label="Farmer matches"
          value={matchedRequests.length}
          change="Ready for outreach"
          icon={Users}
          tone="purple"
        />

        <StatCard
          label="Completed purchases"
          value={completedRequests.length}
          change="Completed requests"
          icon={CheckCircle2}
          tone="orange"
        />

      </div>

      {/* =====================================
          BUYING REQUESTS
      ====================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <SectionHeader
          eyebrow="Your Demand"
          title="Buying requests"
          description="Your active requests for agricultural produce."
          action={
            <button
              onClick={() => onNavigate("marketplace")}
              className="text-xs font-bold text-emerald-600"
            >
              Find produce
              <ArrowUpRight
                className="ml-1 inline"
                size={14}
              />
            </button>
          }
        />

        <div className="mt-6 space-y-3">

          {requests.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">

              <ShoppingCart
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-bold text-slate-700">
                No buying requests yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Create a buying request when you need
                produce from farmers.
              </p>

              <button
                onClick={() => onNavigate("marketplace")}
                className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Find Produce
              </button>

            </div>

          ) : (

            requests.map((request) => (

              <div
                key={request._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center"
              >

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Package size={20} />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="font-bold capitalize text-slate-900">
                      {request.crop}
                    </p>

                    <Badge
                      tone={
                        request.status === "open"
                          ? "green"
                          : "amber"
                      }
                    >
                      {request.status}
                    </Badge>

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {request.quantity} {request.unit} •{" "}
                    {request.location?.town},{" "}
                    {request.location?.region}
                  </p>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-lg font-extrabold text-slate-950">
                    GH₵{" "}
                    {Number(request.maxPrice || 0).toFixed(2)}

                    <span className="text-xs font-semibold text-slate-400">
                      /{request.unit}
                    </span>
                  </p>

                  <p className="text-xs text-slate-400">
                    Maximum price
                  </p>

                </div>

              </div>

            ))

          )}

        </div>
</section>

      {/* =====================================
          QUICK ACTIONS
      ====================================== */}

      <div className="grid gap-4 md:grid-cols-3">

        <button
          onClick={() => onNavigate("marketplace")}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-emerald-200"
        >
          <Search
            size={24}
            className="text-emerald-600"
          />

          <h3 className="mt-4 font-extrabold">
            Find Produce
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Search available crops from farmers.
          </p>
        </button>

        <button
          onClick={() => onNavigate("marketplace")}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-emerald-200"
        >
          <Users
            size={24}
            className="text-emerald-600"
          />

          <h3 className="mt-4 font-extrabold">
            Find Farmers
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Connect directly with farmers selling produce.
          </p>
        </button>

        <button
          onClick={() => onNavigate("agent")}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-emerald-200"
        >
          <Bot
            size={24}
            className="text-emerald-600"
          />

          <h3 className="mt-4 font-extrabold">
            AI Agent
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Match your request to farmers and draft outreach.
          </p>
        </button>

      </div>

    </div>
  );
}