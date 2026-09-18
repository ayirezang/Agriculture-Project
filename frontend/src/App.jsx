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
// BUYER PAGES
// ==========================================

import BuyerRequests from "./pages/BuyerRequests";

// ==========================================
// AUTH PAGES
// ==========================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// ==========================================
// NAVIGATION BY ROLE
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
        localStorage.removeItem("agriconnect_user");
        localStorage.removeItem("agriconnect_token");

        return null;
      }

      // ========================================
      // MAKE SURE A TOKEN ALSO EXISTS
      // ========================================

      const token = localStorage.getItem(
        "agriconnect_token"
      );

      if (!token) {
        localStorage.removeItem("agriconnect_user");

        return null;
      }

      return parsedUser;
    } catch (error) {
      console.error(
        "Error loading saved user:",
        error
      );

      localStorage.removeItem("agriconnect_user");
      localStorage.removeItem("agriconnect_token");

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

    // ========================================
    // ONLY FARMER AND BUYER
    // ========================================

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

    // ========================================
    // SAVE USER
    // ========================================

    setUser(loggedInUser);

    // ========================================
    // ALWAYS START AT DASHBOARD/HOME
    // ========================================

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

    // ========================================
    // ONLY FARMER AND BUYER
    // ========================================

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

    // ========================================
    // SAVE USER
    // ========================================

    setUser(registeredUser);

    // ========================================
    // OPEN DASHBOARD/HOME
    // ========================================

    setActivePage("dashboard");
    setMobileOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    // ========================================
    // REMOVE AUTH DATA
    // ========================================

    localStorage.removeItem(
      "agriconnect_user"
    );

    localStorage.removeItem(
      "agriconnect_token"
    );

    // ========================================
    // RESET APP
    // ========================================

    setUser(null);
    setAuthPage("login");
    setActivePage("dashboard");
    setMobileOpen(false);
  };

  // ==========================================
  // GLOBAL SEARCH SHORTCUT
  // CTRL + K
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
  // NAVIGATION FOR CURRENT ROLE
  // ==========================================

  const navigation =
    navigationByRole[user?.role] || [];

  // ==========================================
  // DASHBOARD PAGE
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
  // PAGE ROUTING
  // ==========================================

  const page = useMemo(() => {
    switch (activePage) {
      // ======================================
      // DASHBOARD / HOME
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
          <BuyerRequests
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // ANALYTICS
      // FARMER + BUYER
      // ======================================

      case "analytics":
        if (
          user?.role !== "farmer" &&
          user?.role !== "buyer"
        ) {
          return dashboardPage;
        }

        return (
          <Analytics
            user={user}
            onNavigate={navigate}
          />
        );

      // ======================================
      // SETTINGS
      // FARMER + BUYER
      // ======================================

      case "settings":
        if (
          user?.role !== "farmer" &&
          user?.role !== "buyer"
        ) {
          return dashboardPage;
        }

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