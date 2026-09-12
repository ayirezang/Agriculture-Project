import { X, Sprout } from "lucide-react";

export default function Sidebar({ navigation, activePage, setActivePage, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white p-5 transition-transform lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => { setActivePage("dashboard"); setMobileOpen(false); }}
              className="flex items-center gap-3"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <Sprout size={23} />
              </span>
              <span className="text-left">
                <span className="block text-lg font-extrabold tracking-tight">AgriConnect</span>
                <span className="block text-xs font-semibold text-emerald-600">AI Marketplace</span>
              </span>
            </button>
            <button onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
              <X size={20} />
            </button>
          </div>

          <div className="mt-9">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</p>
            <nav className="mt-3 space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActivePage(item.id); setMobileOpen(false); }}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon size={19} className={active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700"} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-3xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold">AGENT ONLINE</span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-5">Your agent is watching 14 active buyer requests.</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">No payments are handled by the agent in this MVP.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
