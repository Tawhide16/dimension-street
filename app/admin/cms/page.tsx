"use client";

import React, { useState, useEffect, useRef } from "react";
import { HomepageSection, CollectionItem, Category } from "@/types";
import {
  LayoutTemplate,
  Eye,
  EyeOff,
  Check,
  Power,
  Upload,
  Image as ImageIcon,
  Link2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  Layers,
  ArrowRight,
  ExternalLink,
  Menu,
  Monitor,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Reusable Image Upload & Preview Component
interface ImageUploadFieldProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (url: string) => void;
  onAutoSave?: (newUrl: string) => void;
  aspectHint?: string;
}

function ImageUploadField({
  label,
  sublabel,
  value,
  onChange,
  onAutoSave,
  aspectHint,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
        if (onAutoSave) {
          onAutoSave(data.url);
        }
        setSuccessMsg("✓ Image uploaded and saved to live storefront!");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || "Failed to upload image.");
      }
    } catch {
      setErrorMsg("Network error during image upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-800">
          {label}
        </label>
        {aspectHint && (
          <span className="text-[10px] font-mono text-neutral-400">
            {aspectHint}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="text-[11px] text-neutral-500 font-sans">{sublabel}</p>
      )}

      {/* Preview Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
        <div className="relative w-40 h-28 bg-neutral-200 rounded-md border border-neutral-300 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-neutral-400" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-2.5">
          {/* File Upload Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-pink-400" />
              <span>{isUploading ? "Uploading..." : "Upload New Image"}</span>
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  if (onAutoSave) onAutoSave("");
                }}
                className="px-2.5 py-1.5 text-xs font-mono text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Direct URL Input with instant Apply & Save Button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste image URL (e.g. /images/... or https://...)"
              className="flex-1 text-xs font-mono px-3 py-1.5 bg-white border border-neutral-300 rounded focus:outline-none focus:border-black"
            />
            {onAutoSave && (
              <button
                type="button"
                onClick={() => {
                  onAutoSave(value);
                  setSuccessMsg("✓ Image URL applied and saved!");
                  setTimeout(() => setSuccessMsg(null), 3500);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs transition-colors"
                title="Save this image immediately to the live homepage"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply & Save</span>
              </button>
            )}
          </div>

          {successMsg && (
            <p className="text-[11px] text-emerald-700 font-mono font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{successMsg}</span>
            </p>
          )}

          {errorMsg && (
            <p className="text-[11px] text-red-600 font-mono">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCMSBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [collectionsList, setCollectionsList] = useState<CollectionItem[]>([]);
  const [openSectionId, setOpenSectionId] = useState<string | null>("sec-hero");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);

  // Load sections and collections from API
  const loadSections = async () => {
    try {
      const res = await fetch("/api/cms/sections", { cache: "no-store" });
      const data = await res.json();
      if (data.sections && data.sections.length > 0) {
        setSections(data.sections);
      }
    } catch (e) {
      console.error("Failed to load sections", e);
    }

    try {
      const colRes = await fetch("/api/collections", { cache: "no-store" });
      const colData = await colRes.json();
      if (colData.collections) {
        setCollectionsList(colData.collections);
      }
    } catch (e) {
      console.error("Failed to load collections", e);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Update a top-level field (title, subtitle, isActive)
  const updateSectionField = (id: string, field: keyof HomepageSection, val: unknown) => {
    setSections((prev) =>
      prev.map((s) => (s._id === id || s.type === id ? { ...s, [field]: val } : s))
    );
  };

  // Update a nested data field
  const updateSectionData = (id: string, dataKey: string, val: unknown) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s._id === id || s.type === id) {
          return {
            ...s,
            data: {
              ...(s.data || {}),
              [dataKey]: val,
            },
          };
        }
        return s;
      })
    );
  };

  // Auto-save a specific data key (e.g. image change)
  const handleAutoSaveImage = async (
    section: HomepageSection,
    dataKey: string,
    newUrl: string
  ) => {
    const updatedData = {
      ...(section.data || {}),
      [dataKey]: newUrl,
    };
    updateSectionData(section._id, dataKey, newUrl);

    try {
      await fetch("/api/cms/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: section._id || section.type,
          updates: {
            title: section.title,
            subtitle: section.subtitle,
            isActive: Boolean(section.isActive),
            order: section.order,
            data: updatedData,
          },
        }),
      });
      setStatusMessage("✓ Image applied and saved to live storefront!");
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setStatusMessage(null);
      }, 3500);
    } catch (err) {
      console.error("Auto-save error:", err);
    }
  };

  // Instantly toggle desktop or mobile visibility and auto-save
  const handleToggleDevice = async (
    section: HomepageSection,
    field: "hideOnDesktop" | "hideOnMobile"
  ) => {
    const currentVal = Boolean(section[field]);
    const newVal = !currentVal;
    const deviceLabel = field === "hideOnDesktop" ? "Desktop screen" : "Mobile screen";
    const secName = section.title || section.type.replace(/_/g, " ").toUpperCase();

    // 1. Instant optimistic state update
    setSections((prev) =>
      prev.map((s) =>
        s._id === section._id || s.type === section.type
          ? { ...s, [field]: newVal }
          : s
      )
    );

    setStatusMessage(`Updating ${secName} for ${deviceLabel}...`);

    // 2. Persist to MongoDB & JSON store immediately
    try {
      const res = await fetch("/api/cms/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: section._id || section.type,
          updates: {
            [field]: newVal,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.section) {
        setSections((prev) =>
          prev.map((s) =>
            s._id === data.section._id || s.type === data.section.type
              ? { ...s, ...data.section }
              : s
          )
        );
        setStatusMessage(
          newVal
            ? `✓ ${secName} is now HIDDEN on ${deviceLabel}!`
            : `✓ ${secName} is now VISIBLE on ${deviceLabel}!`
        );
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          setStatusMessage(null);
        }, 3500);
      }
    } catch (err) {
      console.error("Device toggle auto-save error:", err);
    }
  };

  // Instantly toggle master active/hidden state and auto-save
  const handleToggleActive = async (section: HomepageSection) => {
    const newVal = !section.isActive;
    const secName = section.title || section.type.replace(/_/g, " ").toUpperCase();

    const updates: Partial<HomepageSection> = {
      isActive: newVal,
    };
    // When activating, if both desktop and mobile were turned off, restore both to visible
    if (newVal && section.hideOnDesktop && section.hideOnMobile) {
      updates.hideOnDesktop = false;
      updates.hideOnMobile = false;
    }

    setSections((prev) =>
      prev.map((s) =>
        s._id === section._id || s.type === section.type
          ? { ...s, ...updates }
          : s
      )
    );

    setStatusMessage(
      newVal
        ? `Activating ${secName}...`
        : `Hiding ${secName} completely from live storefront...`
    );

    try {
      const res = await fetch("/api/cms/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: section._id || section.type,
          updates,
        }),
      });
      const data = await res.json();
      if (data.success && data.section) {
        setSections((prev) =>
          prev.map((s) =>
            s._id === data.section._id || s.type === data.section.type
              ? { ...s, ...data.section }
              : s
          )
        );
        setStatusMessage(
          newVal
            ? `✓ ${secName} is now LIVE on the storefront!`
            : `✓ ${secName} is now completely HIDDEN from your live storefront!`
        );
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          setStatusMessage(null);
        }, 3500);
      }
    } catch (err) {
      console.error("Active toggle auto-save error:", err);
    }
  };

  // Save an individual section
  const handleSaveSingleSection = async (section: HomepageSection) => {
    const targetId = section._id || section.type;
    const secName = section.title || section.type.replace(/_/g, " ").toUpperCase();
    setSavingSectionId(targetId);
    try {
      const res = await fetch("/api/cms/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetId,
          updates: {
            title: section.title,
            subtitle: section.subtitle,
            isActive: Boolean(section.isActive),
            hideOnDesktop: Boolean(section.hideOnDesktop),
            hideOnMobile: Boolean(section.hideOnMobile),
            order: section.order,
            data: section.data,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.section) {
        setSections((prev) =>
          prev.map((s) =>
            s._id === data.section._id || s.type === data.section.type
              ? { ...s, ...data.section }
              : s
          )
        );
        setStatusMessage(
          `✓ ${secName} saved successfully! ${
            !section.isActive
              ? "(Currently HIDDEN from store)"
              : section.hideOnDesktop
              ? "(Hidden on Desktop)"
              : section.hideOnMobile
              ? "(Hidden on Mobile)"
              : "(LIVE on Store)"
          }`
        );
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          setStatusMessage(null);
        }, 3500);
      }
    } catch (err) {
      console.error("Save section error:", err);
    } finally {
      setSavingSectionId(null);
    }
  };

  // Save all sections at once
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/cms/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      const data = await res.json();
      if (data.success && data.sections) {
        setSections(data.sections);
        setStatusMessage("✓ All homepage sections published successfully!");
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          setStatusMessage(null);
        }, 3500);
      }
    } catch (err) {
      console.error("Save all error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-6 w-full pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-pink-600" />
              <span>Homepage CMS Builder</span>
            </h1>
            <span className="text-[10px] font-mono font-bold bg-pink-600 text-white px-2 py-0.5 rounded uppercase">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Customize images, text content, countdowns, call-to-actions, and section visibility for every part of your storefront.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 transition-colors border border-neutral-300"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Storefront Live Preview ↗</span>
          </a>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isSaving ? "Publishing..." : "Publish All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono rounded-lg flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">
              Homepage changes published successfully to live storefront and database!
            </span>
          </div>
          <Link
            href="/"
            className="underline font-bold hover:text-black flex items-center gap-1 text-[11px]"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Quick Jump: Navbar & Menus Customizer */}
      <div className="bg-gradient-to-r from-neutral-900 via-black to-neutral-900 text-white rounded-xl p-4 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0">
            <Menu className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Navbar Customizer & Brand Logo Uploader
              </span>
              <span className="text-[9px] bg-pink-600 text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                LOGO & NAV BUILDER
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              Upload your storefront Brand Logo (PNG/SVG), reorder navbar menu items (Move Up/Down), edit links, and configure announcement bar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/navigation"
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Logo & Edit Navbar ↗</span>
          </Link>
        </div>
      </div>

      {/* Section List Cards */}
      <div className="space-y-5">
        {sections.map((section, idx) => {
          const isOpen = openSectionId === section._id || openSectionId === section.type;
          const data = (section.data || {}) as Record<string, any>;
          const isSectionHidden = !section.isActive || (Boolean(section.hideOnDesktop) && Boolean(section.hideOnMobile));
          const isDesktopHiddenOnly = section.isActive && Boolean(section.hideOnDesktop) && !section.hideOnMobile;
          const isMobileHiddenOnly = section.isActive && !section.hideOnDesktop && Boolean(section.hideOnMobile);

          const meta = {
            hero: {
              label: "HERO BILLBOARD BANNER (Top Main Banner)",
              badge: "MAIN BANNER",
              color: "bg-pink-600 text-white",
            },
            new_arrivals: {
              label: "NEW ARRIVALS PRODUCT GRID",
              badge: "PRODUCTS",
              color: "bg-blue-600 text-white",
            },
            promo_banner: {
              label: "LIMITED ARCHIVE COUNTDOWN BANNER",
              badge: "PROMO BANNER",
              color: "bg-amber-600 text-white",
            },
            shop_by_category: {
              label: "SHOP BY CATEGORY (Season Must Haves)",
              badge: "CATEGORIES",
              color: "bg-indigo-600 text-white",
            },
            brand_story: {
              label: "BRAND STORY & PHILOSOPHY (Split Section)",
              badge: "STORY",
              color: "bg-emerald-600 text-white",
            },
            best_sellers: {
              label: "BEST SELLING PRODUCTS (Top Ranking)",
              badge: "PRODUCTS",
              color: "bg-purple-600 text-white",
            },
            statement_banner: {
              label: "EDITORIAL STATEMENT BANNER (Archive Manifesto)",
              badge: "EDITORIAL",
              color: "bg-neutral-800 text-white",
            },
            community_gallery: {
              label: "COMMUNITY FEED & LOOKBOOK REELS",
              badge: "COMMUNITY",
              color: "bg-rose-600 text-white",
            },
          }[section.type] || {
            label: section.title || section.type.replace(/_/g, " "),
            badge: section.type.replace(/_/g, " "),
            color: "bg-neutral-700 text-white",
          };

          return (
            <div
              key={section._id || section.type}
              className={`bg-white rounded-xl overflow-hidden transition-all ${
                isSectionHidden
                  ? "border-2 border-rose-400 shadow-md ring-2 ring-rose-200/50"
                  : isDesktopHiddenOnly || isMobileHiddenOnly
                  ? "border-2 border-amber-400 shadow-sm"
                  : "border border-neutral-300 shadow-xs"
              }`}
            >
              {/* Prominent Hidden Banner if Section is completely hidden */}
              {isSectionHidden && (
                <div className="bg-rose-600 text-white px-4 py-2 text-xs font-mono font-bold flex items-center justify-between gap-2 shadow-inner">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 shrink-0" />
                    <span>⚠️ THIS SECTION IS CURRENTLY HIDDEN FROM LIVE STOREFRONT</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(section);
                    }}
                    className="px-2.5 py-0.5 bg-white text-rose-800 hover:bg-rose-50 text-[10px] font-bold uppercase rounded transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Make Live
                  </button>
                </div>
              )}

              {/* Header Bar */}
              <div
                className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
                  isOpen
                    ? isSectionHidden
                      ? "bg-rose-50/60 border-b border-rose-200"
                      : "bg-neutral-50/80 border-b border-neutral-200"
                    : isSectionHidden
                    ? "bg-rose-50/30 hover:bg-rose-50/60"
                    : "hover:bg-neutral-50/50"
                }`}
                onClick={() =>
                  setOpenSectionId(isOpen ? null : section._id || section.type)
                }
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-md text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                      isSectionHidden ? "bg-rose-700 text-white" : "bg-neutral-900 text-white"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-bold text-sm tracking-tight uppercase ${
                          isSectionHidden ? "text-neutral-700 line-through" : "text-neutral-900"
                        }`}
                      >
                        {meta.label}
                      </h3>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${meta.color}`}>
                        {meta.badge}
                      </span>

                      {/* Prominent Status Pill next to title */}
                      {isSectionHidden ? (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-black bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                          <EyeOff className="w-3 h-3" />
                          <span>HIDDEN</span>
                        </span>
                      ) : isDesktopHiddenOnly ? (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-black bg-amber-600 text-white flex items-center gap-1 shadow-2xs">
                          <Smartphone className="w-3 h-3" />
                          <span>MOBILE ONLY</span>
                        </span>
                      ) : isMobileHiddenOnly ? (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-black bg-amber-600 text-white flex items-center gap-1 shadow-2xs">
                          <Monitor className="w-3 h-3" />
                          <span>DESKTOP ONLY</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-emerald-600 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>LIVE</span>
                        </span>
                      )}
                    </div>
                    {section.subtitle && (
                      <p className="text-xs text-neutral-500 font-sans line-clamp-1 mt-0.5">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end" onClick={(e) => e.stopPropagation()}>
                  {/* Desktop Visibility Quick Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleDevice(section, "hideOnDesktop")}
                    title={section.hideOnDesktop ? "Desktop: HIDDEN (Click to Show)" : "Desktop: VISIBLE (Click to Hide)"}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      section.hideOnDesktop
                        ? "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 line-through"
                        : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 shadow-2xs"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1 rounded ${
                        section.hideOnDesktop ? "bg-rose-200 text-rose-900" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {section.hideOnDesktop ? "Off" : "On"}
                    </span>
                  </button>

                  {/* Mobile Visibility Quick Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleDevice(section, "hideOnMobile")}
                    title={section.hideOnMobile ? "Mobile: HIDDEN (Click to Show)" : "Mobile: VISIBLE (Click to Hide)"}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      section.hideOnMobile
                        ? "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 line-through"
                        : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 shadow-2xs"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1 rounded ${
                        section.hideOnMobile ? "bg-rose-200 text-rose-900" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {section.hideOnMobile ? "Off" : "On"}
                    </span>
                  </button>

                  {/* Master Active/Hidden Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(section)}
                    title={
                      section.isActive
                        ? "Master Status: ACTIVE (Click to completely Hide from store)"
                        : "Master Status: HIDDEN (Click to Activate on store)"
                    }
                    className={`px-3 py-1 text-xs font-mono rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                      section.isActive
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-rose-600 hover:bg-rose-700 text-white"
                    }`}
                  >
                    {section.isActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Expand/Collapse Chevron */}
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSectionId(isOpen ? null : section._id || section.type)
                    }
                    className="p-1 text-neutral-400 hover:text-black rounded"
                    title={isOpen ? "Collapse Section" : "Expand Section"}
                  >
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Content Body */}
              {isOpen && (
                <div className="p-6 space-y-6 bg-white animate-in fade-in duration-150">
                  {/* SECTION VISIBILITY CONTROL CENTER */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col gap-3.5 transition-colors ${
                      isSectionHidden
                        ? "bg-rose-50/90 border-rose-300"
                        : isDesktopHiddenOnly || isMobileHiddenOnly
                        ? "bg-amber-50/70 border-amber-300"
                        : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Sliders className="w-4 h-4 text-neutral-800" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                            Section Visibility & Device Controls
                          </span>
                          {isSectionHidden ? (
                            <span className="bg-rose-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                              <EyeOff className="w-3 h-3" />
                              <span>CURRENTLY HIDDEN FROM LIVE STORE</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                              <Check className="w-3 h-3" />
                              <span>CURRENTLY LIVE ON STORE</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-600 font-sans mt-0.5">
                          {isSectionHidden
                            ? "This section is completely hidden from customers on all devices. Click 'MAKE SECTION LIVE' to display it."
                            : "This section is currently visible to your customers. You can hide it entirely or hide it on specific devices."}
                        </p>
                      </div>

                      {/* Master 1-Click Hide/Show Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(section)}
                        className={`px-4 py-2 text-xs font-mono rounded-lg font-bold uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 ${
                          section.isActive
                            ? "bg-rose-600 hover:bg-rose-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {section.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Hide Entire Section</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Make Section Live</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Device Display Toggles */}
                    <div className="pt-3 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[11px] font-mono text-neutral-600">
                        <span className="font-bold text-neutral-800 uppercase">Device Display:</span>
                        <span className="ml-1 text-neutral-500">Toggle whether this section appears on Desktop or Mobile devices</span>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleToggleDevice(section, "hideOnDesktop")}
                          className={`px-3 py-1.5 text-xs font-mono rounded-lg font-bold flex items-center gap-2 transition-all border cursor-pointer ${
                            section.hideOnDesktop
                              ? "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 line-through"
                              : "bg-white text-neutral-900 border-neutral-300 hover:border-black hover:bg-neutral-50 shadow-2xs"
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>Desktop Screen: <strong>{section.hideOnDesktop ? "HIDDEN ✕" : "VISIBLE ✓"}</strong></span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleDevice(section, "hideOnMobile")}
                          className={`px-3 py-1.5 text-xs font-mono rounded-lg font-bold flex items-center gap-2 transition-all border cursor-pointer ${
                            section.hideOnMobile
                              ? "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 line-through"
                              : "bg-white text-neutral-900 border-neutral-300 hover:border-black hover:bg-neutral-50 shadow-2xs"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Mobile Screen: <strong>{section.hideOnMobile ? "HIDDEN ✕" : "VISIBLE ✓"}</strong></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SPECIFIC CONTROLS PER SECTION TYPE */}

                  {/* 1. HERO BANNER */}
                  {section.type === "hero" && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Main Headline Title
                          </label>
                          <input
                            type="text"
                            value={section.title || ""}
                            onChange={(e) =>
                              updateSectionField(section._id, "title", e.target.value)
                            }
                            placeholder="e.g. HERO BANNER"
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Sub-Headline Narrative
                          </label>
                          <input
                            type="text"
                            value={section.subtitle || ""}
                            onChange={(e) =>
                              updateSectionField(section._id, "subtitle", e.target.value)
                            }
                            placeholder="e.g. Primary Homepage Billboard"
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Hero Images: Desktop and Mobile */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-4 bg-neutral-100/60 rounded-xl border border-neutral-200">
                        {/* Desktop Image Upload */}
                        <ImageUploadField
                          label="🖥️ Desktop Banner Image (Panoramic)"
                          sublabel="The full-width billboard displayed on laptops and desktop screens."
                          value={data.backgroundImage || "/images/hero-banner.jpg"}
                          onChange={(url) =>
                            updateSectionData(section._id, "backgroundImage", url)
                          }
                          onAutoSave={(newUrl) =>
                            handleAutoSaveImage(section, "backgroundImage", newUrl)
                          }
                          aspectHint="Recommended: 1920x820px (Panoramic 2.34:1)"
                        />

                        {/* Mobile Image Upload */}
                        <ImageUploadField
                          label="📱 Mobile Device Banner Image (Smartphones)"
                          sublabel="Displayed on mobile phones. If empty, the desktop image will be shown as fallback."
                          value={data.mobileBackgroundImage || ""}
                          onChange={(url) =>
                            updateSectionData(section._id, "mobileBackgroundImage", url)
                          }
                          onAutoSave={(newUrl) =>
                            handleAutoSaveImage(section, "mobileBackgroundImage", newUrl)
                          }
                          aspectHint="Recommended: 800x1000px or vertical/square (Mobile 3:4)"
                        />
                      </div>

                      {/* CTA Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                        {/* Primary Button */}
                        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
                          <span className="text-[11px] font-mono font-bold uppercase text-neutral-900 block">
                            Primary CTA Button (Left)
                          </span>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                              Button Label
                            </label>
                            <input
                              type="text"
                              value={data.ctaText || "BESTSELLERS"}
                              onChange={(e) =>
                                updateSectionData(section._id, "ctaText", e.target.value)
                              }
                              className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                              Target Link URL
                            </label>
                            <input
                              type="text"
                              value={data.ctaLink || "/shop"}
                              onChange={(e) =>
                                updateSectionData(section._id, "ctaLink", e.target.value)
                              }
                              className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                            />
                          </div>
                        </div>

                        {/* Secondary Button */}
                        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
                          <span className="text-[11px] font-mono font-bold uppercase text-neutral-900 block">
                            Secondary CTA Button (Right)
                          </span>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                              Button Label
                            </label>
                            <input
                              type="text"
                              value={data.secondaryCtaText || "SHOP PINK"}
                              onChange={(e) =>
                                updateSectionData(
                                  section._id,
                                  "secondaryCtaText",
                                  e.target.value
                                )
                              }
                              className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                              Target Link URL
                            </label>
                            <input
                              type="text"
                              value={data.secondaryCtaLink || "/shop"}
                              onChange={(e) =>
                                updateSectionData(
                                  section._id,
                                  "secondaryCtaLink",
                                  e.target.value
                                )
                              }
                              className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. NEW ARRIVALS */}
                  {section.type === "new_arrivals" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={section.title || "NEW ARRIVALS"}
                            onChange={(e) =>
                              updateSectionField(section._id, "title", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Subtitle (Optional)
                          </label>
                          <input
                            type="text"
                            value={section.subtitle || ""}
                            onChange={(e) =>
                              updateSectionField(section._id, "subtitle", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Section 2 Target Collection & View All Link Config */}
                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200/80">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-neutral-800">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>Section 2 Collection Drop & View All Link</span>
                          </div>
                          <Link
                            href="/admin/collections"
                            target="_blank"
                            className="text-2xs font-mono text-neutral-600 hover:text-black flex items-center gap-1 underline underline-offset-2 transition-colors"
                          >
                            <span>+ Make / Edit Collections in Dashboard</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* 1. Quick Select Collection */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-600 font-bold mb-1">
                              Select Collection Drop
                            </label>
                            <select
                              value={
                                collectionsList.some((c) => `/collections/${c.slug}` === data.viewAllLink)
                                  ? data.viewAllLink
                                  : "custom"
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val !== "custom") {
                                  updateSectionData(section._id, "viewAllLink", val);
                                  const found = collectionsList.find((c) => `/collections/${c.slug}` === val);
                                  if (found) {
                                    updateSectionData(section._id, "viewAllText", `VIEW ALL ${found.title.toUpperCase()}`);
                                  }
                                }
                              }}
                              className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:border-black focus:outline-none"
                            >
                              <option value="custom">-- Choose from Collections --</option>
                              {collectionsList.map((col) => (
                                <option key={col._id} value={`/collections/${col.slug}`}>
                                  📁 {col.title} (/collections/{col.slug})
                                </option>
                              ))}
                            </select>
                            <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                              Auto-populates Target URL & Button Text
                            </span>
                          </div>

                          {/* 2. View All Target URL */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-600 font-bold mb-1">
                              View All Target URL
                            </label>
                            <input
                              type="text"
                              value={data.viewAllLink || "/collections/new-arrivals"}
                              onChange={(e) =>
                                updateSectionData(section._id, "viewAllLink", e.target.value)
                              }
                              placeholder="/collections/new-arrivals"
                              className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:border-black focus:outline-none"
                            />
                            <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                              URL opened when customer clicks View All
                            </span>
                          </div>

                          {/* 3. View All Link Text */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-600 font-bold mb-1">
                              View All Link Text
                            </label>
                            <input
                              type="text"
                              value={data.viewAllText || "VIEW ALL NEW"}
                              onChange={(e) =>
                                updateSectionData(section._id, "viewAllText", e.target.value)
                              }
                              placeholder="e.g. VIEW ALL NEW"
                              className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:border-black focus:outline-none"
                            />
                            <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                              Label on storefront View All CTA
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-mono uppercase text-neutral-500 font-bold">
                              Number of Products:
                            </label>
                            <select
                              value={data.limit || 4}
                              onChange={(e) =>
                                updateSectionData(section._id, "limit", Number(e.target.value))
                              }
                              className="text-xs font-mono px-2 py-1 border border-neutral-300 rounded-md bg-white"
                            >
                              <option value={4}>4 Products (1 Row)</option>
                              <option value={8}>8 Products (2 Rows)</option>
                              <option value={12}>12 Products (3 Rows)</option>
                            </select>
                          </div>

                          {data.viewAllLink && (
                            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              Active Target: <span className="font-bold">{data.viewAllLink}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. PROMO COUNTDOWN BANNER */}
                  {section.type === "promo_banner" && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Promo Billboard Headline
                          </label>
                          <input
                            type="text"
                            value={section.title || "Offer Closing Soon..."}
                            onChange={(e) =>
                              updateSectionField(section._id, "title", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Countdown Hours Remaining
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="720"
                            value={data.countdownHours || 36}
                            onChange={(e) =>
                              updateSectionData(
                                section._id,
                                "countdownHours",
                                Number(e.target.value)
                              )
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Promo Image Upload */}
                      <ImageUploadField
                        label="Promo Lookbook Background Photography"
                        sublabel="The dark backdrop image displayed behind the countdown clock and call to action."
                        value={data.bgImage || "/images/offer_closing_banner.jpg"}
                        onChange={(url) =>
                          updateSectionData(section._id, "bgImage", url)
                        }
                        onAutoSave={(newUrl) =>
                          handleAutoSaveImage(section, "bgImage", newUrl)
                        }
                        aspectHint="Recommended: 1800x600px landscape"
                      />

                      {/* Button Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                            Action Button Label
                          </label>
                          <input
                            type="text"
                            value={data.buttonText || "VIEW COLLECTION"}
                            onChange={(e) =>
                              updateSectionData(section._id, "buttonText", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                            Action Button Link URL
                          </label>
                          <input
                            type="text"
                            value={data.buttonLink || "/shop?sort=discount"}
                            onChange={(e) =>
                              updateSectionData(section._id, "buttonLink", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                          />
                        </div>
                      </div>

                      {/* Marquee Tickers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                            Top Marquee Scrolling Ticker Text
                          </label>
                          <input
                            type="text"
                            value={
                              data.topMarqueeText ||
                              "ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • "
                            }
                            onChange={(e) =>
                              updateSectionData(section._id, "topMarqueeText", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                            Bottom Marquee Scrolling Ticker Text
                          </label>
                          <input
                            type="text"
                            value={
                              data.bottomMarqueeText ||
                              "FASHION OFFERS YOU CAN'T MISS • FASHION OFFERS YOU CAN'T MISS • "
                            }
                            onChange={(e) =>
                              updateSectionData(
                                section._id,
                                "bottomMarqueeText",
                                e.target.value
                              )
                            }
                            className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. SHOP BY CATEGORY */}
                  {section.type === "shop_by_category" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={section.title || "MUST HAVES FOR THE SEASON"}
                            onChange={(e) =>
                              updateSectionField(section._id, "title", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Subtitle (Optional)
                          </label>
                          <input
                            type="text"
                            value={section.subtitle || ""}
                            onChange={(e) =>
                              updateSectionField(section._id, "subtitle", e.target.value)
                            }
                            placeholder="e.g. Explore our signature classifications."
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. BRAND STORY */}
                  {section.type === "brand_story" && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Eyebrow Label
                          </label>
                          <input
                            type="text"
                            value={data.badge || "OUR STORY"}
                            onChange={(e) =>
                              updateSectionData(section._id, "badge", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Main Headline (Supports Line Breaks)
                          </label>
                          <textarea
                            rows={2}
                            value={section.title || "Community First.\nQuality Always."}
                            onChange={(e) =>
                              updateSectionField(section._id, "title", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                          Story Narrative Paragraph
                        </label>
                        <textarea
                          rows={3}
                          value={
                            data.description ||
                            section.subtitle ||
                            "We started with one idea: build the pieces we couldn't find. No seasonal noise, no shortcuts — just essentials made properly, for people who wear them every day."
                          }
                          onChange={(e) => {
                            updateSectionData(section._id, "description", e.target.value);
                            updateSectionField(section._id, "subtitle", e.target.value);
                          }}
                          className="w-full text-xs font-sans px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                        />
                      </div>

                      {/* Brand Story Image Upload */}
                      <ImageUploadField
                        label="Community Photograph (Right Column)"
                        sublabel="The authentic streetwear photography showcasing your brand aesthetic."
                        value={data.image || "/images/community_our_story.jpg"}
                        onChange={(url) => updateSectionData(section._id, "image", url)}
                        onAutoSave={(newUrl) =>
                          handleAutoSaveImage(section, "image", newUrl)
                        }
                        aspectHint="Any aspect ratio supported (100% uncropped display, 1000x1200px portrait recommended)"
                      />

                      {/* 3 Pillars */}
                      <div className="space-y-2 pt-2 border-t border-neutral-100">
                        <span className="text-[11px] font-mono font-bold uppercase text-neutral-900 block">
                          3 Core Brand Pillars
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Pillar 1 */}
                          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
                              Pillar 1
                            </span>
                            <input
                              type="text"
                              value={data.pillar1Title || "PREMIUM FABRICS"}
                              onChange={(e) =>
                                updateSectionData(section._id, "pillar1Title", e.target.value)
                              }
                              placeholder="Title"
                              className="w-full text-xs font-mono px-2 py-1 border border-neutral-300 rounded bg-white font-bold"
                            />
                            <textarea
                              rows={2}
                              value={data.pillar1Desc || "Heavyweight cotton, garment washed."}
                              onChange={(e) =>
                                updateSectionData(section._id, "pillar1Desc", e.target.value)
                              }
                              placeholder="Description"
                              className="w-full text-xs font-sans px-2 py-1 border border-neutral-300 rounded bg-white"
                            />
                          </div>

                          {/* Pillar 2 */}
                          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
                              Pillar 2
                            </span>
                            <input
                              type="text"
                              value={data.pillar2Title || "CONSIDERED FIT"}
                              onChange={(e) =>
                                updateSectionData(section._id, "pillar2Title", e.target.value)
                              }
                              placeholder="Title"
                              className="w-full text-xs font-mono px-2 py-1 border border-neutral-300 rounded bg-white font-bold"
                            />
                            <textarea
                              rows={2}
                              value={data.pillar2Desc || "Boxy, dropped shoulder, true to size."}
                              onChange={(e) =>
                                updateSectionData(section._id, "pillar2Desc", e.target.value)
                              }
                              placeholder="Description"
                              className="w-full text-xs font-sans px-2 py-1 border border-neutral-300 rounded bg-white"
                            />
                          </div>

                          {/* Pillar 3 */}
                          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
                              Pillar 3
                            </span>
                            <input
                              type="text"
                              value={data.pillar3Title || "MADE WITH PURPOSE"}
                              onChange={(e) =>
                                updateSectionData(section._id, "pillar3Title", e.target.value)
                              }
                              placeholder="Title"
                              className="w-full text-xs font-mono px-2 py-1 border border-neutral-300 rounded bg-white font-bold"
                            />
                            <textarea
                              rows={2}
                              value={data.pillar3Desc || "Small runs, no seasonal waste."}
                              onChange={(e) =>
                                updateSectionData(section._id, "pillar3Desc", e.target.value)
                              }
                              placeholder="Description"
                              className="w-full text-xs font-sans px-2 py-1 border border-neutral-300 rounded bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Button Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                            CTA Button Label
                          </label>
                          <input
                            type="text"
                            value={data.buttonText || "LEARN MORE ABOUT US"}
                            onChange={(e) =>
                              updateSectionData(section._id, "buttonText", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                            CTA Button Link URL
                          </label>
                          <input
                            type="text"
                            value={data.buttonLink || "/about"}
                            onChange={(e) =>
                              updateSectionData(section._id, "buttonLink", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-1.5 border border-neutral-300 rounded bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. BEST SELLERS */}
                  {section.type === "best_sellers" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={section.title || "BEST SELLING PRODUCTS"}
                            onChange={(e) =>
                              updateSectionField(section._id, "title", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Subtitle (Optional)
                          </label>
                          <input
                            type="text"
                            value={section.subtitle || ""}
                            onChange={(e) =>
                              updateSectionField(section._id, "subtitle", e.target.value)
                            }
                            placeholder="e.g. Verified community favorites ranked by real order volume."
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. STATEMENT EDITORIAL BANNER */}
                  {section.type === "statement_banner" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Top Eyebrow Text
                          </label>
                          <input
                            type="text"
                            value={section.subtitle || "ORIGINAL CLOTHING ARCHIVE // DHAKA"}
                            onChange={(e) =>
                              updateSectionField(section._id, "subtitle", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Main Statement Headline
                          </label>
                          <input
                            type="text"
                            value={
                              section.title || "WE DON'T FOLLOW TRENDS. WE FORGE THE CONSTANTS."
                            }
                            onChange={(e) =>
                              updateSectionField(section._id, "title", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                          Statement Paragraph Narrative
                        </label>
                        <textarea
                          rows={2}
                          value={
                            data.description ||
                            "Every seam, weight, and silhouette is engineered with deliberate purpose. Built to endure season after season."
                          }
                          onChange={(e) =>
                            updateSectionData(section._id, "description", e.target.value)
                          }
                          className="w-full text-xs font-sans px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 8. COMMUNITY GALLERY & REVIEWS */}
                  {section.type === "community_gallery" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={section.title || "MEET OUR COMMUNITY"}
                            onChange={(e) =>
                              updateSectionField(section._id, "title", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                            Subtitle / Hashtag Tagline
                          </label>
                          <input
                            type="text"
                            value={
                              section.subtitle ||
                              "Tagged by #DimensionStreet across Dhaka, Tokyo, London & New York."
                            }
                            onChange={(e) =>
                              updateSectionField(section._id, "subtitle", e.target.value)
                            }
                            className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section Bottom Action Row */}
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-400">
                      Changes are synced to MongoDB Atlas and local persistent cache.
                    </span>

                    <button
                      type="button"
                      disabled={savingSectionId === section._id}
                      onClick={() => handleSaveSingleSection(section)}
                      className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {savingSectionId === section._id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>
                        {savingSectionId === section._id ? "Saving..." : "Save Section"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
