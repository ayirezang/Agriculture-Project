import { useEffect, useMemo, useState } from "react";

import {
  LayoutDashboard,
  Store,
  Package,
  Bot,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
  UserCog,
  Handshake,
} from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

// ==========================================
// DASHBOARDS
// ==========================================

import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// ==========================================
// EXISTING PAGES
// ==========================================

import SellProduce from "./pages/SellProduce";
import Marketplace from "./pages/Marketplace";
import AgentPage from "./pages/AgentPage";
import Buyers from "./pages/Buyers";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/SettingsPage";

// ==========================================
// AUTH PAGES
// ==========================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// ==========================================
// ROLE-BASED SIDEBAR NAVIGATION
// ==========================================
//
// Farmer:
// Dashboard
// Sell Produce
// Marketplace
// AI Agent
// Buyer Network
// Analytics
// Settings
//
// Buyer:
// Dashboard
// Find Produce
// My Requests
// AI Agent
// Farmer Network
// Analytics
// Settings
//
// Admin:
// Dashboard
// Users
// Listings
// Buyer Requests
// Transactions
// Analytics
// Settings
//
// ==========================================

const navigationByRole = {
  // ========================================
  // FARMER NAVIGATION
  // ========================================

  farmer: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      id: "sell",
      label: "Sell Produce",
      icon: Package,
    },

    {
      id: "marketplace",
      label: "Marketplace",
      icon: Store,
    },

    {
      id: "agent",
      label: "AI Agent",
      icon: Bot,
      badge: "Live",
    },

    {
      id: "buyers",
      label: "Buyer Network",
      icon: Users,
    },

    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },

    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ],

  // ========================================
  // BUYER NAVIGATION
  // ========================================

 buyer: [
  {
    id: "dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    id: "agent",
    label: "AI Agent",
    icon: Bot,
    badge: "Live",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
],

  // ========================================
  // ADMIN NAVIGATION
  // ========================================

  admin: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      id: "users",
      label: "Users",
      icon: UserCog,
    },

    {
      id: "listings",
      label: "Listings",
      icon: Package,
    },

    {
      id: "requests",
      label: "Buyer Requests",
      icon: ClipboardList,
    },

    {
      id: "transactions",
      label: "Transactions",
      icon: Handshake,
    },

    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },

    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ],
};

// ==========================================
// APP
// ==========================================

