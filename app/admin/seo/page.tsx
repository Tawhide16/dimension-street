"use client";

import React, { useState } from "react";
import { Check, Globe } from "lucide-react";

export default function AdminSEOPage() {
  const [saved, setSaved] = useState(false);
  const [seo, setSeo] = useState({
    title: "DIMENSION STREET — Premium Heavyweight Streetwear",
    description: "Architectural silhouettes crafted from custom milled 320–480 GSM organic cotton knits. Designed in Dhaka, worn worldwide.",
    keywords: "streetwear, heavyweight hoodie, 480gsm, oversized tee, dhaka fashion, bangladesh streetwear",
    ogImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
            SEO & OpenGraph Configuration
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure dynamic search engine meta tags, indexing, and social preview cards
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>SEO Metadata configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-2xs space-y-4 text-xs">
        <div>
          <label className="block font-bold uppercase mb-1">Global Meta Title</label>
          <input
            type="text"
            value={seo.title}
            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded font-sans focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold uppercase mb-1">Meta Description</label>
          <textarea
            rows={3}
            value={seo.description}
            onChange={(e) => setSeo({ ...seo, description: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded font-sans focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold uppercase mb-1">Target Keywords</label>
          <input
            type="text"
            value={seo.keywords}
            onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded font-sans focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold uppercase mb-1">OpenGraph Social Preview Image URL</label>
          <input
            type="url"
            value={seo.ogImage}
            onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded font-sans focus:border-black focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-neutral-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded uppercase font-bold"
          >
            Save SEO Config
          </button>
        </div>
      </form>
    </div>
  );
}
