import { useState } from "react";
import {
  LockKeyhole,
  Sprout,
  UserRound,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (!data.token) {
        setError("Login failed. No authentication token received.");
        return;
      }

      localStorage.setItem(
        "agriconnect_token",
        data.token
      );

      localStorage.setItem(
        "agriconnect_user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Unable to connect to the server. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="hidden lg:block">
          <div className="rounded-[2.5rem] border border-emerald-100 bg-emerald-50 p-10">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                <Sprout size={25} />
              </span>

              <div>
                <h1 className="text-xl font-black text-slate-900">
                  AgriConnect
                </h1>

                <p className="text-xs font-bold text-emerald-600">
                  AI Marketplace
                </p>
              </div>
            </div>

            {/* Heading */}
            <h2 className="mt-14 max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-900">
              Turn your harvest into a{" "}
              <span className="text-emerald-600">
                real sale.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Your AI sales agent searches buyers, ranks offers
              and prepares bounded negotiations so you can focus
              on your farm.
            </p>

            {/* Features */}
            <div className="mt-8 grid gap-3">
              {[
                "Verified buyer network",
                "AI-assisted matching",
                "Farmer-controlled price limits",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <ShieldCheck
                    className="text-emerald-600"
                    size={18}
                  />

                  <span className="text-sm font-bold text-slate-800">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOGIN FORM */}
        <section className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">

          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white">
                <Sprout size={23} />
              </span>

              <div>
                <h1 className="font-black text-slate-900">
                  AgriConnect
                </h1>

                <p className="text-xs font-bold text-emerald-600">
                  AI Marketplace
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-600">
            Welcome back
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Sign in to your farm workspace
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Access your listings, buyer matches and AI sales agent.
          </p>

          {/* FORM */}
          <form onSubmit={submit} className="mt-7 space-y-4">

            {/* EMAIL */}
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Email
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <UserRound
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="email"
                />
              </div>
            </label>

            {/* PASSWORD */}
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Password
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <LockKeyhole
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="current-password"
                />
              </div>
            </label>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}

              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {/* SIGN UP BUTTON */}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Don't have an account? Sign up
          </button>

          {/* SECURITY MESSAGE */}
          <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
            Your account is securely authenticated through the
            AgriConnect backend.
          </p>
        </section>
      </div>
    </main>
  );
}