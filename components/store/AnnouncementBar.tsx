"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-black text-white h-9 sm:h-10 px-4 relative z-50 flex items-center justify-center select-none border-b border-black">
      {/* Centered Clean Tagline - Bold, Larger & Clearly Visible */}
      <span className="text-xs sm:text-sm md:text-[14px] font-semibold text-white tracking-wider sm:tracking-widest uppercase text-center px-8">
        Dimension Street — Made in Bangladesh
      </span>

      {/* Right Minimal Close Icon */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 sm:right-6 text-neutral-400 hover:text-white transition-colors p-1.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-white/10"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
      </button>
    </div>
  );
}