export default function App() {
  // ==========================================
  // USER
  // ==========================================

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("agriconnect_user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error(
        "Error loading user:",
        error
      );

      localStorage.removeItem(
        "agriconnect_user"
      );

      localStorage.removeItem(
        "agriconnect_token"
      );

      return null;
    }
  });

  // ==========================================
  // AUTH PAGE
  // ==========================================

  const [authPage, setAuthPage] =
    useState("login");

  // ==========================================
  // ACTIVE PAGE
  // ==========================================

  const [activePage, setActivePage] =
    useState("dashboard");

  // ==========================================
  // MOBILE SIDEBAR
  // ==========================================

  const [mobileOpen, setMobileOpen] =
    useState(false);

  // ==========================================
  // NAVIGATE
  // ==========================================

  const navigate = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = (loggedInUser) => {
    console.log(
      "Logged in user:",
      loggedInUser
    );

    setUser(loggedInUser);

    setAuthPage("login");

    setActivePage("dashboard");

    setMobileOpen(false);
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = (
    registeredUser
  ) => {
    console.log(
      "Registered user:",
      registeredUser
    );

    setUser(registeredUser);

    setAuthPage("login");

    setActivePage("dashboard");

    setMobileOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem(
      "agriconnect_user"
    );

    localStorage.removeItem(
      "agriconnect_token"
    );

    setUser(null);

    setAuthPage("login");

    setActivePage("dashboard");

    setMobileOpen(false);
  };

  // ==========================================
  // KEYBOARD SHORTCUT
  // CTRL + K / CMD + K
  // ==========================================

  useEffect(() => {
    if (!user) return;

    const onKey = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();

        document
          .querySelector(
            "[data-global-search]"
          )
          ?.focus();
      }
    };

    window.addEventListener(
      "keydown",
      onKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKey
      );
    };
  }, [user]);

  // ==========================================
  // ROLE-BASED NAVIGATION
  // ==========================================

  const navigation =
    navigationByRole[user?.role] || [];

  // ==========================================
  // ROLE-BASED DASHBOARD
  // ==========================================

  const dashboardPage = useMemo(() => {
    switch (user?.role) {
      // ======================================
      // FARMER
      // ======================================

      case "farmer":
        return (
          <FarmerDashboard
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // BUYER
      // ======================================

      case "buyer":
        return (
          <BuyerDashboard
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // ADMIN
      // ======================================

      case "admin":
        return (
          <AdminDashboard
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // INVALID ROLE
      // ======================================

      default:
        return (
          <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-red-600" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Account Role Not Configured
                  </h2>

                  <p className="text-slate-600 mt-2">
                    Your account does not have a valid
                    AgriConnect role.
                  </p>

                  <p className="text-sm text-slate-500 mt-3">
                    Current role:
                    <span className="font-semibold text-red-600 ml-1">
                      {user?.role || "unknown"}
                    </span>
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    Please contact an administrator
                    to configure your account.
                  </p>
                </div>

              </div>

            </div>
          </div>
        );
    }
  }, [user]);

  // ==========================================
  // CURRENT PAGE
  // ==========================================

  const page = useMemo(() => {
    switch (activePage) {
      // ======================================
      // DASHBOARD
      // ======================================

      case "dashboard":
        return dashboardPage;

      // ======================================
      // FARMER
      // SELL PRODUCE
      // ======================================

      case "sell":
        if (user?.role !== "farmer") {
          return dashboardPage;
        }

        return (
          <SellProduce
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // MARKETPLACE
      // FARMER + BUYER
      // ======================================

      case "marketplace":
        if (
          user?.role !== "farmer" &&
          user?.role !== "buyer"
        ) {
          return dashboardPage;
        }

        return (
          <Marketplace
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // AI AGENT
      // FARMER + BUYER
      // ======================================

      case "agent":
        if (
          user?.role !== "farmer" &&
          user?.role !== "buyer"
        ) {
          return dashboardPage;
        }

        return <AgentPage />;

      // ======================================
      // FARMER NETWORK / BUYER NETWORK
      // ======================================

      case "buyers":
        if (user?.role !== "farmer") {
          return dashboardPage;
        }

        return <Buyers />;

      // ======================================
      // BUYER REQUESTS
      // ======================================
      //
      // The actual BuyerRequests page will be
      // added when we build that page.
      //
      // For now, prevent the buyer from seeing
      // a blank page.
      // ======================================

      case "requests":
        if (user?.role === "buyer") {
          return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                My Requests
              </h2>

              <p className="text-slate-500 mt-2">
                Your buying requests will appear here.
              </p>
            </div>
          );
        }

        if (user?.role === "admin") {
          return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Buyer Requests
              </h2>

              <p className="text-slate-500 mt-2">
                Admin buyer-request management will appear here.
              </p>
            </div>
          );
        }

        return dashboardPage;

      // ======================================
      // BUYER FARMER NETWORK
      // ======================================

      case "farmers":
        if (user?.role !== "buyer") {
          return dashboardPage;
        }

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Farmer Network
            </h2>

            <p className="text-slate-500 mt-2">
              Farmers and their available produce
              will appear here.
            </p>
          </div>
        );

      // ======================================
      // ADMIN USERS
      // ======================================

      case "users":
        if (user?.role !== "admin") {
          return dashboardPage;
        }

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              User Management
            </h2>

            <p className="text-slate-500 mt-2">
              Admin user management will appear here.
            </p>
          </div>
        );

      // ======================================
      // ADMIN LISTINGS
      // ======================================

      case "listings":
        if (user?.role !== "admin") {
          return dashboardPage;
        }

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Listings Management
            </h2>

            <p className="text-slate-500 mt-2">
              Admin listing management will appear here.
            </p>
          </div>
        );

      // ======================================
      // ADMIN TRANSACTIONS
      // ======================================

      case "transactions":
        if (user?.role !== "admin") {
          return dashboardPage;
        }

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Transactions
            </h2>

            <p className="text-slate-500 mt-2">
              Transaction management will appear here.
            </p>
          </div>
        );

      // ======================================
      // ANALYTICS
      // ======================================

      case "analytics":
        return <Analytics />;

      // ======================================
      // SETTINGS
      // ======================================

      case "settings":
        return <SettingsPage />;

      // ======================================
      // FALLBACK
      // ======================================

      default:
        return dashboardPage;
    }
  }, [
    activePage,
    user,
    dashboardPage,
  ]);

  // ==========================================
  // AUTHENTICATION SCREEN
  // ==========================================

  if (!user) {
    // ========================================
    // REGISTER
    // ========================================

    if (authPage === "register") {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() =>
            setAuthPage("login")
          }
        />
      );
    }

    // ========================================
    // LOGIN
    // ========================================

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() =>
          setAuthPage("register")
        }
      />
    );
  }

  // ==========================================
  // MAIN APPLICATION
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900">

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <Sidebar
        navigation={navigation}
        activePage={activePage}
        setActivePage={navigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <div className="lg:pl-72">

        {/* ===================================
            TOPBAR
        ==================================== */}

        <Topbar
          user={user}
          onMenu={() =>
            setMobileOpen(true)
          }
          onAgent={() =>
            navigate("agent")
          }
          onNavigate={navigate}
          onLogout={logout}
        />

        {/* ===================================
            PAGE CONTENT
        ==================================== */}

        <main className="p-4 sm:p-6 lg:p-8">
          {page}
        </main>

      </div>
    </div>
  );
}