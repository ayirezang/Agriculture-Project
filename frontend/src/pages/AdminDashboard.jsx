import React from "react";
import {
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

function StatCard({ icon: Icon, title, value, description }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            {description}
          </p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-green-700" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user }) {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-700" />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Administration
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Welcome, {user?.name || "Administrator"}
            </p>
          </div>

        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          icon={Users}
          title="Total Users"
          value="0"
          description="Registered users"
        />

        <StatCard
          icon={Package}
          title="Listings"
          value="0"
          description="Farmer listings"
        />

        <StatCard
          icon={ShoppingCart}
          title="Buyer Requests"
          value="0"
          description="Active requests"
        />

        <StatCard
          icon={BarChart3}
          title="Transactions"
          value="0"
          description="Completed transactions"
        />

      </div>

      {/* Admin tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            User Management
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Manage farmers, buyers and administrator accounts.
          </p>

          <button className="mt-5 px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800">
            Manage Users
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Marketplace Management
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Monitor farmer listings, buyer requests and marketplace activity.
          </p>

          <button className="mt-5 px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800">
            View Marketplace
          </button>
        </div>

      </div>

    </div>
  );
}