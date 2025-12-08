"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }
      if (mode === "login") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/chat");
      } else {
        setMode("login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
      {/* Left side – brand / illustration */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 p-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">My Chat App</h1>
          <p className="text-sm text-slate-300 max-w-xs">
            A private space for your conversations, seamlessly synced between web and mobile with QR login and end‑to‑end encryption.
          </p>
        </div>
        <div className="mt-10 space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <div>
              <p className="font-semibold text-slate-100">Secure by design</p>
              <p className="text-slate-400">Messages stay encrypted in transit and readable only on your devices.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-sky-400" />
            <div>
              <p className="font-semibold text-slate-100">Fast onboarding</p>
              <p className="text-slate-400">Log in on mobile instantly by scanning a QR from the web app.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side – auth form */}
      <div className="w-full md:w-1/2 p-8 md:p-10 bg-slate-950/90 backdrop-blur">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
            {mode === "login" ? "Welcome back" : "Join the workspace"}
          </p>
          <h2 className="text-xl font-semibold text-white mb-1">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === "login"
              ? "Use your email and password. You can link your phone with a QR code later."
              : "It only takes a moment. You can add mobile access with QR login afterwards."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-200">Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 pr-10 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder={mode === "login" ? "Your password" : "Create a strong password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center px-2 text-[11px] text-slate-400 hover:text-slate-200"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-2.5 text-sm font-semibold text-white mt-1 transition"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-[11px] text-slate-400">
          <button
            className="underline underline-offset-2 hover:text-slate-200"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
          </button>
          <button
            className="text-blue-400 hover:text-blue-300"
            onClick={() => router.push("/mobile-login")}
          >
            Login on mobile via QR →
          </button>
        </div>
      </div>
    </div>
  );
}


