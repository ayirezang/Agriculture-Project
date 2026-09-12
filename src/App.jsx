import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Store, Bot, Users, BarChart3, Settings } from "lucide-react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import AgentPage from "./pages/AgentPage";
import Buyers from "./pages/Buyers";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "marketplace", label: "Marketplace", icon: Store },
  { id: "agent", label: "AI Agent", icon: Bot, badge: "Live" },
  { id: "buyers", label: "Buyer Network", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agriconnect_user")) || null;
    } catch {
      return null;
    }
  });
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("agriconnect_user");
    setUser(null);
    setActivePage("dashboard");
  };

  useEffect(() => {
    if (!user) return;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.querySelector("[data-global-search]")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [user]);

  const page = useMemo(() => ({
    dashboard: <Dashboard onNavigate={navigate} />,
    marketplace: <Marketplace />,
    agent: <AgentPage />,
    buyers: <Buyers />,
    analytics: <Analytics />,
    settings: <SettingsPage />,
  }[activePage] || <Dashboard onNavigate={navigate} />), [activePage]);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900">
      <Sidebar
        navigation={navigation}
        activePage={activePage}
        setActivePage={navigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="lg:pl-72">
        <Topbar
          user={user}
          onMenu={() => setMobileOpen(true)}
          onAgent={() => navigate("agent")}
          onNavigate={navigate}
          onLogout={logout}
        />
        <main className="p-4 sm:p-6 lg:p-8">{page}</main>
      </div>
    </div>
  );
}
