import { useState } from "react";
import {
  LockKeyhole,
  Sprout,
  UserRound,
  ArrowRight,
  ShieldCheck,
  Phone,
  MapPin,
} from "lucide-react";

export default function Register({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [town, setTown] = useState("");
  const [region, setRegion] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    // Check required fields
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword ||
      !town.trim() ||
      !region.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            role,
            location: {
              town: town.trim(),
              region: region.trim(),
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      // Save token
      if (data.token) {
        localStorage.setItem("agriconnect_token", data.token);
      }

      // Save user
      if (data.user) {
        localStorage.setItem(
          "agriconnect_user",
          JSON.stringify(data.user)
        );
      }

      // Tell parent component registration succeeded
      if (onRegister) {
        onRegister(data.user);
      }
    } catch (err) {
      console.error("Registration error:", err);

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

        {/* =========================
            LEFT SIDE
        ========================== */}
        <section className="hidden lg:block">
          <div className="rounded-[2.5rem] border border-emerald-100 bg-emerald-50 p-10">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                <Sprout size={25} />
              </div>

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
              Join the marketplace where farmers meet{" "}
              <span className="text-emerald-600">
                real buyers.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Create your account, list your produce and let
              AgriConnect help you find serious buyers.
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

        {/* =========================
            REGISTRATION FORM
        ========================== */}
        <section className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">

          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white">
                <Sprout size={23} />
              </div>

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
            Get started
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Create your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Join AgriConnect and connect directly with farmers
            and buyers.
          </p>

          {/* FORM */}
          <form onSubmit={submit} className="mt-7 space-y-4">

            {/* FULL NAME */}
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Full name
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <UserRound
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="Kofi Mensah"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

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
                />
              </div>
            </label>

            {/* PHONE */}
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Phone number
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <Phone
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  placeholder="0241234567"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            {/* ACCOUNT TYPE */}
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Account type
              </span>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setError("");
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
              </select>
            </label>

            {/* TOWN */}
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Town
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <MapPin
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="text"
                  value={town}
                  onChange={(e) => {
                    setTown(e.target.value);
                    setError("");
                  }}
                  placeholder="Koforidua"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            {/* REGION */}
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Region
              </span>

              <input
                type="text"
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setError("");
                }}
                placeholder="Eastern Region"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
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
                />
              </div>
            </label>

            {/* CONFIRM PASSWORD */}
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Confirm password
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <LockKeyhole
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}

              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {/* LOGIN */}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Already have an account? Sign in
          </button>

          {/* FOOTER */}
          <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
            Your password is securely encrypted before being
            stored in the AgriConnect database.
          </p>
        </section>
      </div>
    </main>
  );
}