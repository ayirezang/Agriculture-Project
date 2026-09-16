import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Store,
  Package,
  Bot,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import SellProduce from "./pages/SellProduce";
import Marketplace from "./pages/Marketplace";
import AgentPage from "./pages/AgentPage";
import Buyers from "./pages/Buyers";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/SettingsPage";

import Login from "./pages/Login";
import Register from "./pages/Register";

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const navigation = (role) => {
  const farmerPages = [
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
  ];

  const buyerPages = [
    {
      id: "marketplace",
      label: "Marketplace",
      icon: Store,
    },
  ];

  const sharedPages = [
    {
      id: "buyers",
      label: "Buyer Network",
      icon: Users,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  if (role === "buyer") {
    return [...buyerPages, ...sharedPages];
  }

  return [
    ...farmerPages,
    {
      id: "marketplace",
      label: "Marketplace",
      icon: Store,
    },
    ...sharedPages,
  ];
};

export default function App() {
  // ==========================================
  // USER
  // ==========================================

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("agriconnect_user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Error loading user:", error);

      // Remove corrupted user data
      localStorage.removeItem("agriconnect_user");

      return null;
    }
  });

  // ==========================================
  // AUTH PAGE
  // ==========================================

  const [authPage, setAuthPage] = useState("login");

  // ==========================================
  // DASHBOARD NAVIGATION
  // ==========================================

  const [activePage, setActivePage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const landingPageFor = (role) =>
    role === "buyer" ? "marketplace" : "dashboard";

  const handleLogin = (loggedInUser) => {
    console.log("Logged in user:", loggedInUser);

    setUser(loggedInUser);
    setAuthPage("login");
    setActivePage(landingPageFor(loggedInUser?.role));
    setMobileOpen(false);
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = (registeredUser) => {
    console.log("Registered user:", registeredUser);

    setUser(registeredUser);
    setAuthPage("login");
    setActivePage(landingPageFor(registeredUser?.role));
    setMobileOpen(false);
  };

  // ==========================================
  // GO TO REGISTRATION (from Buyer Network)
  // Logs out and shows the register page so a
  // buyer account can be created.
  // ==========================================

  const goToRegister = () => {
    localStorage.removeItem("agriconnect_user");
    localStorage.removeItem("agriconnect_token");

    setUser(null);
    setAuthPage("register");
    setActivePage("dashboard");
    setMobileOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("agriconnect_user");
    localStorage.removeItem("agriconnect_token");

    setUser(null);
    setAuthPage("login");
    setActivePage("dashboard");
    setMobileOpen(false);
  };

  // ==========================================
  // KEYBOARD SHORTCUT
  // Ctrl + K / Cmd + K
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
          .querySelector("[data-global-search]")
          ?.focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [user]);

  // ==========================================
  // CURRENT PAGE
  // ==========================================

  const page = useMemo(
    () =>
      ({
        // ======================================
        // DASHBOARD
        // ======================================

        dashboard: (
          <Dashboard
            user={user}
            onNavigate={navigate}
          />
        ),

        // ======================================
        // SELL PRODUCE
        // ======================================

        sell: (
          <SellProduce
            user={user}
            onNavigate={navigate}
          />
        ),

        // ======================================
        // MARKETPLACE
        // ======================================

        marketplace: (
          <Marketplace
            user={user}
          />
        ),

        // ======================================
        // AI AGENT
        // ======================================

        agent: <AgentPage user={user} onNavigate={navigate} />,

        // ======================================
        // BUYER NETWORK
        // ======================================

        buyers: <Buyers onRegisterBuyer={goToRegister} />,

        // ======================================
        // ANALYTICS
        // ======================================

        analytics: <Analytics />,

        // ======================================
        // SETTINGS
        // ======================================

        settings: <SettingsPage />,
      }[activePage] || (
        <Dashboard
          user={user}
          onNavigate={navigate}
        />
      )),
    [activePage, user]
  );

  // ==========================================
  // AUTHENTICATION SCREEN
  // ==========================================

  if (!user) {
    // ----------------------------------------
    // REGISTER
    // ----------------------------------------

    if (authPage === "register") {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthPage("login")}
        />
      );
    }

    // ----------------------------------------
    // LOGIN
    // ----------------------------------------

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
        navigation={navigation(user?.role)}
        activePage={activePage}
        setActivePage={navigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* =====================================
          MAIN CONTENT AREA
      ====================================== */}

      <div className="lg:pl-72">

        {/* ===================================
            TOPBAR
        ==================================== */}

        <Topbar
          user={user}
          onMenu={() => setMobileOpen(true)}
          onAgent={() => navigate("agent")}
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