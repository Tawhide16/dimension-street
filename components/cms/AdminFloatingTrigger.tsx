"use client";

import React, { useState, useEffect } from "react";
import { useLiveCms } from "./LiveCmsContext";
import { Sliders, KeyRound, Check, X, Sparkles, RefreshCw } from "lucide-react";

export default function AdminFloatingTrigger() {
  const { isAdmin, isEditorOpen, toggleEditor, loginWithPass } = useLiveCms();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailField, setShowEmailField] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hidden admin activation listeners (customers will never see or know about this)
  useEffect(() => {
    // 1. Keyboard shortcut: Ctrl + Shift + A to open quick admin pass
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setShowLoginModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // 2. Secret URL parameter check: ?cms=login or ?admin=login
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "login" || params.get("cms") === "login") {
        setShowLoginModal(true);
      }
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoggingIn(true);
    setErrorMsg(null);

    const res = await loginWithPass(password, email || undefined);
    setIsLoggingIn(false);

    if (res.success) {
      setShowLoginModal(false);
      setPassword("");
    } else {
      setErrorMsg(res.error || "Incorrect password. Try Tawhide44 or admin123");
    }
  };

  // If visitor is NOT admin and login modal is closed, render ABSOLUTELY NOTHING!
  // Customers will see a 100% normal storefront without any edit buttons or clues.
  if (!isAdmin && !showLoginModal) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button: ONLY rendered when admin is authenticated! */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-40 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            type="button"
            onClick={toggleEditor}
            className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 border cursor-pointer ${
              isEditorOpen
                ? "bg-white text-black border-white ring-4 ring-black/10 scale-105"
                : "bg-black/90 hover:bg-black text-white border-white/20 hover:border-white/60 backdrop-blur-md"
            }`}
            title="Toggle Live Theme & CMS Editor"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500" />
            </span>
            <Sliders className="w-4 h-4 text-pink-400 group-hover:rotate-45 transition-transform" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              {isEditorOpen ? "Close Live CMS" : "Edit Store (CMS)"}
            </span>
          </button>
        </div>
      )}

      {/* Admin Quick Pass Login Dialog */}
      {showLoginModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in">
          <div className="w-full max-w-sm bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                setErrorMsg(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-pink-600/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-white">
                  Admin Live CMS
                </h3>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Enter password to unlock visual editor
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
              {showEmailField && (
                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Enter admin pass (e.g. Tawhide44)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              {errorMsg && (
                <p className="text-[11px] font-mono text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2 rounded text-center">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-wider text-xs font-mono rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-pink-600" />
                )}
                <span>{isLoggingIn ? "Verifying..." : "Unlock Live Customizer"}</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-neutral-500">
                <button
                  type="button"
                  onClick={() => setShowEmailField(!showEmailField)}
                  className="hover:text-neutral-300 underline"
                >
                  {showEmailField ? "Hide email field" : "Use custom email"}
                </button>
                <span>Default: Tawhide44</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

