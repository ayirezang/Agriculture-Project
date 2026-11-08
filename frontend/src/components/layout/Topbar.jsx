import { useEffect, useState } from "react";
import { Menu, Bell, Bot, Search, LogOut, UserRound } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
};

const whatsappLink = (phone, message) => {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `233${digits.slice(1)}`;

  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message || "")}`
    : "";
};

export default function Topbar({ onMenu, onAgent, user, onLogout, onNavigate }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("agriconnect_token");

    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setNotificationsLoading(true);

    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data?.success) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(Number(data.unreadCount) || 0);
      }
    } catch (err) {
      console.error("Notifications error:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (notification) => {
    if (!notification || notification.read) return;

    const token = localStorage.getItem("agriconnect_token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${notification._id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? { ...item, read: true } : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Mark notification error:", err);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("agriconnect_token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all notifications error:", err);
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.toLowerCase();
    if (q.includes("buyer")) onNavigate("buyers");
    else if (q.includes("market") || q.includes("crop") || q.includes("maize")) onNavigate("marketplace");
    else if (q.includes("agent") || q.includes("sell")) onNavigate("agent");
    else if (q.includes("setting")) onNavigate("settings");
    else if (q.includes("analytic")) onNavigate("analytics");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button onClick={onMenu} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Menu size={22} />
        </button>

        <form onSubmit={submitSearch} className="hidden max-w-xl flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
          <Search size={18} className="text-slate-400" />
          <input
            data-global-search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Search crops, buyers, listings..."
          />
          <kbd className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-400">⌘ K</kbd>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {(user?.role === "farmer" || user?.role === "buyer") && (
            <button onClick={onAgent} className="hidden items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700 sm:flex">
              <Bot size={17} /> {user?.role === "buyer" ? "AI Agent" : "Ask Agent"}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => {
                const next = !notificationsOpen;
                setNotificationsOpen(next);
                setProfileOpen(false);
                if (next) fetchNotifications();
              }}
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-14 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold">Notifications</p>
                  {unreadCount > 0 ? (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-emerald-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      All caught up
                    </span>
                  )}
                </div>
                <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                  {notificationsLoading && notifications.length === 0 && (
                    <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                      Loading...
                    </p>
                  )}

                  {!notificationsLoading && notifications.length === 0 && (
                    <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                      No notifications yet. When someone is interested in your listing or request, it will appear here.
                    </p>
                  )}

                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`rounded-xl p-3 ${
                        notification.read ? "bg-slate-50" : "bg-emerald-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {notification.body}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {notification.phone && (
                          <a
                            href={whatsappLink(
                              notification.phone,
                              `Hi ${notification.counterpartyName || ""}, I saw your interest on AgriConnect.`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => markRead(notification)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                          >
                            WhatsApp
                          </a>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markRead(notification)}
                            className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative border-l border-slate-200 pl-3">
            <button onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }} className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-50" aria-label="Open profile menu">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-sm font-extrabold text-amber-800">
                {(user?.name || "FA").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-bold">{user?.name || "Farmer"}</p>
                <p className="text-[11px] text-slate-400">{user?.role || "Farmer"} • {user?.region || "Ghana"}</p>
              </div>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button onClick={() => { setProfileOpen(false); onNavigate("settings"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-slate-50">
                  <UserRound size={17} /> Profile & settings
                </button>
                <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                  <LogOut size={17} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
