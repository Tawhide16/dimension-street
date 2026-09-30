"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, Copy, Check, Trash2, Image as ImageIcon } from "lucide-react";

const initialMedia = [
  { id: "m-1", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85", title: "Heavyweight Tee Shoot" },
  { id: "m-2", url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85", title: "Matrix Tech Pants Studio" },
  { id: "m-3", url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85", title: "480 GSM Hoodie Grey" },
  { id: "m-4", url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85", title: "Matte Bomber Model" },
  { id: "m-5", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85", title: "Heavy Canvas Tote Look" },
  { id: "m-6", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80", title: "Archive Banner Campaign" },
];

export default function AdminMediaPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
            Media Assets & Cloudinary Storage
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Browse high-resolution streetwear photography, campaign lookbooks, and product shots
          </p>
        </div>

        <button
          onClick={() => {
            const url = prompt("Enter Image URL to add to library:");
            if (url) alert("Media asset indexed to Cloudinary CDN.");
          }}
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-md flex items-center gap-2 self-start"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {initialMedia.map((media) => (
          <div
            key={media.id}
            className="group relative aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 shadow-2xs"
          >
            <Image
              src={media.url}
              alt={media.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
              <span className="text-[11px] font-bold truncate">{media.title}</span>
              <button
                onClick={() => handleCopy(media.url, media.id)}
                className="w-full py-2 bg-white text-black text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5"
              >
                {copiedId === media.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === media.id ? "Copied CDN URL" : "Copy URL"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
