"use client";

import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-black text-white text-xs tracking-wider uppercase font-mono py-2 px-4 relative z-50 flex items-center justify-center border-b border-neutral-800">
      <div className="flex items-center gap-2 overflow-hidden text-center">
        <Sparkles className="w-3.5 h-3.5 text-neutral-300 animate-pulse flex-shrink-0" />
        <span className="font-semibold text-neutral-200">
          FREE EXPRESS SHIPPING OVER $150
        </span>
        <span className="hidden sm:inline text-neutral-500">•</span>
        <span className="hidden sm:inline text-neutral-400">
          USE CODE <span className="text-white font-bold underline underline-offset-2">WELCOME10</span> FOR 10% OFF
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 text-neutral-400 hover:text-white p-0.5"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
