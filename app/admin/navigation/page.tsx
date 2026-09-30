"use client";

import React from "react";
import { Menu, Plus, Check } from "lucide-react";

export default function AdminNavigationPage() {
  const links = [
    { label: "SHOP", href: "/shop", status: "Active" },
    { label: "MEN", href: "/collections/men", status: "Active" },
    { label: "WOMEN", href: "/collections/women", status: "Active" },
    { label: "NEW ARRIVALS", href: "/collections/new-arrivals", status: "Active" },
    { label: "COLLECTIONS", href: "/collections", status: "Active" },
    { label: "ABOUT", href: "/about", status: "Active" },
  ];

  return (
    <div className="space-y-6 font-mono max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
            Storefront Navbar & Navigation Menus
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure header links, category taxonomies, and dropdown structures
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase text-neutral-800 pb-2 border-b border-neutral-100">
          Primary Header Links
        </h3>
        {links.map((l, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded text-xs">
            <span className="font-bold text-black">{l.label}</span>
            <span className="text-neutral-500">{l.href}</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
              {l.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
