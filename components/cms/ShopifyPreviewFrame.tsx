"use client";

import React from "react";
import { useLiveCms } from "./LiveCmsContext";
import { Monitor, Smartphone, Tablet, ExternalLink, X, MoveHorizontal, Check, RefreshCw } from "lucide-react";

interface ShopifyPreviewFrameProps {
  children: React.ReactNode;
}

export default function ShopifyPreviewFrame({ children }: ShopifyPreviewFrameProps) {
  const {
    isAdmin,
    isEditorOpen,
    viewMode,
    setViewMode,
    drawerPosition,
    setDrawerPosition,
    themeConfig,
    updateTheme,
    hasChanges,
    isSaving,
    saveSuccess,
    saveAll,
    toggleEditor,
  } = useLiveCms();

  if (!isAdmin || !isEditorOpen) {
    return <>{children}</>;
  }

  // Margin spacing depending on whether drawer is docked left or right
  const drawerWidthClass = drawerPosition === "left" ? "xl:pl-[860px] lg:pl-[720px]" : "xl:pr-[860px] lg:pr-[720px]";

  return (
    <div className={`min-h-screen bg-neutral-900/95 transition-all duration-300 ${drawerWidthClass}`}>
      {/* Top Floating Control Bar (Shopify Editor Style) */}
      <div className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-white text-xs select-none shadow-md">
        {/* Left: Section / Page indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-neutral-300">
              Live Storefront Editor
            </span>
          </div>

          <span className="hidden sm:inline text-neutral-600">|</span>

          {/* Quick docking toggle */}
          <button
            type="button"
            onClick={() => setDrawerPosition(drawerPosition === "left" ? "right" : "left")}
            className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800 transition-colors"
            title={`Dock sidebar on the ${drawerPosition === "left" ? "right" : "left"}`}
          >
            <MoveHorizontal className="w-3 h-3" />
            <span>Dock {drawerPosition === "left" ? "Right" : "Left"}</span>
          </button>
        </div>

        {/* Center: Shopify Device Switcher & Quick Text Scale */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                viewMode === "desktop"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Desktop View (100% width)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("tablet")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                viewMode === "tablet"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                viewMode === "mobile"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Quick Mobile Text Size badge */}
          {viewMode === "mobile" && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-neutral-900 rounded-lg border border-neutral-800 text-[11px] font-mono">
              <span className="text-neutral-400">Mobile Heading:</span>
              <span className="text-amber-400 font-bold">{themeConfig.mobileHeadingSize || 100}%</span>
              <input
                type="range"
                min="75"
                max="140"
                step="5"
                value={themeConfig.mobileHeadingSize || 100}
                onChange={(e) => updateTheme("mobileHeadingSize", Number(e.target.value))}
                className="w-16 h-1 accent-white cursor-pointer"
                title="Adjust Mobile Heading Text Size"
              />
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 bg-amber-950/60 rounded border border-amber-800/60 animate-pulse">
              Unsaved
            </span>
          )}

          <button
            type="button"
            onClick={() => saveAll()}
            disabled={isSaving}
            className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded flex items-center gap-1 transition-all ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : null}
            <span>{isSaving ? "Saving..." : saveSuccess ? "Published!" : "Publish"}</span>
          </button>

          <button
            type="button"
            onClick={toggleEditor}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Exit Live Editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Preview Canvas */}
      <div className="w-full flex justify-center p-0 sm:py-6 overflow-x-hidden">
        {viewMode === "mobile" ? (
          <div className="w-full max-w-[420px] transition-all duration-300">
            {/* Realistic Mobile Device Frame */}
            <div className="mx-auto w-[390px] min-h-[844px] bg-white rounded-[44px] shadow-2xl border-[10px] border-neutral-800 overflow-hidden relative flex flex-col">
              {/* iPhone Dynamic Island / Speaker notch */}
              <div className="h-7 bg-neutral-900 w-full flex items-center justify-center shrink-0 select-none">
                <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neutral-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
                </div>
              </div>

              {/* Scrollable Mobile Viewport */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white max-h-[calc(100vh-140px)] select-text">
                {children}
              </div>

              {/* Home indicator bar */}
              <div className="h-4 bg-neutral-900 w-full flex items-center justify-center shrink-0">
                <div className="w-28 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <p className="text-center text-[10px] font-mono text-neutral-500 mt-2">
              Simulating iPhone Viewport (390 × 844 px)
            </p>
          </div>
        ) : viewMode === "tablet" ? (
          <div className="w-full max-w-[800px] transition-all duration-300">
            {/* Tablet Frame */}
            <div className="mx-auto w-[768px] min-h-[1024px] bg-white rounded-3xl shadow-2xl border-[10px] border-neutral-800 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white max-h-[calc(100vh-140px)]">
                {children}
              </div>
            </div>
            <p className="text-center text-[10px] font-mono text-neutral-500 mt-2">
              Simulating Tablet Viewport (768 × 1024 px)
            </p>
          </div>
        ) : (
          <div className="w-full bg-white shadow-xl transition-all duration-300">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

