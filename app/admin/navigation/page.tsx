"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Plus,
  Check,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  Upload,
  Image as ImageIcon,
  ShoppingCart,
  Heart,
  User,
  Search,
  Palette,
  Bell,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Move,
  Link2,
  Layers,
} from "lucide-react";
import { INavItem, INavbarConfig } from "@/models/NavbarConfig";
import { fallbackNavbarConfig } from "@/lib/useNavigation";

const QUICK_LINK_PRESETS = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "All Collections", href: "/collections" },
  { label: "Hoodies & Sweats", href: "/collections/hoodies" },
  { label: "Oversized Tees", href: "/collections/tees" },
  { label: "Tactical Bottoms", href: "/collections/bottoms" },
  { label: "Outerwear & Jackets", href: "/collections/outerwear" },
  { label: "About Brand", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Track Order", href: "/account" },
];

const BADGE_COLOR_PRESETS = [
  { name: "Pink / Rose", class: "bg-rose-500", text: "text-rose-500" },
  { name: "Crimson Red", class: "bg-red-600", text: "text-red-600" },
  { name: "Vibrant Emerald", class: "bg-emerald-600", text: "text-emerald-600" },
  { name: "Neon Amber", class: "bg-amber-500", text: "text-amber-500" },
  { name: "Electric Purple", class: "bg-purple-600", text: "text-purple-600" },
  { name: "Deep Cobalt", class: "bg-blue-600", text: "text-blue-600" },
  { name: "Stealth Black", class: "bg-black", text: "text-black" },
];

const ANNOUNCEMENT_BG_PRESETS = [
  "#000000",
  "#111827",
  "#1c1c1c",
  "#831843",
  "#7f1d1d",
  "#064e3b",
  "#1e1b4b",
  "#312e81",
];

