"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Save,
  Check,
  RefreshCw,
  Eye,
  Sparkles,
  Link2,
  FileText,
  Mail,
  Type,
  LayoutGrid,
} from "lucide-react";
import { IFooterConfig, IFooterColumn, IFooterLink, initialFooterConfig } from "@/types/footer";

const QUICK_PRESET_LINKS = [
  { label: "Shop All", href: "/shop" },
  { label: "T-shirts", href: "/shop?category=tees" },
  { label: "Hoodies", href: "/shop?category=hoodies" },
  { label: "Sweaters", href: "/shop?category=sweaters" },
  { label: "Accessories", href: "/shop?category=accessories" },
  { label: "About Us", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faq" },
  { label: "Track My Order", href: "/shipping" },
  { label: "Returns / Exchanges", href: "/returns" },
  { label: "My Account", href: "/account" },
];

export default function AdminFooterPage() {
  const [config, setConfig] = useState<IFooterConfig>(initialFooterConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Column title modal/state
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);

  // Active adding link to column id
  const [addingLinkColId, setAddingLinkColId] = useState<string | null>(null);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");
  const [newLinkIsExternal, setNewLinkIsExternal] = useState(false);

  // Fetch footer configuration
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/cms/footer", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.config) {
            setConfig(data.config);
          }
        }
      } catch (e) {
        console.error("Failed to load footer config:", e);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Save changes
  const handleSave = async (override?: IFooterConfig) => {
    setSaving(true);
    setErrorMsg(null);
    const toSave = override || config;
    try {
      const res = await fetch("/api/cms/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setErrorMsg(data.error || "Failed to save footer configuration.");
      }
    } catch {
      setErrorMsg("Network error saving footer configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Add new column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newCol: IFooterColumn = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim().toUpperCase(),
      links: [],
    };
    const updated = {
      ...config,
      columns: [...config.columns, newCol],
    };
    setConfig(updated);
    setNewColumnTitle("");
    setShowAddColumn(false);
  };

  // Delete column
  const handleDeleteColumn = (colId: string) => {
    if (!confirm("Are you sure you want to delete this column and its menu links?")) return;
    const updated = {
      ...config,
      columns: config.columns.filter((c) => c.id !== colId),
    };
    setConfig(updated);
  };

  // Update column title
  const handleUpdateColumnTitle = (colId: string, newTitle: string) => {
    const updated = {
      ...config,
      columns: config.columns.map((c) =>
        c.id === colId ? { ...c, title: newTitle } : c
      ),
    };
    setConfig(updated);
  };

  // Move column left/right
  const handleMoveColumn = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= config.columns.length) return;
    const newCols = [...config.columns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIdx];
    newCols[targetIdx] = temp;
    setConfig({ ...config, columns: newCols });
  };

  // Add link to a specific column
  const handleAddLink = (colId: string) => {
    if (!newLinkLabel.trim() || !newLinkHref.trim()) return;
    const newLink: IFooterLink = {
      id: `link-${Date.now()}`,
      label: newLinkLabel.trim(),
      href: newLinkHref.trim(),
      isExternal: newLinkIsExternal,
    };
    const updated = {
      ...config,
      columns: config.columns.map((c) =>
        c.id === colId ? { ...c, links: [...c.links, newLink] } : c
      ),
    };
    setConfig(updated);
    setNewLinkLabel("");
    setNewLinkHref("");
    setNewLinkIsExternal(false);
    setAddingLinkColId(null);
  };

  // Delete link from column
  const handleDeleteLink = (colId: string, linkId: string) => {
    const updated = {
      ...config,
      columns: config.columns.map((c) =>
        c.id === colId ? { ...c, links: c.links.filter((l) => l.id !== linkId) } : c
      ),
    };
    setConfig(updated);
  };

  // Move link up/down within column
  const handleMoveLink = (colId: string, linkIdx: number, direction: "up" | "down") => {
    const col = config.columns.find((c) => c.id === colId);
    if (!col) return;
    const targetIdx = direction === "up" ? linkIdx - 1 : linkIdx + 1;
    if (targetIdx < 0 || targetIdx >= col.links.length) return;

    const newLinks = [...col.links];
    const temp = newLinks[linkIdx];
    newLinks[linkIdx] = newLinks[targetIdx];
    newLinks[targetIdx] = temp;

    const updated = {
      ...config,
      columns: config.columns.map((c) =>
        c.id === colId ? { ...c, links: newLinks } : c
      ),
    };
    setConfig(updated);
  };

  // Update specific link
  const handleUpdateLink = (
    colId: string,
    linkId: string,
    field: "label" | "href" | "isExternal",
    val: any
  ) => {
    const updated = {
      ...config,
      columns: config.columns.map((c) => {
        if (c.id !== colId) return c;
        return {
          ...c,
          links: c.links.map((l) => (l.id === linkId ? { ...l, [field]: val } : l)),
        };
      }),
    };
    setConfig(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-neutral-500 font-mono text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          <span>Loading footer configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="space-y-8 w-full pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-600" />
              <span>Footer Content & Menus Customizer</span>
            </h1>
            <span className="text-[10px] font-mono font-bold bg-amber-600 text-white px-2 py-0.5 rounded uppercase">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Edit all link columns, custom titles, menu URLs, newsletter prompts, wordmark, and legal statement.
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
            <span>Storefront Preview ↗</span>
          </a>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Save className="w-4 h-4 text-emerald-400" />
            )}
            <span>{saving ? "Publishing..." : "Publish Footer Changes"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono rounded-lg flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">
              ✓ Footer menu configuration successfully saved and updated across live website!
            </span>
          </div>
          <Link href="/" target="_blank" className="underline font-bold hover:text-black">
            View Live Footer ↗
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 text-xs font-mono rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* SECTION 1: FOOTER MENU COLUMNS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-bold uppercase text-neutral-900 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-amber-600" />
              <span>Footer Menu Columns ({config.columns.length})</span>
            </h2>
            <p className="text-xs text-neutral-500 font-mono">
              Manage each column title and its list of navigation links.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddColumn(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Column</span>
          </button>
        </div>

        {/* Add Column Modal / Form */}
        {showAddColumn && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in">
            <span className="text-xs font-mono font-bold uppercase text-amber-900 block">
              Create New Footer Column
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="e.g. POLICIES, SOCIALS, HELP"
                className="flex-1 px-3 py-2 text-xs font-mono border border-amber-300 rounded bg-white uppercase focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={handleAddColumn}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase rounded cursor-pointer"
              >
                Add Column
              </button>
              <button
                type="button"
                onClick={() => setShowAddColumn(false)}
                className="px-3 py-2 text-xs font-mono text-neutral-600 hover:bg-neutral-200 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.columns.map((col, colIdx) => (
            <div
              key={col.id}
              className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-4 flex flex-col justify-between"
            >
              {/* Column Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <button
                      type="button"
                      disabled={colIdx === 0}
                      onClick={() => handleMoveColumn(colIdx, "left")}
                      title="Move Column Left"
                      className="p-1 hover:text-black disabled:opacity-30 disabled:pointer-events-none rounded"
                    >
                      ←
                    </button>
                    <span className="text-[10px] font-mono font-bold text-neutral-400">
                      #{colIdx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={colIdx === config.columns.length - 1}
                      onClick={() => handleMoveColumn(colIdx, "right")}
                      title="Move Column Right"
                      className="p-1 hover:text-black disabled:opacity-30 disabled:pointer-events-none rounded"
                    >
                      →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteColumn(col.id)}
                    title="Delete entire column"
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Title Input */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                    Column Title
                  </label>
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => handleUpdateColumnTitle(col.id, e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs font-bold font-mono uppercase border border-neutral-200 rounded bg-neutral-50 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                {/* Links List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Menu Links ({col.links.length})
                  </span>

                  {col.links.length === 0 ? (
                    <div className="p-3 bg-neutral-50 border border-dashed border-neutral-200 rounded text-center text-[11px] font-mono text-neutral-400">
                      No links in this column yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {col.links.map((link, linkIdx) => (
                        <div
                          key={link.id}
                          className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2 group hover:border-neutral-300 transition-all"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) =>
                                handleUpdateLink(col.id, link.id, "label", e.target.value)
                              }
                              placeholder="Label"
                              className="w-1/2 px-2 py-1 text-xs font-medium border border-neutral-200 rounded bg-white focus:border-black focus:outline-none"
                            />
                            <input
                              type="text"
                              value={link.href}
                              onChange={(e) =>
                                handleUpdateLink(col.id, link.id, "href", e.target.value)
                              }
                              placeholder="URL (e.g. /shop)"
                              className="w-1/2 px-2 py-1 text-[11px] font-mono border border-neutral-200 rounded bg-white focus:border-black focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(link.isExternal)}
                                onChange={(e) =>
                                  handleUpdateLink(col.id, link.id, "isExternal", e.target.checked)
                                }
                                className="rounded"
                              />
                              <span>External Link (New Tab)</span>
                            </label>

                            <div className="flex items-center gap-1 text-neutral-400">
                              <button
                                type="button"
                                disabled={linkIdx === 0}
                                onClick={() => handleMoveLink(col.id, linkIdx, "up")}
                                title="Move Up"
                                className="p-0.5 hover:text-black disabled:opacity-20"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={linkIdx === col.links.length - 1}
                                onClick={() => handleMoveLink(col.id, linkIdx, "down")}
                                title="Move Down"
                                className="p-0.5 hover:text-black disabled:opacity-20"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLink(col.id, link.id)}
                                title="Delete Link"
                                className="p-0.5 hover:text-red-600 transition-colors ml-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Link Form in Column */}
              <div className="pt-3 border-t border-neutral-100">
                {addingLinkColId === col.id ? (
                  <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-lg space-y-2.5 animate-in fade-in">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-700 block">
                      Add Link to {col.title}
                    </span>

                    {/* Presets dropdown */}
                    <div>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const found = QUICK_PRESET_LINKS.find((p) => p.href === val);
                          if (found) {
                            setNewLinkLabel(found.label);
                            setNewLinkHref(found.href);
                          }
                        }}
                        className="w-full px-2 py-1 text-[11px] font-mono border border-neutral-300 rounded bg-white"
                        defaultValue=""
                      >
                        <option value="">⚡ Or select preset link...</option>
                        {QUICK_PRESET_LINKS.map((preset) => (
                          <option key={preset.href} value={preset.href}>
                            {preset.label} ({preset.href})
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="Link Label (e.g. Hoodies)"
                      className="w-full px-2.5 py-1 text-xs border border-neutral-300 rounded bg-white focus:border-black focus:outline-none"
                    />

                    <input
                      type="text"
                      value={newLinkHref}
                      onChange={(e) => setNewLinkHref(e.target.value)}
                      placeholder="Target Link (e.g. /shop?category=hoodies)"
                      className="w-full px-2.5 py-1 text-xs font-mono border border-neutral-300 rounded bg-white focus:border-black focus:outline-none"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-600">
                        <input
                          type="checkbox"
                          checked={newLinkIsExternal}
                          onChange={(e) => setNewLinkIsExternal(e.target.checked)}
                          className="rounded"
                        />
                        <span>External Link</span>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAddLink(col.id)}
                          className="px-3 py-1 bg-black text-white text-[11px] font-mono font-bold uppercase rounded cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingLinkColId(null);
                            setNewLinkLabel("");
                            setNewLinkHref("");
                          }}
                          className="px-2 py-1 text-[11px] font-mono text-neutral-500 hover:text-black"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingLinkColId(col.id);
                      setNewLinkLabel("");
                      setNewLinkHref("");
                      setNewLinkIsExternal(false);
                    }}
                    className="w-full py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono font-bold uppercase rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>Add Link</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: NEWSLETTER & SUBSCRIBER SETTINGS */}
      <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-5">
        <div className="pb-3 border-b border-neutral-100">
          <h2 className="text-base font-bold uppercase text-neutral-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-600" />
            <span>Newsletter Prompt (Column 6 on Right)</span>
          </h2>
          <p className="text-xs text-neutral-500 font-mono">
            Configure the headline, button label, and disclaimer for footer newsletter signups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700">
              Newsletter Headline Title
            </label>
            <input
              type="text"
              value={config.newsletterTitle || ""}
              onChange={(e) => setConfig({ ...config, newsletterTitle: e.target.value })}
              placeholder="e.g. JOIN THE COMMUNITY FOR EXCLUSIVE WELLNESS INSIGHTS"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-sans focus:border-black focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700">
              Button Label
            </label>
            <input
              type="text"
              value={config.newsletterButtonText || ""}
              onChange={(e) => setConfig({ ...config, newsletterButtonText: e.target.value })}
              placeholder="e.g. JOIN NOW"
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-neutral-300 rounded focus:border-black focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700">
              Subtitle / Disclaimer Note
            </label>
            <input
              type="text"
              value={config.newsletterSubtitle || ""}
              onChange={(e) => setConfig({ ...config, newsletterSubtitle: e.target.value })}
              placeholder="e.g. *By joining, you'll receive our wellness insights and can unsubscribe anytime."
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: BRAND WORDMARK & MISSION STATEMENT */}
      <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-5">
        <div className="pb-3 border-b border-neutral-100">
          <h2 className="text-base font-bold uppercase text-neutral-900 flex items-center gap-2">
            <Type className="w-4 h-4 text-amber-600" />
            <span>Footer Brand Wordmark & Legal Statement</span>
          </h2>
          <p className="text-xs text-neutral-500 font-mono">
            Customize the giant stylized brand logo wordmark, mission statement, and bottom copyright line.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700">
              Giant Stylized Brand Wordmark
            </label>
            <input
              type="text"
              value={config.brandWordmark || ""}
              onChange={(e) => setConfig({ ...config, brandWordmark: e.target.value.toUpperCase() })}
              placeholder="e.g. DIMENSION"
              className="w-full px-3 py-2 text-sm font-black font-mono uppercase tracking-wider border border-neutral-300 rounded focus:border-black focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700">
              Boxed Brand Mission Statement
            </label>
            <textarea
              rows={3}
              value={config.missionStatement || ""}
              onChange={(e) => setConfig({ ...config, missionStatement: e.target.value })}
              placeholder="e.g. Premium everyday clothing in heavyweight natural fabrics..."
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded resize-none focus:border-black focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700">
              Bottom Copyright Notice
            </label>
            <input
              type="text"
              value={config.copyrightText || ""}
              onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
              placeholder="e.g. © 2026 DIMENSION® — fictional label for a conversion-focused ecommerce concept"
              className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Floating Bottom Sticky Save Bar */}
      <div className="sticky bottom-6 z-20 bg-neutral-900 text-white rounded-xl p-4 shadow-xl border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Footer changes will update the live website immediately upon publishing.</span>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave()}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Check className="w-3.5 h-3.5 text-white" />
          )}
          <span>{saving ? "Publishing..." : "Save & Publish Changes"}</span>
        </button>
      </div>
    </div>
  );
}
