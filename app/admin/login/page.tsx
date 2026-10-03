"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      window.location.href = redirectTarget || "/admin";
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Network or server connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-neutral-100 flex flex-col justify-between font-sans relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/10 rounded-full blur-[140px]" />
        <div
          className="w-full h-full opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
        >
          <span className="w-6 h-6 bg-white text-black font-black flex items-center justify-center rounded-xs text-xs">
            D
          </span>
          <span className="font-bold text-white">DIMENSION STREET</span>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
        >
          ← Return to Storefront
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#101218]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Brand & Badge */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-2xs font-mono font-bold uppercase tracking-widest text-pink-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Restricted Access // CMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="text-xs text-neutral-400 font-sans">
              Enter your authorized credentials to access the management dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Login successful. Redirecting to dashboard...</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-2xs font-mono uppercase tracking-wider text-neutral-300 font-bold">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:bg-white/10 focus:border-white focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-2xs font-mono uppercase tracking-wider text-neutral-300 font-bold">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:bg-white/10 focus:border-white focus:outline-none transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-neutral-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-black focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-neutral-400 hover:text-neutral-200">
                  Stay signed in for 30 days
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-[0.99] cursor-pointer mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Authenticate & Enter CMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-2xs font-mono text-neutral-500">
              Customer looking for order tracking?{" "}
              <Link href="/account" className="text-neutral-300 hover:text-white underline underline-offset-2 transition-colors">
                Customer Sign In / Register →
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-2xs font-mono text-neutral-600 border-t border-white/5">
        DIMENSION STREET © 2026 // SECURE ADMINISTRATIVE SYSTEM
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080B] flex items-center justify-center text-white font-mono text-xs">
          Loading secure terminal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

