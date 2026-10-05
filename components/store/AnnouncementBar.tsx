"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { useNavigation } from "@/lib/useNavigation";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const { config } = useNavigation();

  const announcement = config?.announcement;

  if (dismissed || !announcement || announcement.enabled === false) return null;

  const content = (
    <span
      className="text-xs sm:text-sm md:text-[14px] font-semibold tracking-wider sm:tracking-widest uppercase text-center px-8 transition-colors whitespace-nowrap truncate"
      style={{ color: announcement.textColor || "#ffffff" }}
    >
      {announcement.text || "Dimension Street — Made in Bangladesh"}
    </span>
  );

  return (
    <div
      className="h-9 sm:h-10 px-4 relative z-50 flex items-center justify-center select-none border-b border-black/10 transition-colors"
      style={{ backgroundColor: announcement.bgColor || "#000000" }}
    >
      {announcement.linkUrl && announcement.linkUrl.trim() ? (
        <Link
          href={announcement.linkUrl}
          className="hover:opacity-85 transition-opacity flex items-center justify-center"
        >
          {content}
        </Link>
      ) : (
        content
      )}

      {/* Right Minimal Close Icon */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 sm:right-6 text-neutral-400 hover:text-white transition-colors p-1.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-white/10"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
      </button>
    </div>
  );
}
