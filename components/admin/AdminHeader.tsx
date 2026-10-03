"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Database, LogOut } from "lucide-react";

interface AdminHeaderProps {
  pageTitle?: string;
  mongoConnected?: boolean;
}

export default function AdminHeader({
  pageTitle = "OVERVIEW",
  mongoConnected: initialMongoConnected,
}: AdminHeaderProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(
    typeof initialMongoConnected === "boolean" ? initialMongoConnected : null
  );

  const checkConnection = async () => {
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      const data = await res.json();
      setIsConnected(Boolean(data.mongoConnected));
    } catch {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <Link
          href="/"
          title="Go to Storefront Homepage"
          className="text-neutral-500 font-semibold hover:text-black transition-colors flex items-center gap-1.5"
        >
          <span>DIMENSION STORE</span>
          <span className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded font-medium border border-neutral-200">
            Home ↗
          </span>
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="bg-neutral-100 px-2 py-0.5 rounded font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
          {pageTitle}
        </span>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-4">
        {/* Dynamic MongoDB Connection Status Pill */}
        {isConnected === null ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-mono font-medium rounded-full">
            <Database className="w-3.5 h-3.5 text-neutral-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
            <span>MongoDB: Checking...</span>
          </div>
        ) : isConnected ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium rounded-full shadow-2xs">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>MongoDB: Connected</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-medium rounded-full shadow-2xs"
            title="MongoDB is currently disconnected. Running on local persistent cache."
          >
            <Database className="w-3.5 h-3.5 text-rose-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="font-semibold">MongoDB: Disconnected</span>
          </div>
        )}

        {/* Go to Home Page Button */}
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-mono font-semibold rounded-md hover:bg-neutral-800 transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Go to Home Page</span>
        </Link>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center border border-neutral-300">
            T
          </div>
          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-neutral-900">Tawhide H.</span>
            <span className="text-[10px] text-neutral-500 font-mono">Super Admin</span>
          </div>
          <button
            onClick={async () => {
              try {
                await fetch("/api/admin/auth/logout", { method: "POST" });
              } catch {}
              window.location.href = "/admin/login";
            }}
            title="Sign Out"
            className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors rounded-md hover:bg-neutral-100 cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
