import { useState } from "react";
import { Bot, Check, ChevronRight, CircleDot, Copy, MapPin, MessageSquare, Send, ShieldCheck, Sparkles, Target, Truck } from "lucide-react";
import Badge from "../components/ui/Badge";
import { agentMessages, buyerListings } from "../data/mockData";

const steps = [
  ["Search buyers", "14 candidates found"],
  ["Rank matches", "3 high-fit buyers"],
  ["Draft outreach", "Ready for review"],
  ["Negotiate", "Bounded to your minimum"],
];

export default function AgentPage() {
  const [messages, setMessages] = useState(agentMessages);
  const [input, setInput] = useState("");
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [negotiation, setNegotiation] = useState("pending");
  const [counterOffer, setCounterOffer] = useState("3.50");

  const sendMessage = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: "user", text }, { role: "agent", text: "I’ll use that constraint to rank the buyer network. For this MVP, outreach is simulated — I can draft the exact message for you." }]);
    setInput("");
  };

  return (
    <div className="mx-auto max-w-[1450px] space-y-7">
      <div className="mesh rounded-[2rem] border border-emerald-100 p-6 sm:p-8">
        <Badge>AGENTIC WORKFLOW • MVP</Badge>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Your AI sales agent</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Describe your produce and constraints. The agent searches demand, ranks matches, and prepares a bounded negotiation path.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"/> Agent ready
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white"><Bot size={21}/></div>
              <div><h2 className="font-extrabold">Agent conversation</h2><p className="text-xs text-slate-400">Search → rank → outreach → negotiate</p></div>
            </div>
          </div>

          <div className="h-[470px] space-y-4 overflow-y-auto bg-slate-50/70 p-5 sm:p-6">
            {messages.map((message, i) => (
              <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user" ? "rounded-br-md bg-slate-950 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                }`}>
                  {message.role === "agent" && <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">AgriConnect AI</p>}
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <textarea rows="2" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none" placeholder="e.g. I have 20 bags of tomatoes in Kumasi..." />
              <button onClick={sendMessage} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"><Send size={17}/></button>
            </div>
            <p className="mt-2 px-2 text-[10px] text-slate-400">Demo mode: no real buyer messages or payments are sent.</p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between"><h2 className="font-extrabold">Agent run</h2><Badge>Live demo</Badge></div>
            <div className="mt-6 space-y-4">
              {steps.map(([title, detail], i) => (
                <div key={title} className="flex gap-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${i < 3 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {i < 3 ? <Check size={16}/> : <CircleDot size={16}/>}
                  </div>
                  <div className="flex-1"><p className="text-sm font-bold">{title}</p><p className="text-xs text-slate-400">{detail}</p></div>
                  {i < 3 && <ChevronRight size={16} className="mt-2 text-slate-300"/>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2"><Target size={18} className="text-emerald-600"/><h2 className="font-extrabold">Farmer limits</h2></div>
            <div className="mt-5 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-500">Minimum price</span><b>GH₵ 3.30/kg</b></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-500">Location</span><b>Koforidua</b></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-500">Quantity</span><b>10 bags</b></div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">The agent must not accept an offer below your stated minimum.</p>
          </section>

          <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
            <div className="flex items-center gap-2"><Sparkles size={18} className="text-emerald-300"/><h2 className="font-extrabold">Best current match</h2></div>
            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/15 text-xs font-black text-emerald-300">{buyerListings[0].initials}</div><div><p className="font-bold">{buyerListings[0].buyer}</p><p className="text-xs text-slate-400">{buyerListings[0].location} • {buyerListings[0].distance}</p></div></div>
              <div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-slate-400">Offer</p><p className="text-2xl font-black">GH₵ {buyerListings[0].offer.toFixed(2)}<span className="text-xs text-slate-400">/kg</span></p></div><Badge>98% fit</Badge></div>
            </div>
            <button onClick={() => setOutreachOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950"><MessageSquare size={16}/> Draft outreach message</button>
          </section>
        </div>
      </div>

      {outreachOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4" onClick={() => setOutreachOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div><Badge>Draft ready</Badge><h2 className="mt-2 text-xl font-black">Outreach to {buyerListings[0].buyer}</h2></div>
              <button onClick={() => setOutreachOpen(false)} className="rounded-xl p-2 hover:bg-slate-100">×</button>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              Hello {buyerListings[0].buyer}, I have 10 bags of maize available in Koforidua. Your current offer of GH₵ {buyerListings[0].offer.toFixed(2)}/kg looks like a strong fit. Please confirm quantity, pickup terms and availability.
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setOutreachOpen(false); setMessages((m) => [...m, { role: "agent", text: "Outreach draft approved. In this MVP it is simulated and is not sent to a real buyer." }]); }} className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Approve draft</button>
              <button onClick={() => setOutreachOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-amber-700"/><div><p className="font-extrabold text-amber-900">Responsible MVP boundary</p><p className="mt-1 text-sm leading-6 text-amber-800">The agent does not handle payments or escrow. It drafts buyer outreach and connects both parties; payment and delivery are finalized directly between them.</p></div></div>
      </section>
    </div>
  );
}
