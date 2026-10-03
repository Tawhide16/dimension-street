"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

interface CustomerAuthPortalProps {
  initialMode?: "login" | "register";
}

export default function CustomerAuthPortal({
  initialMode = "login",
}: CustomerAuthPortalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSwitchMode = (newMode: "login" | "register") => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (mode === "register") {
      const cleanName = name.trim();
      if (!cleanName) {
        setError("Please enter your full name.");
        return;
      }
      if (!cleanEmail || !cleanEmail.includes("@")) {
        setError("Please provide a valid email address.");
        return;
      }
      if (cleanPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: phone.trim(),
            password: cleanPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Failed to create account. Please try again.");
          setLoading(false);
          return;
        }

        setSuccess("Account created successfully! Redirecting to your account...");
        setTimeout(() => {
          router.refresh();
        }, 600);
      } catch (err) {
        setError("Network connection issue. Please check your network and try again.");
        setLoading(false);
      }
    } else {
      // Login mode
      if (!cleanEmail || !cleanPassword) {
        setError("Please enter both email and password.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Invalid email or password.");
          setLoading(false);
          return;
        }

        if (data.isAdmin || data.redirectTo) {
          setSuccess("Admin authorized! Redirecting directly to Admin Dashboard...");
          window.location.href = data.redirectTo || "/admin";
          return;
        }

        setSuccess("Login successful! Loading your order details...");
        setTimeout(() => {
          window.location.href = "/account";
        }, 500);
      } catch (err) {
        setError("Network connection issue. Please check your network and try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-4">
      {/* Tab Switcher */}
      <div className="flex items-center p-1 bg-neutral-100 rounded-xl mb-6 border border-neutral-200">
        <button
          type="button"
          onClick={() => handleSwitchMode("login")}
          className={`flex-1 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            mode === "login"
              ? "bg-white text-black shadow-xs"
              : "text-neutral-500 hover:text-black"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode("register")}
          className={`flex-1 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            mode === "register"
              ? "bg-white text-black shadow-xs"
              : "text-neutral-500 hover:text-black"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Header Title */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
            {mode === "login" ? "CUSTOMER PORTAL // AUTH" : "JOIN DIMENSION STREET"}
          </span>
          <h2 className="text-2xl font-black uppercase text-neutral-900 tracking-tight mt-1">
            {mode === "login" ? "Access Your Account" : "Register New Account"}
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-1">
            {mode === "login"
              ? "Sign in to track your parcels, review order history and receipts."
              : "Create your personal account to securely save and track your orders."}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="leading-snug">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-2xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-none transition-all font-sans"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-2xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1712 345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-none transition-all font-sans"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block text-2xs font-mono font-bold uppercase tracking-wider text-neutral-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-none transition-all font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-2xs font-mono font-bold uppercase tracking-wider text-neutral-700">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-none transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-neutral-400 hover:text-neutral-800 absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-1">
              <label className="block text-2xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-none transition-all font-sans"
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.99]"
          >
            {loading ? (
              <span>Processing...</span>
            ) : mode === "login" ? (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Perks footer */}
        <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-2 gap-2 text-2xs font-mono text-neutral-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-neutral-600" />
            <span>Order History & Receipts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
