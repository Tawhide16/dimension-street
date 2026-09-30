"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Database } from "lucide-react";

interface AdminHeaderProps {
  pageTitle?: string;
  mongoConnected?: boolean;
}

export default function AdminHeader({
  pageTitle = "OVERVIEW",
  mongoConnected = true,
}: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-neutral-500 font-medium">Dimension Storefront</span>
        <span className="text-neutral-300">/</span>
        <span className="bg-neutral-100 px-2 py-0.5 rounded font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
          {pageTitle}
        </span>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-4">
        {/* MongoDB Connection Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium rounded-full">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB: Connected</span>
        </div>

        {/* Go to Home Page Button */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-mono font-semibold rounded-md hover:bg-neutral-800 transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Go to Home Page</span>
        </Link>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-200">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-300">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Lox Admin"
              fill
              className="object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-neutral-900">Lox Admin</span>
            <span className="text-[10px] text-neutral-500 font-mono">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
