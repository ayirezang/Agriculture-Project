export default function StatCard({ label, value, change, icon: Icon, tone = "green" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-sky-50 text-sky-600",
    purple: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-emerald-600">{change}</p>
    </div>
  );
}
