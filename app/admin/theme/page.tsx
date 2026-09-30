"use client";

import React, { useState } from "react";
import { Palette, Check } from "lucide-react";

export default function AdminThemePage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 font-mono max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
            Theme Customizer & Design System
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Monochrome luxury streetwear aesthetic tokens: #000000 Black, #F5F5F2 Off-white, #111111 Dark Gray
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-2xs space-y-6 text-xs">
        <div>
          <h3 className="font-bold uppercase text-neutral-800 mb-3">Core Palette Tokens</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <div className="h-14 bg-black rounded border border-neutral-300" />
              <span className="font-bold text-black block">Pitch Black</span>
              <span className="text-[10px] text-neutral-400">#000000</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-14 bg-[#111111] rounded border border-neutral-300" />
              <span className="font-bold text-black block">Dark Carbon</span>
              <span className="text-[10px] text-neutral-400">#111111</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-14 bg-[#F5F5F2] rounded border border-neutral-300" />
              <span className="font-bold text-black block">Off-White Ecru</span>
              <span className="text-[10px] text-neutral-400">#F5F5F2</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-14 bg-white rounded border border-neutral-300" />
              <span className="font-bold text-black block">Pure White</span>
              <span className="text-[10px] text-neutral-400">#FFFFFF</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100">
          <span className="text-neutral-500 block text-[11px]">
            Typography: Inter (Body) + Montserrat & Courier Monospace (Display / Streetwear SKUs)
          </span>
        </div>
      </div>
    </div>
  );
}
