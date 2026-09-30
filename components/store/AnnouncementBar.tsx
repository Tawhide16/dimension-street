"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-black text-white h-7 sm:h-7.5 px-4 relative z-50 flex items-center justify-center select-none">
      {/* Centered Clean Tagline */}
      <span className="text-[11px] sm:text-[12px] text-[#e0e0e0] font-sans font-normal tracking-wide text-center">
        Dimension Street - Made in Bangladesh
      </span>

      {/* Right Minimal Close Icon */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 sm:right-6 text-neutral-400 hover:text-white transition-colors p-1 cursor-pointer flex items-center justify-center"
        aria-label="Dismiss banner"
      >
        <X className="w-3 h-3 stroke-[1.5]" />
      </button>
    </div>
  );
}
