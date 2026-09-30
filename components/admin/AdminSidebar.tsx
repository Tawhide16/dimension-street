"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LayoutTemplate,
  Menu,
  Package,
  ShoppingBag,
  Tag,
  Image as ImageIcon,
  Globe,
  Palette,
  Users,
  LogOut,
  ExternalLink,
  Sparkles,
  Video,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Community Reels", href: "/admin/community", icon: Video, badge: "REELS", badgeColor: "bg-purple-600" },
    { label: "Homepage Builder", href: "/admin/cms", icon: LayoutTemplate, badge: "CMS", badgeColor: "bg-pink-600" },
    { label: "Navbar & Menus", href: "/admin/navigation", icon: Menu, badge: "NAV", badgeColor: "bg-rose-500" },
    { label: "Product Catalog", href: "/admin/products", icon: Package },
    { label: "Orders & Shipping", href: "/admin/orders", icon: ShoppingBag },
    { label: "Marketing & Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Media Assets", href: "/admin/media", icon: ImageIcon },
    { label: "SEO Config", href: "/admin/seo", icon: Globe, badge: "SEO", badgeColor: "bg-emerald-600" },
    { label: "Theme Customizer", href: "/admin/theme", icon: Palette },
    { label: "Admin Users & Roles", href: "/admin/users", icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#0B0D11] text-neutral-300 flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-neutral-800 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-800/80">
        <Link href="/admin" className="flex items-center gap-2 font-mono">
          {/* Isometric Logo Icon */}
          <div className="w-7 h-7 bg-white text-black rounded flex items-center justify-center font-black text-xs">
            D
          </div>
          <span className="font-bold text-white tracking-widest text-sm uppercase">
            ADMIN CMS
          </span>
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-neutral-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-white ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-neutral-800/80 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Go to Home Page</span>
        </Link>

        <button
          onClick={() => {
            alert("Signed out from Admin CMS session.");
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
