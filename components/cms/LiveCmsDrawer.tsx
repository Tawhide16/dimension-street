"use client";

import React, { useState, useRef } from "react";
import { useLiveCms } from "./LiveCmsContext";
import { fallbackNavbarConfig } from "@/lib/useNavigation";
import { CategoryCardItem, DEFAULT_CATEGORY_CARDS } from "@/components/store/CategoryGrid";
import { BestSellerProductItem, DEFAULT_BESTSELLERS } from "@/components/store/BestSellingSection";
import {
  Palette,
  Type,
  LayoutTemplate,
  FolderPlus,
  Compass,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ExternalLink,
  MoveHorizontal,
  LogOut,
  Smartphone,
  Monitor,
  Eye,
  Sparkles,
  Link2,
  Columns,
} from "lucide-react";

export default function LiveCmsDrawer() {
  const {
    isAdmin,
    isEditorOpen,
    toggleEditor,
    drawerPosition,
    setDrawerPosition,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    selectedSectionId,
    setSelectedSectionId,
    sections,
    updateSectionData,
    updateSectionField,
    themeConfig,
    updateTheme,
    footerConfig,
    updateFooter,
    addFooterLink,
    removeFooterLink,
    updateFooterSocial,
    navigationConfig,
    updateNavigation,
    collections,
    createNewCollection,
    hasChanges,
    isSaving,
    saveSuccess,
    statusMessage,
    saveAll,
    discardChanges,
    logoutAdmin,
  } = useLiveCms();

  // New Collection Form state
  const [newColTitle, setNewColTitle] = useState("");
  const [newColSlug, setNewColSlug] = useState("");
  const [newColImage, setNewColImage] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColFeatured, setNewColFeatured] = useState(true);
  const [isCreatingCol, setIsCreatingCol] = useState(false);
  const [colSuccessMsg, setColSuccessMsg] = useState<string | null>(null);

  // New Footer Link state
  const [selectedColId, setSelectedColId] = useState(footerConfig?.columns?.[0]?.id || "col-shop");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");
  const [newLinkExternal, setNewLinkExternal] = useState(false);
  const [footerLinkSuccess, setFooterLinkSuccess] = useState(false);

  // Uploading state
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadCallback, setActiveUploadCallback] = useState<((url: string) => void) | null>(null);

  // Wide 2-column mode state (Left: Text & Content, Right: Image Uploads)
  const [isWideView, setIsWideView] = useState(true);

  // Section finders
  const heroSection = sections.find((s) => s.type === "hero");
  const heroData = (heroSection?.data || {}) as Record<string, string>;

  const promoSection = sections.find((s) => s.type === "promo_banner");
  const promoData = (promoSection?.data || {}) as Record<string, any>;

  const brandSection = sections.find((s) => s.type === "brand_story");
  const brandData = (brandSection?.data || {}) as Record<string, string>;

  const statementSection = sections.find((s) => s.type === "statement_banner");
  const statementData = (statementSection?.data || {}) as Record<string, string>;

  const newArrivalsSection = sections.find((s) => s.type === "new_arrivals");
  const newArrivalsData = (newArrivalsSection?.data || {}) as Record<string, any>;

  const bestSellersSection = sections.find((s) => s.type === "best_sellers");
  const bestSellersData = (bestSellersSection?.data || {}) as Record<string, any>;

  const categorySection = sections.find((s) => s.type === "shop_by_category");
  const categoryData = (categorySection?.data || {}) as Record<string, any>;

  // Category cards helpers
  const activeCategoryCards: CategoryCardItem[] = Array.isArray(categoryData.cards) && categoryData.cards.length > 0
    ? categoryData.cards
    : DEFAULT_CATEGORY_CARDS;

  const updateCategoryCard = (index: number, key: keyof CategoryCardItem, val: string) => {
    const next = [...activeCategoryCards];
    next[index] = { ...next[index], [key]: val };
    updateSectionData("shop_by_category", "cards", next);
  };

  const addCategoryCard = () => {
    const next = [
      ...activeCategoryCards,
      { title: "NEW COLLECTION", link: "/shop", image: "/images/season_tops.jpg" },
    ];
    updateSectionData("shop_by_category", "cards", next);
  };

  const removeCategoryCard = (index: number) => {
    const next = activeCategoryCards.filter((_, i) => i !== index);
    updateSectionData("shop_by_category", "cards", next);
  };

  // Best Seller cards helpers
  const activeBestSellerCards: BestSellerProductItem[] = Array.isArray(bestSellersData.cards) && bestSellersData.cards.length > 0
    ? bestSellersData.cards
    : DEFAULT_BESTSELLERS;

  const updateBestSellerCard = (index: number, key: keyof BestSellerProductItem, val: any) => {
    const next = [...activeBestSellerCards];
    next[index] = { ...next[index], [key]: val };
    updateSectionData("best_sellers", "cards", next);
  };

  const addBestSellerCard = () => {
    const next = [
      ...activeBestSellerCards,
      {
        id: `bs-${Date.now()}`,
        brand: "Singh",
        name: "New Best Seller Item",
        price: 8400,
        slug: "dimension-isometric-heavyweight-tee",
        image: "/images/bestseller_singh_black_tee.jpg",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      },
    ];
    updateSectionData("best_sellers", "cards", next);
  };

  const removeBestSellerCard = (index: number) => {
    const next = activeBestSellerCards.filter((_, i) => i !== index);
    updateSectionData("best_sellers", "cards", next);
  };

  if (!isAdmin || !isEditorOpen) return null;

  // File upload helper
  const triggerFileUpload = (callback: (url: string) => void, fieldKey: string) => {
    setActiveUploadCallback(() => callback);
    setUploadingField(fieldKey);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadCallback) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        activeUploadCallback(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Failed to upload image.");
    } finally {
      setUploadingField(null);
      setActiveUploadCallback(null);
    }
  };

  // Create Collection Handler
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;

    setIsCreatingCol(true);
    const success = await createNewCollection({
      title: newColTitle.trim(),
      slug: newColSlug.trim() || undefined,
      description: newColDesc.trim() || undefined,
      bannerImage: newColImage.trim() || "/images/hero-banner.jpg",
      featured: newColFeatured,
    });

    setIsCreatingCol(false);
    if (success) {
      setColSuccessMsg(`✓ Collection "${newColTitle}" created!`);
      setNewColTitle("");
      setNewColSlug("");
      setNewColImage("");
      setNewColDesc("");
      setTimeout(() => setColSuccessMsg(null), 3500);
    } else {
      alert("Failed to create collection. Title or slug might be duplicate.");
    }
  };

  // Add Footer Link Handler
  const handleAddFooterLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkHref.trim()) return;

    addFooterLink(selectedColId, {
      label: newLinkLabel.trim(),
      href: newLinkHref.trim(),
      isExternal: newLinkExternal,
    });

    setNewLinkLabel("");
    setNewLinkHref("");
    setNewLinkExternal(false);
    setFooterLinkSuccess(true);
    setTimeout(() => setFooterLinkSuccess(false), 3000);
  };

  return (
    <>
      {/* Hidden file input for seamless direct uploads anywhere */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Drawer Container - Wide 2-Column Split (Left: Text & Content, Right: Image Uploads) */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-full ${
          isWideView ? "sm:w-[740px] lg:w-[860px] xl:w-[940px]" : "sm:w-[440px]"
        } bg-neutral-950 text-white border-neutral-800 shadow-2xl flex flex-col transition-all duration-300 select-none ${
          drawerPosition === "left" ? "left-0 border-r" : "right-0 border-l"
        }`}
      >
        {/* 1. Header Toolbar */}
        <div className="p-4 border-b border-neutral-800 bg-black/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-black text-xs">
              D
            </div>
            <div>
              <h2 className="text-xs font-black tracking-widest uppercase text-white font-mono flex items-center gap-1.5">
                <span>Theme & CMS Customizer</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Preview Active {isWideView ? "(2-Column Editor)" : "(Compact)"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle 2-Column Wide / Single Column view */}
            <button
              type="button"
              onClick={() => setIsWideView(!isWideView)}
              className={`p-1.5 rounded border transition-colors ${
                isWideView
                  ? "bg-white text-black border-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900 border-neutral-800"
              }`}
              title={
                isWideView
                  ? "Switch to narrow drawer"
                  : "Switch to 2-column wide editor (Left: Text & Content, Right: Image Uploads)"
              }
            >
              <Columns className="w-3.5 h-3.5" />
            </button>

            {/* Dock Position Switch */}
            <button
              type="button"
              onClick={() => setDrawerPosition(drawerPosition === "left" ? "right" : "left")}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 border border-neutral-800 transition-colors"
              title={`Move Drawer to ${drawerPosition === "left" ? "Right" : "Left"}`}
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={logoutAdmin}
              className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-900 border border-neutral-800 transition-colors"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={toggleEditor}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Top Navigation Tabs */}
        <div className="grid grid-cols-5 border-b border-neutral-800 bg-neutral-900/60 shrink-0 text-center text-[10px] font-mono uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`py-2.5 flex flex-col items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === "sections"
                ? "border-white text-white bg-neutral-800/40 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Sections</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`py-2.5 flex flex-col items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === "typography"
                ? "border-white text-white bg-neutral-800/40 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text Size</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("theme")}
            className={`py-2.5 flex flex-col items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === "theme"
                ? "border-white text-white bg-neutral-800/40 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("collections")}
            className={`py-2.5 flex flex-col items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === "collections"
                ? "border-white text-white bg-neutral-800/40 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Collections</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("footer")}
            className={`py-2.5 flex flex-col items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === "footer"
                ? "border-white text-white bg-neutral-800/40 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Footer</span>
          </button>
        </div>

        {/* 3. Tab Contents Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-sans select-text">
          {/* TAB 1: SECTIONS & CONTENT */}
          {activeTab === "sections" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold">
                  Storefront Content & Media
                </span>
                <span className="text-[10px] font-mono text-neutral-500">Live Changes</span>
              </div>

              {/* 1.1 Announcement Bar */}
              <div className="bg-neutral-900/90 rounded-xl border border-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSectionId(selectedSectionId === "announcement" ? null : "announcement")
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Top Announcement Bar</span>
                  </span>
                  {selectedSectionId === "announcement" ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {selectedSectionId === "announcement" && (
                  <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Text & Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-amber-400 font-bold">
                          <Type className="w-3.5 h-3.5" />
                          <span>Announcement Text & Link</span>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                          <input
                            type="checkbox"
                            checked={navigationConfig?.announcement?.enabled !== false}
                            onChange={(e) =>
                              updateNavigation({
                                announcement: {
                                  ...(navigationConfig.announcement || fallbackNavbarConfig.announcement!),
                                  enabled: e.target.checked,
                                },
                              })
                            }
                            className="rounded accent-white"
                          />
                          <span>Show Announcement Bar</span>
                        </label>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Announcement Text
                          </label>
                          <input
                            type="text"
                            value={navigationConfig?.announcement?.text || ""}
                            onChange={(e) =>
                              updateNavigation({
                                announcement: {
                                  ...(navigationConfig.announcement || fallbackNavbarConfig.announcement!),
                                  text: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Click URL Link (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="/shop or https://..."
                            value={navigationConfig?.announcement?.linkUrl || ""}
                            onChange={(e) =>
                              updateNavigation({
                                announcement: {
                                  ...(navigationConfig.announcement || fallbackNavbarConfig.announcement!),
                                  linkUrl: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Right: Colors & Styling */}
                      <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-pink-400 font-bold">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Bar Colors & Visuals</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={navigationConfig?.announcement?.bgColor || "#000000"}
                              onChange={(e) =>
                                updateNavigation({
                                  announcement: {
                                    ...(navigationConfig.announcement || fallbackNavbarConfig.announcement!),
                                    bgColor: e.target.value,
                                  },
                                })
                              }
                              className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                            />
                            <span className="font-mono text-xs text-neutral-300">
                              {navigationConfig?.announcement?.bgColor || "#000000"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Text Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={navigationConfig?.announcement?.textColor || "#ffffff"}
                              onChange={(e) =>
                                updateNavigation({
                                  announcement: {
                                    ...(navigationConfig.announcement || fallbackNavbarConfig.announcement!),
                                    textColor: e.target.value,
                                  },
                                })
                              }
                              className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                            />
                            <span className="font-mono text-xs text-neutral-300">
                              {navigationConfig?.announcement?.textColor || "#ffffff"}
                            </span>
                          </div>
                        </div>

                        {/* Live Pill Preview */}
                        <div
                          className="mt-3 p-2 rounded text-center text-xs font-semibold uppercase tracking-wider truncate"
                          style={{
                            backgroundColor: navigationConfig?.announcement?.bgColor || "#000000",
                            color: navigationConfig?.announcement?.textColor || "#ffffff",
                          }}
                        >
                          {navigationConfig?.announcement?.text || "Announcement Preview"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.2 Hero Banner */}
              <div className="bg-neutral-900/90 rounded-xl border border-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedSectionId(selectedSectionId === "hero" ? null : "hero")}
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Hero Banner (Billboard)</span>
                  </span>
                  {selectedSectionId === "hero" ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {selectedSectionId === "hero" && (
                  <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Text & Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-amber-400 font-bold">
                          <Type className="w-3.5 h-3.5" />
                          <span>Hero Headline & CTA Links</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Main Title Text
                          </label>
                          <input
                            type="text"
                            value={heroSection?.title || ""}
                            onChange={(e) => updateSectionField("hero", "title", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Subtitle Text
                          </label>
                          <textarea
                            rows={2}
                            value={heroSection?.subtitle || ""}
                            onChange={(e) => updateSectionField("hero", "subtitle", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white resize-none"
                          />
                        </div>

                        {/* Button 1 CTA */}
                        <div className="p-2.5 bg-neutral-900/80 rounded border border-neutral-800 space-y-2">
                          <span className="text-[9px] font-mono uppercase text-neutral-400 font-bold block">
                            Primary Action Button (Solid White)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                Button Label
                              </label>
                              <input
                                type="text"
                                value={heroData.ctaText || "BESTSELLERS"}
                                onChange={(e) => updateSectionData("hero", "ctaText", e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                Link URL
                              </label>
                              <input
                                type="text"
                                value={heroData.ctaLink || "/shop"}
                                onChange={(e) => updateSectionData("hero", "ctaLink", e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Button 2 CTA */}
                        <div className="p-2.5 bg-neutral-900/80 rounded border border-neutral-800 space-y-2">
                          <span className="text-[9px] font-mono uppercase text-neutral-400 font-bold block">
                            Secondary Button (Transparent / White Border)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                Button Label
                              </label>
                              <input
                                type="text"
                                value={heroData.secondaryCtaText || "SHOP PINK"}
                                onChange={(e) => updateSectionData("hero", "secondaryCtaText", e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                Link URL
                              </label>
                              <input
                                type="text"
                                value={heroData.secondaryCtaLink || "/shop"}
                                onChange={(e) => updateSectionData("hero", "secondaryCtaLink", e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Upload Images */}
                      <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-pink-400 font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Hero Banner Media Uploads</span>
                        </div>

                        {/* Desktop Hero Image */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-mono uppercase text-neutral-400">
                              Desktop Panoramic Banner
                            </label>
                            <span className="text-[9px] font-mono text-neutral-500">1920×800 Recommended</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="/images/... or https://..."
                              value={heroData.backgroundImage || ""}
                              onChange={(e) => updateSectionData("hero", "backgroundImage", e.target.value)}
                              className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                triggerFileUpload((url) => updateSectionData("hero", "backgroundImage", url), "hero-bg")
                              }
                              disabled={uploadingField === "hero-bg"}
                              className="px-3 py-1.5 bg-neutral-800 hover:bg-white hover:text-black text-white text-xs font-mono font-bold rounded flex items-center gap-1 transition-colors border border-neutral-700 shrink-0"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingField === "hero-bg" ? "..." : "Upload"}</span>
                            </button>
                          </div>
                          {heroData.backgroundImage && (
                            <div className="mt-2 w-full h-24 rounded overflow-hidden border border-neutral-800 relative bg-neutral-900">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={heroData.backgroundImage}
                                alt="Hero preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Mobile Hero Image */}
                        <div className="pt-2 border-t border-neutral-800/80">
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Mobile Portrait Banner (Optional)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Mobile image URL"
                              value={heroData.mobileBackgroundImage || ""}
                              onChange={(e) => updateSectionData("hero", "mobileBackgroundImage", e.target.value)}
                              className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                triggerFileUpload((url) => updateSectionData("hero", "mobileBackgroundImage", url), "hero-mobile")
                              }
                              disabled={uploadingField === "hero-mobile"}
                              className="px-3 py-1.5 bg-neutral-800 hover:bg-white hover:text-black text-white text-xs font-mono font-bold rounded flex items-center gap-1 transition-colors border border-neutral-700 shrink-0"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Upload</span>
                            </button>
                          </div>
                          {heroData.mobileBackgroundImage && (
                            <div className="mt-2 w-20 h-28 rounded overflow-hidden border border-neutral-800 relative bg-neutral-900">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={heroData.mobileBackgroundImage}
                                alt="Hero mobile preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.3 Shop by Category (Collection Cards) - NEW */}
              <div className="bg-neutral-900/90 rounded-xl border border-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSectionId(
                      selectedSectionId === "shop_by_category" || selectedSectionId === "categories"
                        ? null
                        : "shop_by_category"
                    )
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Shop by Category (Collection Cards)</span>
                  </span>
                  {selectedSectionId === "shop_by_category" || selectedSectionId === "categories" ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {(selectedSectionId === "shop_by_category" || selectedSectionId === "categories") && (
                  <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Text & Collection Links */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-amber-400 font-bold">
                          <Type className="w-3.5 h-3.5" />
                          <span>Section Title & Card Links</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={categorySection?.title || "MUST HAVES FOR THE SEASON"}
                            onChange={(e) => updateSectionField("shop_by_category", "title", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Section Subtitle (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Explore our signature classifications"
                            value={categorySection?.subtitle || ""}
                            onChange={(e) => updateSectionField("shop_by_category", "subtitle", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                          />
                        </div>

                        <div className="space-y-2.5 pt-2">
                          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                            Cards Content & Target Links ({activeCategoryCards.length})
                          </span>

                          {activeCategoryCards.map((card, idx) => (
                            <div key={idx} className="p-2.5 bg-neutral-900/80 rounded-lg border border-neutral-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                                  Card #{idx + 1}
                                </span>
                                {activeCategoryCards.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeCategoryCard(idx)}
                                    className="text-neutral-500 hover:text-red-400 text-xs"
                                    title="Remove Card"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div>
                                <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                  Card Label
                                </label>
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={(e) => updateCategoryCard(idx, "title", e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                  Collection / Page Link
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="/shop?category=tees or /collections/..."
                                    value={card.link || card.href || ""}
                                    onChange={(e) => updateCategoryCard(idx, "link", e.target.value)}
                                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                                  />
                                  {collections && collections.length > 0 && (
                                    <select
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          updateCategoryCard(idx, "link", `/collections/${e.target.value}`);
                                        }
                                      }}
                                      className="bg-neutral-800 text-[10px] text-neutral-300 rounded px-1.5 py-1 border border-neutral-700 font-mono"
                                      title="Pick from existing collection"
                                      value=""
                                    >
                                      <option value="" disabled>Pick</option>
                                      {collections.map((col) => (
                                        <option key={col._id} value={col.slug}>{col.title}</option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addCategoryCard}
                            className="w-full py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-dashed border-neutral-700 rounded text-xs font-mono text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Collection Card</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Upload Collection Card Images */}
                      <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-pink-400 font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Upload Collection Card Images</span>
                        </div>

                        <div className="space-y-3">
                          {activeCategoryCards.map((card, idx) => (
                            <div key={idx} className="p-2.5 bg-neutral-950/80 rounded-lg border border-neutral-800/80 space-y-2">
                              <span className="text-[10px] font-mono text-neutral-400 font-bold block">
                                Card #{idx + 1} Image: <span className="text-white">{card.title || "Untitled"}</span>
                              </span>

                              <div className="flex items-center gap-3">
                                <div className="w-16 h-20 bg-neutral-900 rounded border border-neutral-700 overflow-hidden relative shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={card.image || "/images/season_tops.jpg"}
                                    alt={card.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      triggerFileUpload(
                                        (url) => updateCategoryCard(idx, "image", url),
                                        `cat-card-${idx}`
                                      )
                                    }
                                    disabled={uploadingField === `cat-card-${idx}`}
                                    className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-white hover:text-black text-white text-xs font-mono font-bold rounded flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>
                                      {uploadingField === `cat-card-${idx}` ? "Uploading..." : "Upload Card Image"}
                                    </span>
                                  </button>
                                  <input
                                    type="text"
                                    placeholder="/images/... or https://..."
                                    value={card.image || ""}
                                    onChange={(e) => updateCategoryCard(idx, "image", e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-[11px] text-white font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.4 Best Selling Products (Cards & Links) - NEW */}
              <div className="bg-neutral-900/90 rounded-xl border border-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSectionId(
                      selectedSectionId === "best_sellers" ? null : "best_sellers"
                    )
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Best Selling Products (Cards & Links)</span>
                  </span>
                  {selectedSectionId === "best_sellers" ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {selectedSectionId === "best_sellers" && (
                  <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Text & Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-amber-400 font-bold">
                          <Type className="w-3.5 h-3.5" />
                          <span>Headline & Product Card Meta</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={bestSellersSection?.title || "BEST SELLING PRODUCTS"}
                            onChange={(e) => updateSectionField("best_sellers", "title", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Section Subtitle (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Verified community favorites ranked by real order volume."
                            value={bestSellersSection?.subtitle || ""}
                            onChange={(e) => updateSectionField("best_sellers", "subtitle", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                          />
                        </div>

                        <div className="space-y-2.5 pt-2">
                          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                            Best Seller Product Cards ({activeBestSellerCards.length})
                          </span>

                          {activeBestSellerCards.map((card, idx) => (
                            <div key={card.id || idx} className="p-2.5 bg-neutral-900/80 rounded-lg border border-neutral-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                  Card #{idx + 1}
                                </span>
                                {activeBestSellerCards.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeBestSellerCard(idx)}
                                    className="text-neutral-500 hover:text-red-400 text-xs"
                                    title="Remove Card"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                    Brand / Badge
                                  </label>
                                  <input
                                    type="text"
                                    value={card.brand}
                                    onChange={(e) => updateBestSellerCard(idx, "brand", e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                    Price (Tk)
                                  </label>
                                  <input
                                    type="number"
                                    value={card.price}
                                    onChange={(e) => updateBestSellerCard(idx, "price", Number(e.target.value) || 0)}
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                  Product Title
                                </label>
                                <input
                                  type="text"
                                  value={card.name}
                                  onChange={(e) => updateBestSellerCard(idx, "name", e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                  Product / Collection Link
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="/product/slug or /collections/..."
                                    value={card.slug}
                                    onChange={(e) => updateBestSellerCard(idx, "slug", e.target.value)}
                                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                                  />
                                  {collections && collections.length > 0 && (
                                    <select
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          updateBestSellerCard(idx, "slug", `/collections/${e.target.value}`);
                                        }
                                      }}
                                      className="bg-neutral-800 text-[10px] text-neutral-300 rounded px-1.5 py-1 border border-neutral-700 font-mono"
                                      title="Link to Collection"
                                      value=""
                                    >
                                      <option value="" disabled>Col</option>
                                      {collections.map((col) => (
                                        <option key={col._id} value={col.slug}>{col.title}</option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">
                                  Available Sizes (Comma separated)
                                </label>
                                <input
                                  type="text"
                                  value={Array.isArray(card.sizes) ? card.sizes.join(", ") : "ONE SIZE"}
                                  onChange={(e) =>
                                    updateBestSellerCard(
                                      idx,
                                      "sizes",
                                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                    )
                                  }
                                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addBestSellerCard}
                            className="w-full py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-dashed border-neutral-700 rounded text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Best Seller Card</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Upload Product Card Images */}
                      <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-pink-400 font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Upload Product Card Images</span>
                        </div>

                        <div className="space-y-3">
                          {activeBestSellerCards.map((card, idx) => (
                            <div key={card.id || idx} className="p-2.5 bg-neutral-950/80 rounded-lg border border-neutral-800/80 space-y-2">
                              <span className="text-[10px] font-mono text-neutral-400 font-bold block">
                                Card #{idx + 1} Image: <span className="text-white line-clamp-1">{card.name}</span>
                              </span>

                              <div className="flex items-center gap-3">
                                <div className="w-16 h-20 bg-neutral-900 rounded border border-neutral-700 overflow-hidden relative shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={card.image || "/images/bestseller_singh_black_tee.jpg"}
                                    alt={card.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      triggerFileUpload(
                                        (url) => updateBestSellerCard(idx, "image", url),
                                        `bs-card-${idx}`
                                      )
                                    }
                                    disabled={uploadingField === `bs-card-${idx}`}
                                    className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-white hover:text-black text-white text-xs font-mono font-bold rounded flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>
                                      {uploadingField === `bs-card-${idx}` ? "Uploading..." : "Upload Card Image"}
                                    </span>
                                  </button>
                                  <input
                                    type="text"
                                    placeholder="/images/... or https://..."
                                    value={card.image || ""}
                                    onChange={(e) => updateBestSellerCard(idx, "image", e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-[11px] text-white font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.5 Promo Countdown Banner */}
              <div className="bg-neutral-900/90 rounded-xl border border-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSectionId(
                      selectedSectionId === "promo" || selectedSectionId === "promo_banner" ? null : "promo"
                    )
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Promo Countdown Banner</span>
                  </span>
                  {selectedSectionId === "promo" || selectedSectionId === "promo_banner" ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {(selectedSectionId === "promo" || selectedSectionId === "promo_banner") && (
                  <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Text & Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-amber-400 font-bold">
                          <Type className="w-3.5 h-3.5" />
                          <span>Promo Copy & Countdown</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Promo Headline
                          </label>
                          <input
                            type="text"
                            value={promoSection?.title || ""}
                            onChange={(e) => updateSectionField("promo_banner", "title", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                              Button Text
                            </label>
                            <input
                              type="text"
                              value={promoData.buttonText || ""}
                              onChange={(e) => updateSectionData("promo_banner", "buttonText", e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                              Button Link URL
                            </label>
                            <input
                              type="text"
                              value={promoData.buttonLink || ""}
                              onChange={(e) => updateSectionData("promo_banner", "buttonLink", e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Countdown Timer (Hours)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="168"
                            value={promoData.countdownHours || 36}
                            onChange={(e) => updateSectionData("promo_banner", "countdownHours", Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Right: Banner Image */}
                      <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-pink-400 font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Promo Background Banner</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Banner Image URL
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={promoData.bgImage || ""}
                              onChange={(e) => updateSectionData("promo_banner", "bgImage", e.target.value)}
                              className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                triggerFileUpload((url) => updateSectionData("promo_banner", "bgImage", url), "promo-bg")
                              }
                              className="px-3 py-1.5 bg-neutral-800 hover:bg-white hover:text-black text-white text-xs font-mono font-bold rounded flex items-center gap-1 border border-neutral-700 shrink-0"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                            </button>
                          </div>
                          {promoData.bgImage && (
                            <div className="mt-2 w-full h-24 rounded overflow-hidden border border-neutral-800 relative bg-neutral-900">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={promoData.bgImage}
                                alt="Promo preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.6 Brand Story Section */}
              <div className="bg-neutral-900/90 rounded-xl border border-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSectionId(
                      selectedSectionId === "brand" || selectedSectionId === "brand_story" ? null : "brand"
                    )
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Brand Story & Craftsmanship</span>
                  </span>
                  {selectedSectionId === "brand" || selectedSectionId === "brand_story" ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {(selectedSectionId === "brand" || selectedSectionId === "brand_story") && (
                  <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Text & Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-amber-400 font-bold">
                          <Type className="w-3.5 h-3.5" />
                          <span>Brand Story Copy</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Story Badge Label
                          </label>
                          <input
                            type="text"
                            value={brandData.badge || "OUR STORY"}
                            onChange={(e) => updateSectionData("brand_story", "badge", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white uppercase font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Headline Title
                          </label>
                          <input
                            type="text"
                            value={brandSection?.title || ""}
                            onChange={(e) => updateSectionField("brand_story", "title", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Description Paragraph
                          </label>
                          <textarea
                            rows={3}
                            value={brandData.description || brandSection?.subtitle || ""}
                            onChange={(e) => updateSectionData("brand_story", "description", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white resize-none"
                          />
                        </div>

                        {/* Button Link */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                              Button Text
                            </label>
                            <input
                              type="text"
                              value={brandData.buttonText || "LEARN MORE ABOUT US"}
                              onChange={(e) => updateSectionData("brand_story", "buttonText", e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                              Button Link URL
                            </label>
                            <input
                              type="text"
                              value={brandData.buttonLink || "/about"}
                              onChange={(e) => updateSectionData("brand_story", "buttonLink", e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Story Image Upload */}
                      <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-pink-400 font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Brand Story Photograph</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Photograph Image URL
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={brandData.image || ""}
                              onChange={(e) => updateSectionData("brand_story", "image", e.target.value)}
                              className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                triggerFileUpload((url) => updateSectionData("brand_story", "image", url), "brand-img")
                              }
                              className="px-3 py-1.5 bg-neutral-800 hover:bg-white hover:text-black text-white text-xs font-mono font-bold rounded flex items-center gap-1 border border-neutral-700 shrink-0"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                            </button>
                          </div>
                          {brandData.image && (
                            <div className="mt-2 w-full h-36 rounded overflow-hidden border border-neutral-700 bg-neutral-900">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={brandData.image} alt="Brand Story" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.7 Statement Banner */}
              <div className="bg-neutral-900/90 rounded-xl border border-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSectionId(
                      selectedSectionId === "statement" || selectedSectionId === "statement_banner"
                        ? null
                        : "statement"
                    )
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Statement Editorial Banner</span>
                  </span>
                  {selectedSectionId === "statement" || selectedSectionId === "statement_banner" ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {(selectedSectionId === "statement" || selectedSectionId === "statement_banner") && (
                  <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Text & Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-amber-400 font-bold">
                          <Type className="w-3.5 h-3.5" />
                          <span>Statement Copy</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Statement Headline
                          </label>
                          <input
                            type="text"
                            value={statementSection?.title || ""}
                            onChange={(e) => updateSectionField("statement_banner", "title", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={statementSection?.subtitle || ""}
                            onChange={(e) => updateSectionField("statement_banner", "subtitle", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            value={statementData.description || ""}
                            onChange={(e) => updateSectionData("statement_banner", "description", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white resize-none"
                          />
                        </div>
                      </div>

                      {/* Right: Info / Visual Guidance */}
                      <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-800 text-[11px] font-mono uppercase text-purple-400 font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Editorial Styling</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed font-description">
                          The statement banner serves as an architectural breathing space across the storefront. It features high-contrast typography set against rich black tones with custom letter spacing.
                        </p>
                        <div className="p-3 bg-black rounded border border-neutral-800 text-center space-y-1">
                          <span className="text-[9px] font-mono uppercase text-neutral-500 block tracking-widest">
                            {statementSection?.subtitle || "ORIGINAL CLOTHING ARCHIVE // DHAKA"}
                          </span>
                          <span className="text-xs font-black uppercase text-white tracking-tight block">
                            {statementSection?.title || "WE DON'T FOLLOW TRENDS. WE FORGE THE CONSTANTS."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY & MOBILE TEXT SIZE */}
          {activeTab === "typography" && (
            <div className="space-y-5">
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold font-mono uppercase text-white">
                    Shopify Mobile & Desktop Text Sizing
                  </h3>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Switch viewports with the top switcher and use these sliders to fine-tune text sizing specifically for mobile vs desktop screens.
                </p>
              </div>

              {/* Viewport Shortcut buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("mobile")}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    viewMode === "mobile"
                      ? "border-amber-400 bg-amber-950/20 text-white"
                      : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block">Mobile View</span>
                    <span className="text-[10px] font-mono text-neutral-500">Preview at 390px</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("desktop")}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    viewMode === "desktop"
                      ? "border-white bg-neutral-800/60 text-white"
                      : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <div>
                    <span className="text-xs font-bold block">Desktop View</span>
                    <span className="text-[10px] font-mono text-neutral-500">Full 100% Canvas</span>
                  </div>
                </button>
              </div>

              {/* Mobile Heading Size Slider */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mobile Heading Text Size</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {themeConfig.mobileHeadingSize || 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="150"
                  step="5"
                  value={themeConfig.mobileHeadingSize || 100}
                  onChange={(e) => updateTheme("mobileHeadingSize", Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>70% (Compact)</span>
                  <span>100% (Default)</span>
                  <span>150% (Heroic)</span>
                </div>
              </div>

              {/* Desktop Heading Size Slider */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Desktop Heading Text Size</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-white">
                    {themeConfig.desktopHeadingSize || 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="160"
                  step="5"
                  value={themeConfig.desktopHeadingSize || 100}
                  onChange={(e) => updateTheme("desktopHeadingSize", Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>70% (Minimal)</span>
                  <span>100% (Standard)</span>
                  <span>160% (Bold Statement)</span>
                </div>
              </div>

              {/* Body Font Size Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-neutral-300">
                      Mobile Body Size
                    </label>
                    <span className="text-[11px] font-mono text-amber-400">
                      {themeConfig.mobileBodySize || 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="85"
                    max="125"
                    step="5"
                    value={themeConfig.mobileBodySize || 100}
                    onChange={(e) => updateTheme("mobileBodySize", Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-neutral-300">
                      Desktop Body Size
                    </label>
                    <span className="text-[11px] font-mono text-white">
                      {themeConfig.desktopBodySize || 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="85"
                    max="125"
                    step="5"
                    value={themeConfig.desktopBodySize || 100}
                    onChange={(e) => updateTheme("desktopBodySize", Number(e.target.value))}
                    className="w-full accent-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Font Family selector */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-white block">
                  Storefront Typography Family
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Inter (Modern)", val: "Inter" },
                    { label: "Montserrat", val: "Montserrat" },
                    { label: "Open Sans", val: "Open Sans" },
                  ].map((font) => (
                    <button
                      key={font.val}
                      type="button"
                      onClick={() => updateTheme("fontFamily", font.val)}
                      className={`p-2 rounded border text-center text-xs font-mono transition-colors ${
                        themeConfig.fontFamily === font.val
                          ? "bg-white text-black font-bold border-white"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEME & STYLING */}
          {activeTab === "theme" && (
            <div className="space-y-5">
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <h3 className="text-xs font-bold font-mono uppercase text-white mb-1">
                  Brand Color & Design System
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Select core aesthetic tones and button geometries for the store.
                </p>
              </div>

              {/* Accent Color Swatches */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                <label className="text-xs font-bold text-white block">
                  Brand Accent & Highlight Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeConfig.accentColor || "#111111"}
                    onChange={(e) => updateTheme("accentColor", e.target.value)}
                    className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeConfig.accentColor || "#111111"}
                    onChange={(e) => updateTheme("accentColor", e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { name: "Black", hex: "#000000" },
                    { name: "Carbon", hex: "#111111" },
                    { name: "Vintage Maroon", hex: "#631c27" },
                    { name: "Forest Green", hex: "#264a34" },
                    { name: "Cobalt", hex: "#1e3a8a" },
                    { name: "Street Pink", hex: "#db2777" },
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => updateTheme("accentColor", preset.hex)}
                      className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-115 shrink-0"
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Background Tone */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                <label className="text-xs font-bold text-white block">
                  Background Tone Aesthetic
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Pure White", val: "#ffffff" },
                    { label: "Off-White Ecru", val: "#f5f5f2" },
                    { label: "Dark Mode", val: "#111111" },
                  ].map((bg) => (
                    <button
                      key={bg.val}
                      type="button"
                      onClick={() => updateTheme("backgroundColor", bg.val)}
                      className={`p-2.5 rounded border text-center text-xs font-mono transition-colors ${
                        themeConfig.backgroundColor === bg.val
                          ? "bg-white text-black font-bold border-white"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Corner Radius */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                <label className="text-xs font-bold text-white block">
                  Button Corner Shape
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Sharp", val: "none" },
                    { label: "Subtle (2px)", val: "xs" },
                    { label: "Rounded (8px)", val: "md" },
                    { label: "Pill Shape", val: "full" },
                  ].map((radius) => (
                    <button
                      key={radius.val}
                      type="button"
                      onClick={() => updateTheme("buttonRadius", radius.val)}
                      className={`p-2 rounded border text-center text-xs font-mono transition-colors ${
                        themeConfig.buttonRadius === radius.val
                          ? "bg-white text-black font-bold border-white"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                      }`}
                    >
                      {radius.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COLLECTIONS MANAGER */}
          {activeTab === "collections" && (
            <div className="space-y-5">
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <h3 className="text-xs font-bold font-mono uppercase text-white mb-1">
                  Collection Manager
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Create new drop collections or view existing collections live.
                </p>
              </div>

              {/* Add Collection Form */}
              <form onSubmit={handleCreateCollection} className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-white font-mono">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add New Collection</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Collection Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavyweight Essentials Drop"
                    value={newColTitle}
                    onChange={(e) => {
                      setNewColTitle(e.target.value);
                      if (!newColSlug) {
                        setNewColSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                        );
                      }
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. heavyweight-essentials"
                    value={newColSlug}
                    onChange={(e) => setNewColSlug(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Banner Image URL or Upload
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="/images/... or https://..."
                      value={newColImage}
                      onChange={(e) => setNewColImage(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => triggerFileUpload((url) => setNewColImage(url), "col-img")}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-white hover:text-black text-white text-xs font-mono font-bold rounded flex items-center gap-1 border border-neutral-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Collection notes and details..."
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newColFeatured}
                    onChange={(e) => setNewColFeatured(e.target.checked)}
                    className="rounded accent-white"
                  />
                  <span>Mark as Featured Collection</span>
                </label>

                <button
                  type="submit"
                  disabled={isCreatingCol}
                  className="w-full py-2 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-wider text-xs font-mono rounded transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isCreatingCol ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isCreatingCol ? "Creating..." : "Save New Collection"}</span>
                </button>

                {colSuccessMsg && (
                  <p className="text-emerald-400 font-mono text-xs font-bold text-center animate-pulse">
                    {colSuccessMsg}
                  </p>
                )}
              </form>

              {/* Existing Collections List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                  Active Collections ({collections.length})
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {collections.map((col) => (
                    <div
                      key={col._id}
                      className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {col.bannerImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={col.bannerImage}
                            alt={col.title}
                            className="w-10 h-10 rounded object-cover border border-neutral-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center shrink-0">
                            <FolderPlus className="w-4 h-4 text-neutral-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{col.title}</h4>
                          <span className="text-[10px] font-mono text-neutral-400 block truncate">
                            /collections/{col.slug}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`/collections/${col.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                        title="View Collection"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FOOTER & SOCIAL LINKS */}
          {activeTab === "footer" && (
            <div className="space-y-5">
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <h3 className="text-xs font-bold font-mono uppercase text-white mb-1">
                  Footer Links & Social Accounts
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Manage social profile links, footer columns, wordmark, and legal copy.
                </p>
              </div>

              {/* Social Links Section */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-white font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Social Links in Footer</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                      Instagram Profile URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/yourbrand"
                      value={footerConfig.socialLinks?.instagram || ""}
                      onChange={(e) => updateFooterSocial("instagram", e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                      Facebook Page URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/yourbrand"
                      value={footerConfig.socialLinks?.facebook || ""}
                      onChange={(e) => updateFooterSocial("facebook", e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                      TikTok Account URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@yourbrand"
                      value={footerConfig.socialLinks?.tiktok || ""}
                      onChange={(e) => updateFooterSocial("tiktok", e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                      WhatsApp URL or Phone Link
                    </label>
                    <input
                      type="text"
                      placeholder="https://wa.me/8801700000000"
                      value={footerConfig.socialLinks?.whatsapp || ""}
                      onChange={(e) => updateFooterSocial("whatsapp", e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                      X (Twitter) URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://x.com/yourbrand"
                      value={footerConfig.socialLinks?.twitter || ""}
                      onChange={(e) => updateFooterSocial("twitter", e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                      YouTube Channel URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/@yourbrand"
                      value={footerConfig.socialLinks?.youtube || ""}
                      onChange={(e) => updateFooterSocial("youtube", e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Add Custom Footer Link */}
              <form onSubmit={handleAddFooterLink} className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-white font-mono">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Link to Footer Column</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Select Target Column
                  </label>
                  <select
                    value={selectedColId}
                    onChange={(e) => setSelectedColId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                  >
                    {(footerConfig.columns || []).map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title} ({col.links?.length || 0} links)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                      Link Label *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Size Guide"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                      Link URL (Href) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="/size-guide or https://..."
                      value={newLinkHref}
                      onChange={(e) => setNewLinkHref(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newLinkExternal}
                    onChange={(e) => setNewLinkExternal(e.target.checked)}
                    className="rounded accent-white"
                  />
                  <span>Open link in new tab (External)</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2 bg-neutral-800 hover:bg-white hover:text-black text-white font-bold uppercase tracking-wider text-xs font-mono rounded transition-colors flex items-center justify-center gap-1.5 border border-neutral-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link to Footer</span>
                </button>

                {footerLinkSuccess && (
                  <p className="text-emerald-400 font-mono text-xs font-bold text-center">
                    ✓ Link added to footer column!
                  </p>
                )}
              </form>

              {/* Footer Branding Text */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                <span className="text-xs font-bold uppercase text-white font-mono block">
                  Footer Brand Wordmark & Copy
                </span>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Giant Wordmark
                  </label>
                  <input
                    type="text"
                    value={footerConfig.brandWordmark || "DIMENSION"}
                    onChange={(e) => updateFooter({ brandWordmark: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Boxed Mission Statement
                  </label>
                  <textarea
                    rows={2}
                    value={footerConfig.missionStatement || ""}
                    onChange={(e) => updateFooter({ missionStatement: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={footerConfig.copyrightText || ""}
                    onChange={(e) => updateFooter({ copyrightText: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Bottom Sticky Action Bar */}
        <div className="p-4 border-t border-neutral-800 bg-black/95 flex flex-col gap-2 shrink-0">
          {statusMessage && (
            <p className="text-[11px] font-mono text-center text-emerald-400 font-bold truncate">
              {statusMessage}
            </p>
          )}

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={discardChanges}
                className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs uppercase font-bold rounded border border-neutral-700 transition-colors"
              >
                Discard
              </button>
            )}

            <button
              type="button"
              onClick={() => saveAll()}
              disabled={isSaving}
              className={`flex-1 py-2.5 font-mono text-xs uppercase font-bold rounded shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-black hover:bg-neutral-200"
              }`}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4 text-pink-600" />
              )}
              <span>{isSaving ? "Publishing..." : saveSuccess ? "Published Live!" : "Publish Changes"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
