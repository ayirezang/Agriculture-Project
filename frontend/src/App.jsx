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
} from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

// ==========================================
// DASHBOARDS
// ==========================================

import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";

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
// ROLE-BASED NAVIGATION
// ==========================================
//
// FARMER
// - Dashboard
// - Sell Produce
// - Marketplace
// - AI Agent
// - Buyer Network
// - Analytics
// - Settings
//
// BUYER
// - Home
// - Find Produce
// - My Requests
// - AI Agent
// - Analytics
// - Settings
//
// ==========================================

const navigationByRole = {
  // ========================================
  // FARMER
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
  // BUYER
  // ========================================

  buyer: [
    {
      id: "dashboard",
      label: "Home",
      icon: LayoutDashboard,
    },
    {
      id: "marketplace",
      label: "Find Produce",
      icon: Store,
    },
    {
      id: "requests",
      label: "My Requests",
      icon: ClipboardList,
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
      const savedUser = localStorage.getItem(
        "agriconnect_user"
      );

      // No saved user
      if (!savedUser) {
        return null;
      }

      const parsedUser = JSON.parse(savedUser);

      // ========================================
      // ONLY FARMER AND BUYER ARE ALLOWED
      // ========================================

      if (
        parsedUser?.role !== "farmer" &&
        parsedUser?.role !== "buyer"
      ) {
        localStorage.removeItem(
          "agriconnect_user"
        );

        localStorage.removeItem(
          "agriconnect_token"
        );

        return null;
      }

      return parsedUser;
    } catch (error) {
      console.error(
        "Error loading saved user:",
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
  // NAVIGATION
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

    // Make sure only farmer and buyer
    // can enter the application.
    if (
      loggedInUser?.role !== "farmer" &&
      loggedInUser?.role !== "buyer"
    ) {
      console.error(
        "Invalid user role:",
        loggedInUser?.role
      );

      return;
    }

    setUser(loggedInUser);

    // Always start from dashboard/home
    setActivePage("dashboard");

    setMobileOpen(false);
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = (registeredUser) => {
    console.log(
      "Registered user:",
      registeredUser
    );

    // Make sure only farmer and buyer
    // can register.
    if (
      registeredUser?.role !== "farmer" &&
      registeredUser?.role !== "buyer"
    ) {
      console.error(
        "Invalid registered user role:",
        registeredUser?.role
      );

      return;
    }

    setUser(registeredUser);

    // After registration, open dashboard
    setActivePage("dashboard");

    setMobileOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    // Remove authentication data
    localStorage.removeItem(
      "agriconnect_user"
    );

    localStorage.removeItem(
      "agriconnect_token"
    );

    // Reset application
    setUser(null);

    setAuthPage("login");

    setActivePage("dashboard");

    setMobileOpen(false);
  };

  // ==========================================
  // KEYBOARD SHORTCUT
  //
  // CTRL + K
  // CMD + K
  // ==========================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const onKey = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

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
  // ROLE-BASED SIDEBAR NAVIGATION
  // ==========================================

  const navigation =
    navigationByRole[user?.role] || [];

  // ==========================================
  // ROLE-BASED DASHBOARD
  // ==========================================

  const dashboardPage = useMemo(() => {
    // ========================================
    // FARMER DASHBOARD
    // ========================================

    if (user?.role === "farmer") {
      return (
        <FarmerDashboard
          user={user}
          onNavigate={navigate}
        />
      );
    }

    // ========================================
    // BUYER DASHBOARD
    // ========================================

    if (user?.role === "buyer") {
      return (
        <BuyerDashboard
          user={user}
          onNavigate={navigate}
        />
      );
    }

    // ========================================
    // INVALID ROLE
    // ========================================

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
                Your account does not have a
                valid AgriConnect role.
              </p>

              <p className="text-sm text-slate-500 mt-3">
                Current role:
                <span className="font-semibold text-red-600 ml-1">
                  {user?.role || "unknown"}
                </span>
              </p>

              <p className="text-sm text-slate-500 mt-2">
                Please sign out and register
                or log in with a Farmer or
                Buyer account.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
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
      //
      // Available to both farmer and buyer
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
      //
      // Available to both roles
      // ======================================

      case "agent":
        if (
          user?.role !== "farmer" &&
          user?.role !== "buyer"
        ) {
          return dashboardPage;
        }

        return (
          <AgentPage
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // FARMER
      // BUYER NETWORK
      // ======================================

      case "buyers":
        if (user?.role !== "farmer") {
          return dashboardPage;
        }

        return (
          <Buyers
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // BUYER
      // MY REQUESTS
      // ======================================

      case "requests":
        if (user?.role !== "buyer") {
          return dashboardPage;
        }

        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                My Requests
              </h1>

              <p className="text-slate-500 mt-1">
                View and manage the produce
                requests you have posted.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-green-600" />
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  No Requests Yet
                </h2>

                <p className="text-slate-500 mt-2 max-w-md">
                  Your buying requests will
                  appear here after you post
                  a request for produce.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("marketplace")
                  }
                  className="mt-6 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Find Produce
                </button>
              </div>
            </div>
          </div>
        );

      // ======================================
      // ANALYTICS
      // ======================================

      case "analytics":
        return (
          <Analytics
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // SETTINGS
      // ======================================

      case "settings":
        return (
          <SettingsPage
            user={user}
            onLogout={logout}
          />
        );

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