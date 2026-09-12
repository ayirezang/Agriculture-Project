export default function Badge({ children, tone = "green" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    gray: "bg-slate-50 text-slate-600 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-100",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles[tone]}`}>{children}</span>;
}