export default function AdminNavigationPage() {
  const [config, setConfig] = useState<INavbarConfig>(fallbackNavbarConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "brand" | "actions" | "announcement">("menu");

  // Editing state for a specific item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // New Link Input state
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("bg-rose-500");
  const [newIsExternal, setNewIsExternal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSuccess, setLogoSuccess] = useState<string | null>(null);
  const [isDragOverLogo, setIsDragOverLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch navigation configuration
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/cms/navigation");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.config) {
            setConfig(data.config);
          }
        }
      } catch (e) {
        console.error("Failed to load navigation config:", e);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Save changes to database
  const handleSave = async (overrideConfig?: INavbarConfig) => {
    setSaving(true);
    setErrorMsg(null);
    const toSave = overrideConfig || config;
    try {
      const res = await fetch("/api/cms/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setSaveSuccess(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("navigation-updated"));
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMsg(data.error || "Failed to save navbar configuration.");
      }
    } catch {
      setErrorMsg("Network error saving navbar configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Upload logo helper with instant auto-save to MongoDB & live storefront
  const uploadLogoFile = async (file: File) => {
    if (!file) return;
    setLogoUploading(true);
    setLogoSuccess(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const updated = {
          ...config,
          logoType: "image" as const,
          logoImageUrl: data.url,
        };
        setConfig(updated);
        await handleSave(updated);
        setLogoSuccess("✓ Brand logo uploaded and published live to storefront!");
        setTimeout(() => setLogoSuccess(null), 4000);
      } else {
        setErrorMsg(data.error || "Failed to upload logo.");
      }
    } catch {
      setErrorMsg("Error uploading logo image.");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogoFile(file);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadLogoFile(file);
  };

  // Move item UP in order
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...config.items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    const updated = { ...config, items: newItems };
    setConfig(updated);
  };

  // Move item DOWN in order
  const handleMoveDown = (index: number) => {
    if (index >= config.items.length - 1) return;
    const newItems = [...config.items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    const updated = { ...config, items: newItems };
    setConfig(updated);
  };

  // Toggle item active/inactive
  const handleToggleActive = (id: string) => {
    const newItems = config.items.map((it) =>
      it.id === id ? { ...it, isActive: !it.isActive } : it
    );
    setConfig({ ...config, items: newItems });
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const newItems = config.items.filter((it) => it.id !== id);
    setConfig({ ...config, items: newItems });
    if (editingItemId === id) setEditingItemId(null);
  };

  // Add new item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newHref.trim()) return;

    const newItem: INavItem = {
      id: `nav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: newLabel.trim(),
      href: newHref.trim(),
      isActive: true,
      isExternal: newIsExternal,
      badge: newBadge.trim(),
      badgeColor: newBadgeColor,
    };

    const updated = { ...config, items: [...config.items, newItem] };
    setConfig(updated);
    setNewLabel("");
    setNewHref("");
    setNewBadge("");
    setNewIsExternal(false);
    setShowAddForm(false);
  };

  // Update existing item field
  const handleUpdateItem = (id: string, field: keyof INavItem, val: any) => {
    const newItems = config.items.map((it) =>
      it.id === id ? { ...it, [field]: val } : it
    );
    setConfig({ ...config, items: newItems });
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to reset the navigation menu to original defaults?")) {
      setConfig({ ...fallbackNavbarConfig });
    }
  };

  if (loading) {
    return (
      <div className="p-8 font-mono text-xs text-neutral-400 flex items-center gap-2">
        <Sparkles className="w-4 h-4 animate-spin text-pink-500" />
        <span>Loading Storefront Navigation Engine...</span>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="space-y-6 font-mono w-full pb-16">
      {/* Top Header & Save Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-xs">
              <Menu className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
                Navbar & Menus Customizer
              </h1>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                Reorder links, edit text, manage badges, customize brand logo, announcement bar & action icons
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </Link>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-black hover:bg-neutral-800 text-white disabled:opacity-50"
            }`}
          >
            {saving ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin text-pink-400" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Published Live!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-pink-400" />
                <span>Save & Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Interactive Live Preview of Navbar */}
      <div className="bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-800 text-white space-y-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Live Navbar Preview (Storefront Simulator)</span>
          </div>
          <span className="text-[10px] text-neutral-500 lowercase font-mono">
            updates instantly as you move & edit
          </span>
        </div>

        {/* Simulated Top Announcement */}
        {config.announcement?.enabled && (
          <div
            className="py-1.5 px-4 text-center text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            style={{
              backgroundColor: config.announcement.bgColor || "#000000",
              color: config.announcement.textColor || "#ffffff",
            }}
          >
            {config.announcement.text || "Dimension Street — Made in Bangladesh"}
          </div>
        )}

        {/* Simulated Header Navbar */}
        <div className="bg-[#141414] border border-white/10 rounded-xl p-3 sm:px-6 flex items-center justify-between">
          {/* Logo Preview */}
          <div className="flex items-center">
            {config.logoType === "text" ? (
              <span className="font-mono font-black text-lg text-white uppercase tracking-tight">
                {config.logoText || "DIMENSION STREET"}
              </span>
            ) : (
              <div className="relative h-10 w-28 flex items-center">
                <Image
                  src={config.logoImageUrl || "/images/logo.png"}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Right Header Elements Preview */}
          <div className="flex items-center gap-3">
            {/* Desktop Capsule preview */}
            <div className="flex items-center bg-[#1c1c1c] px-3 h-9 rounded-full border border-white/10 text-white text-xs gap-3">
              {config.showCart !== false && (
                <div className="flex items-center gap-1 text-neutral-300">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold bg-white/20 px-1 rounded-full">0</span>
                </div>
              )}
              {config.showWishlist !== false && <Heart className="w-3.5 h-3.5 text-neutral-300" />}
              {config.showAccount !== false && <User className="w-3.5 h-3.5 text-neutral-300" />}
              {config.showSearch !== false && <Search className="w-3.5 h-3.5 text-neutral-300" />}
            </div>

            {/* Menu Pill preview */}
            <div className="bg-[#1c1c1c] border border-white/10 px-4 h-9 rounded-full flex items-center justify-between gap-3 text-xs text-neutral-300">
              <span className="font-bold text-white">{config.menuPillLabel || "Menu"}</span>
              <span className="text-[10px] text-pink-400 font-mono">
                {config.items.filter((it) => it.isActive).length} links
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Jump: Footer Customizer Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-black to-neutral-900 text-white rounded-xl p-4 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Footer Columns & Content Menus Customizer
              </span>
              <span className="text-[9px] bg-amber-600 text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                FOOTER BUILDER
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              Customize every footer link column (SHOP, BRAND, ACCOUNT, SUPPORT, etc.), menu URLs, newsletter prompt, wordmark, and legal statement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/footer"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Edit Footer Menus ↗</span>
          </Link>
        </div>
      </div>

      {/* Brand Logo Upload & Customization Hero Section */}
      <div className="bg-white rounded-2xl border-2 border-black p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-sans">
                <ImageIcon className="w-4 h-4 text-pink-600" />
                <span>Storefront Navbar Logo Uploader</span>
              </span>
              <span className="text-[9px] bg-pink-600 text-white font-mono px-2 py-0.5 rounded font-bold uppercase">
                INSTANT AUTO-SAVE
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              Upload your custom brand logo image (PNG, SVG, JPG, WebP) or switch to typographic text. Updates live on all store pages immediately.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const updated = {
                  ...config,
                  logoType: (config.logoType === "image" ? "text" : "image") as any,
                };
                setConfig(updated);
                handleSave(updated);
              }}
              className="px-3 py-1.5 text-xs font-bold font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg border border-neutral-300 transition-colors cursor-pointer"
            >
              Mode: {config.logoType === "image" ? "Image Logo" : "Text Title"} (Switch)
            </button>
          </div>
        </div>

        {logoSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{logoSuccess}</span>
          </div>
        )}

        {config.logoType === "image" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left: Dual Preview (White & Dark background checkerboards) */}
            <div className="md:col-span-5 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Current Active Logo:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* On White */}
                <div className="relative h-24 bg-white rounded-xl border border-neutral-300 p-2 flex flex-col items-center justify-center shadow-xs">
                  <span className="absolute top-1 left-2 text-[9px] font-mono text-neutral-400">
                    Light Store
                  </span>
                  <div className="relative w-full h-14 flex items-center justify-center">
                    <Image
                      src={config.logoImageUrl || "/images/logo.png"}
                      alt="Logo Light Preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>

                {/* On Dark */}
                <div className="relative h-24 bg-black rounded-xl border border-neutral-800 p-2 flex flex-col items-center justify-center shadow-xs">
                  <span className="absolute top-1 left-2 text-[9px] font-mono text-neutral-500">
                    Dark Store
                  </span>
                  <div className="relative w-full h-14 flex items-center justify-center">
                    <Image
                      src={config.logoImageUrl || "/images/logo.png"}
                      alt="Logo Dark Preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Drag & Drop Upload Zone + Controls */}
            <div className="md:col-span-7 space-y-3">
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverLogo(true);
                }}
                onDragLeave={() => setIsDragOverLogo(false)}
                onDrop={handleLogoDrop}
                onClick={() => logoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragOverLogo
                    ? "border-pink-500 bg-pink-50 scale-[1.01]"
                    : "border-neutral-300 hover:border-black bg-neutral-50/80 hover:bg-neutral-100/70"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-2xs">
                    {logoUploading ? (
                      <Sparkles className="w-5 h-5 text-pink-500 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-pink-500" />
                    )}
                  </div>
                  <p className="font-bold text-xs text-neutral-800">
                    {logoUploading ? "Uploading Logo & Publishing..." : "Click or Drag & Drop to Upload New Logo"}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    Recommended: Transparent PNG or SVG (High Resolution, e.g. 500x160px)
                  </p>
                </div>
              </div>

              {/* URL input and action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={config.logoImageUrl || ""}
                  onChange={(e) => setConfig({ ...config, logoImageUrl: e.target.value })}
                  placeholder="Or paste direct image URL (/images/... or https://...)"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleSave({
                      ...config,
                      logoType: "image",
                      logoImageUrl: config.logoImageUrl || "/images/logo.png",
                    });
                    setLogoSuccess("✓ Logo URL saved and published live!");
                    setTimeout(() => setLogoSuccess(null), 3500);
                  }}
                  className="px-3.5 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase shrink-0 cursor-pointer shadow-xs"
                >
                  Apply & Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const resetConfig = {
                      ...config,
                      logoType: "image" as const,
                      logoImageUrl: "/images/logo.png",
                    };
                    setConfig(resetConfig);
                    handleSave(resetConfig);
                    setLogoSuccess("✓ Reset to original logo!");
                    setTimeout(() => setLogoSuccess(null), 3000);
                  }}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-100 shrink-0 cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
            <label className="text-xs font-bold uppercase text-neutral-800 block">
              Typographic Brand Title
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={config.logoText || ""}
                onChange={(e) => setConfig({ ...config, logoText: e.target.value })}
                placeholder="DIMENSION STREET"
                className="flex-1 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase focus:border-black focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  handleSave();
                  setLogoSuccess("✓ Text logo published live!");
                  setTimeout(() => setLogoSuccess(null), 3000);
                }}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase shadow-xs cursor-pointer"
              >
                Save Text Title
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto custom-scroll">
        <button
          type="button"
          onClick={() => setActiveTab("menu")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "menu"
              ? "bg-black text-white shadow-sm"
              : "bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 border border-neutral-200"
          }`}
        >
          <Move className="w-3.5 h-3.5 text-pink-400" />
          <span>Menu Links & Reordering ({config.items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("brand")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "brand"
              ? "bg-black text-white shadow-sm"
              : "bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 border border-neutral-200"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Brand Logo & Pill Label</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("actions")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "actions"
              ? "bg-black text-white shadow-sm"
              : "bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 border border-neutral-200"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Action Icons & Sticky</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "announcement"
              ? "bg-black text-white shadow-sm"
              : "bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 border border-neutral-200"
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Announcement Top Bar</span>
        </button>
      </div>

      {/* TAB 1: MENU LINKS & REORDERING */}
      {activeTab === "menu" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
            <div>
              <h3 className="text-xs font-bold uppercase text-neutral-900">
                Menu Links Sequence & Order
              </h3>
              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                Use the <span className="font-bold text-black">Move Up (↑)</span> and{" "}
                <span className="font-bold text-black">Move Down (↓)</span> buttons to reposition any link. Changes appear live on the storefront!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-pink-400" />
                <span>+ Add New Link</span>
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-1.5 text-neutral-600 hover:text-red-600 text-xs font-bold flex items-center gap-1 border border-neutral-200 bg-white rounded-lg transition-colors cursor-pointer"
                title="Reset to default links"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Quick Presets Drawer if requested */}
          <div className="p-3 bg-white rounded-xl border border-neutral-200/80">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-2">
              Quick One-Click Link Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LINK_PRESETS.map((preset) => {
                const alreadyExists = config.items.some((it) => it.href === preset.href);
                return (
                  <button
                    key={preset.href}
                    type="button"
                    disabled={alreadyExists}
                    onClick={() => {
                      const newItem: INavItem = {
                        id: `nav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        label: preset.label,
                        href: preset.href,
                        isActive: true,
                        isExternal: false,
                        badge: "",
                      };
                      setConfig({ ...config, items: [...config.items, newItem] });
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-md border transition-all flex items-center gap-1 ${
                      alreadyExists
                        ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                        : "bg-neutral-50 hover:bg-black hover:text-white border-neutral-200 text-neutral-700 cursor-pointer"
                    }`}
                  >
                    <span>+ {preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Link Form Modal / Inset Card */}
          {showAddForm && (
            <form
              onSubmit={handleAddItem}
              className="bg-white p-4 sm:p-5 rounded-xl border-2 border-black shadow-md space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold uppercase text-black flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-pink-500" />
                  Add New Navigation Menu Item
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-neutral-400 hover:text-black text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-700 block mb-1">
                    1. Link Label / Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winter Heavyweights"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-700 block mb-1">
                    2. Destination URL / Route *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /collections/winter or /shop"
                    value={newHref}
                    onChange={(e) => setNewHref(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-700 block mb-1">
                    3. Optional Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, HOT, 50% OFF, DROP"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-700 block mb-1">
                    4. Badge Color Preset
                  </label>
                  <select
                    value={newBadgeColor}
                    onChange={(e) => setNewBadgeColor(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
                  >
                    {BADGE_COLOR_PRESETS.map((color) => (
                      <option key={color.class} value={color.class}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsExternal}
                    onChange={(e) => setNewIsExternal(e.target.checked)}
                    className="rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span>Open in external new tab</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-pink-400" />
                    <span>Append to Menu</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Interactive Reorderable List */}
          <div className="space-y-2.5">
            {config.items.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 text-xs">
                No navigation menu links currently configured. Click &quot;+ Add New Link&quot; above to create one.
              </div>
            ) : (
              config.items.map((item, index) => {
                const isEditing = editingItemId === item.id;
                const isFirst = index === 0;
                const isLast = index === config.items.length - 1;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border transition-all ${
                      item.isActive
                        ? "border-neutral-200 shadow-2xs hover:border-neutral-300"
                        : "border-neutral-200/60 bg-neutral-50/70 opacity-75"
                    }`}
                  >
                    {/* Item Row Header */}
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Reorder Controls & Info */}
                      <div className="flex items-center gap-2.5">
                        {/* Position badge */}
                        <span className="w-6 h-6 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-700 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        {/* Move Up / Down Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveUp(index)}
                            title="Move item up"
                            className="p-1 rounded bg-neutral-100 hover:bg-black hover:text-white text-neutral-600 disabled:opacity-30 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-600 transition-colors cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveDown(index)}
                            title="Move item down"
                            className="p-1 rounded bg-neutral-100 hover:bg-black hover:text-white text-neutral-600 disabled:opacity-30 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-600 transition-colors cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Path */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-neutral-900 text-xs tracking-tight">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded text-white shadow-2xs ${
                                  item.badgeColor || "bg-rose-500"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.isExternal && (
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                                <span>tab</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                            <Link2 className="w-3 h-3 text-neutral-400" />
                            <span>{item.href}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (Visibility Toggle, Edit, Delete) */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Toggle Active Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}
                        >
                          {item.isActive ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-neutral-400" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingItemId(isEditing ? null : item.id)}
                          className="px-2.5 py-1 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors cursor-pointer"
                        >
                          {isEditing ? "Done" : "Edit"}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete link"
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Editor Expandable Panel */}
                    {isEditing && (
                      <div className="px-4 pb-4 pt-2 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                              Label
                            </label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => handleUpdateItem(item.id, "label", e.target.value)}
                              className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs font-mono focus:border-black focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                              URL / Route
                            </label>
                            <input
                              type="text"
                              value={item.href}
                              onChange={(e) => handleUpdateItem(item.id, "href", e.target.value)}
                              className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs font-mono focus:border-black focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                              Badge Text (Optional)
                            </label>
                            <input
                              type="text"
                              value={item.badge || ""}
                              placeholder="e.g. HOT"
                              onChange={(e) => handleUpdateItem(item.id, "badge", e.target.value)}
                              className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs font-mono focus:border-black focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                              Badge Color
                            </label>
                            <select
                              value={item.badgeColor || "bg-rose-500"}
                              onChange={(e) =>
                                handleUpdateItem(item.id, "badgeColor", e.target.value)
                              }
                              className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs font-mono focus:border-black focus:outline-none"
                            >
                              {BADGE_COLOR_PRESETS.map((color) => (
                                <option key={color.class} value={color.class}>
                                  {color.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(item.isExternal)}
                              onChange={(e) =>
                                handleUpdateItem(item.id, "isExternal", e.target.checked)
                              }
                              className="rounded border-neutral-300 text-black focus:ring-black"
                            />
                            <span>Open destination in a new browser tab</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="px-3 py-1 bg-black text-white text-[11px] font-bold rounded"
                          >
                            Close Editor
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BRAND LOGO & MENU PILL LABEL */}
      {activeTab === "brand" && (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase text-neutral-900">
              Brand Logo & Header Identification
            </h3>
            <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
              Choose between an image logo or typographic text logo, and customize the menu button label
            </p>
          </div>

          {/* Logo Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-700 block">
              Logo Display Format
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setConfig({ ...config, logoType: "image" })}
                className={`p-3 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
                  config.logoType === "image"
                    ? "border-black bg-neutral-900 text-white font-bold"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  <span>Image Logo</span>
                </div>
                <p className="text-[10px] text-neutral-400 font-sans">
                  Custom PNG/SVG logo graphic
                </p>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, logoType: "text" })}
                className={`p-3 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
                  config.logoType === "text"
                    ? "border-black bg-neutral-900 text-white font-bold"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Menu className="w-4 h-4 text-blue-400" />
                  <span>Typographic Text</span>
                </div>
                <p className="text-[10px] text-neutral-400 font-sans">
                  Minimalist high-contrast text title
                </p>
              </button>
            </div>
          </div>

          {/* Image Logo Configuration */}
          {config.logoType === "image" && (
            <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <label className="text-xs font-bold uppercase text-neutral-800 block">
                Storefront Logo Image
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-36 h-20 bg-neutral-200 rounded-lg border border-neutral-300 overflow-hidden flex items-center justify-center p-2">
                  <Image
                    src={config.logoImageUrl || "/images/logo.png"}
                    alt="Current Logo"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {logoUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px]">
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={logoUploading}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-pink-400" />
                      <span>{logoUploading ? "Uploading..." : "Upload New Logo"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, logoImageUrl: "/images/logo.png" })
                      }
                      className="px-3 py-1.5 text-xs text-neutral-600 hover:text-black border border-neutral-300 rounded bg-white transition-colors"
                    >
                      Reset to Default
                    </button>
                  </div>

                  <input
                    type="text"
                    value={config.logoImageUrl || ""}
                    onChange={(e) => setConfig({ ...config, logoImageUrl: e.target.value })}
                    placeholder="Or paste direct image URL (e.g. /images/logo.png)"
                    className="w-full bg-white border border-neutral-300 rounded px-3 py-1.5 text-xs font-mono focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Logo Configuration */}
          {config.logoType === "text" && (
            <div className="space-y-2 max-w-md">
              <label className="text-xs font-bold uppercase text-neutral-800 block">
                Brand Text Title
              </label>
              <input
                type="text"
                value={config.logoText || ""}
                onChange={(e) => setConfig({ ...config, logoText: e.target.value })}
                placeholder="DIMENSION STREET"
                className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono font-bold uppercase focus:border-black focus:outline-none"
              />
            </div>
          )}

          {/* Menu Pill Button Label */}
          <div className="space-y-2 max-w-md pt-2 border-t border-neutral-100">
            <label className="text-xs font-bold uppercase text-neutral-800 block">
              Menu Pill Button Label
            </label>
            <p className="text-[11px] text-neutral-500 font-sans">
              The text inside the header capsule pill (default is &quot;Menu&quot;)
            </p>
            <input
              type="text"
              value={config.menuPillLabel || ""}
              onChange={(e) => setConfig({ ...config, menuPillLabel: e.target.value })}
              placeholder="Menu"
              className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* TAB 3: ACTION ICONS & STICKY BEHAVIOR */}
      {activeTab === "actions" && (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase text-neutral-900">
              Header Action Buttons & Display Behaviors
            </h3>
            <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
              Toggle specific action icons on or off in the storefront header capsule
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            {/* Cart Icon Toggle */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-900 block">Shopping Cart</span>
                  <span className="text-[10px] text-neutral-500 font-sans">Slide-out cart drawer</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.showCart !== false}
                onChange={(e) => setConfig({ ...config, showCart: e.target.checked })}
                className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black cursor-pointer"
              />
            </div>

            {/* Wishlist Icon Toggle */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-900 block">Wishlist</span>
                  <span className="text-[10px] text-neutral-500 font-sans">Saved items route</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.showWishlist !== false}
                onChange={(e) => setConfig({ ...config, showWishlist: e.target.checked })}
                className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black cursor-pointer"
              />
            </div>

            {/* Account Icon Toggle */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-900 block">Account</span>
                  <span className="text-[10px] text-neutral-500 font-sans">User orders & profile</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.showAccount !== false}
                onChange={(e) => setConfig({ ...config, showAccount: e.target.checked })}
                className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black cursor-pointer"
              />
            </div>

            {/* Search Icon Toggle */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Search className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-900 block">Search</span>
                  <span className="text-[10px] text-neutral-500 font-sans">Catalog search page</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.showSearch !== false}
                onChange={(e) => setConfig({ ...config, showSearch: e.target.checked })}
                className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black cursor-pointer"
              />
            </div>
          </div>

          {/* Sticky Header Toggle */}
          <div className="pt-3 border-t border-neutral-100 max-w-xl">
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-neutral-900 block">Sticky Header on Scroll</span>
                <span className="text-[11px] text-neutral-500 font-sans">
                  Smoothly slide down when scrolling up, hide when scrolling down
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.sticky !== false}
                onChange={(e) => setConfig({ ...config, sticky: e.target.checked })}
                className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENT TOP BAR */}
      {activeTab === "announcement" && (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase text-neutral-900">
              Top Announcement Notification Strip
            </h3>
            <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
              The high-visibility banner fixed at the very top of all storefront pages
            </p>
          </div>

          {/* Enable / Disable Announcement */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 max-w-xl">
            <div>
              <span className="font-bold text-xs text-neutral-900 block">
                Enable Top Announcement Bar
              </span>
              <span className="text-[11px] text-neutral-500 font-sans">
                Show or hide the announcement strip on the storefront
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.announcement?.enabled !== false}
              onChange={(e) =>
                setConfig({
                  ...config,
                  announcement: {
                    ...config.announcement,
                    enabled: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black cursor-pointer"
            />
          </div>

          {/* Announcement Message Text */}
          <div className="space-y-1.5 max-w-xl">
            <label className="text-xs font-bold uppercase text-neutral-800 block">
              Announcement Message
            </label>
            <input
              type="text"
              value={config.announcement?.text || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  announcement: {
                    ...config.announcement,
                    text: e.target.value,
                  },
                })
              }
              placeholder="e.g. Free shipping on all orders over ৳3,000 | Dimension Street"
              className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
            />
          </div>

          {/* Clickable Destination Link */}
          <div className="space-y-1.5 max-w-xl">
            <label className="text-xs font-bold uppercase text-neutral-800 block">
              Optional Clickable Link URL
            </label>
            <input
              type="text"
              value={config.announcement?.linkUrl || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  announcement: {
                    ...config.announcement,
                    linkUrl: e.target.value,
                  },
                })
              }
              placeholder="e.g. /shop or /collections/heavyweight"
              className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
            />
          </div>

          {/* Background Color Presets */}
          <div className="space-y-2 max-w-xl">
            <label className="text-xs font-bold uppercase text-neutral-800 block">
              Banner Background Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {ANNOUNCEMENT_BG_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      announcement: {
                        ...config.announcement,
                        bgColor: color,
                      },
                    })
                  }
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    config.announcement?.bgColor === color
                      ? "border-pink-500 scale-110 shadow-xs"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}

              <input
                type="text"
                value={config.announcement?.bgColor || "#000000"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: {
                      ...config.announcement,
                      bgColor: e.target.value,
                    },
                  })
                }
                className="w-28 bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1 text-xs font-mono ml-2"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Save Confirmation Bar */}
      <div className="sticky bottom-4 z-40 bg-neutral-900 text-white p-3.5 sm:px-6 rounded-2xl border border-neutral-700 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
          <span className="text-xs font-mono">
            {config.items.length} navigation links configured • Changes ready to publish
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className={`px-5 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer ${
            saveSuccess
              ? "bg-emerald-600 text-white"
              : "bg-white hover:bg-neutral-100 text-black shadow-sm"
          }`}
        >
          {saving ? (
            <span>Publishing...</span>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Published Live!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-pink-600" />
              <span>Save & Publish Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
