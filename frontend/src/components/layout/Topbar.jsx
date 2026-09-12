import { useState } from "react";
import { Menu, Bell, Bot, Search, LogOut, UserRound } from "lucide-react";

export default function Topbar({ onMenu, onAgent, user, onLogout, onNavigate }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");

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
          <button onClick={onAgent} className="hidden items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700 sm:flex">
            <Bot size={17} /> Ask Agent
          </button>

          <div className="relative">
            <button onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Notifications">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold">Notifications</p>
                  <span className="text-[10px] font-bold text-emerald-600">3 new</span>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    ["Buyer match", "Eastern Grains Ltd. is a 98% fit."],
                    ["Agent", "Outreach draft is ready for review."],
                    ["Marketplace", "14 buyer requests are active."],
                  ].map(([title, detail]) => (
                    <button key={title} onClick={() => { setNotificationsOpen(false); onNavigate(title === "Buyer match" ? "marketplace" : "agent"); }} className="w-full rounded-xl bg-slate-50 p-3 text-left hover:bg-emerald-50">
                      <p className="text-xs font-bold">{title}</p>
                      <p className="mt-1 text-xs text-slate-500">{detail}</p>
                    </button>
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
