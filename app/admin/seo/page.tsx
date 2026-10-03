"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Search,
  Check,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Smartphone,
  Monitor,
  Share2,
  Sliders,
  RefreshCw,
  Info,
  ShieldCheck,
  Layers,
} from "lucide-react";
import Image from "next/image";

interface SeoFormState {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: "summary" | "summary_large_image";
  twitterHandle: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleSiteVerification: string;
  focusKeywords: string;
}

const defaultSeo: SeoFormState = {
  siteTitle: "DIMENSION STREET — Premium Heavyweight Streetwear",
  titleTemplate: "%s | DIMENSION STREET",
  metaDescription:
    "Architectural silhouettes crafted from custom milled 320–480 GSM organic cotton knits. Designed in Dhaka, worn worldwide.",
  keywords:
    "Dimension Street, streetwear, heavyweight hoodie, oversized tee, tactical pants, Dhaka streetwear, 320 GSM, bangladesh streetwear",
  canonicalUrl: "https://dimensionstreet.com",
  ogTitle: "DIMENSION STREET — Heavyweight Essentials",
  ogDescription: "Premium architectural streetwear designed for every dimension.",
  ogImage:
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterHandle: "@dimensionstreet",
  robotsIndex: true,
  robotsFollow: true,
  googleSiteVerification: "",
  focusKeywords: "streetwear, heavyweight hoodie, dhaka, dimension street",
};

export default function AdminSEOPage() {
  const [formData, setFormData] = useState<SeoFormState>(defaultSeo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "social" | "indexing">("general");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [socialPlatform, setSocialPlatform] = useState<"facebook" | "twitter">("facebook");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load configuration on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/seo");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.config) {
            setFormData((prev) => ({
              ...prev,
              ...data.config,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load SEO config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showToast("SEO & OpenGraph Configuration saved and published!");
      } else {
        alert(data.error || "Failed to save configuration");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error while saving SEO configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, ogImage: data.url }));
        showToast("OpenGraph social image uploaded successfully!");
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Real-time SEO Score calculation
  const calculateScore = () => {
    let score = 0;
    const checks = {
      titleLength: false,
      descLength: false,
      hasKeywords: false,
      focusMatch: false,
      hasImage: false,
      isIndexable: false,
    };

    // Title length (optimal 40 - 60 chars)
    if (formData.siteTitle.length >= 35 && formData.siteTitle.length <= 65) {
      score += 25;
      checks.titleLength = true;
    } else if (formData.siteTitle.length > 0) {
      score += 10;
    }

    // Meta description length (optimal 110 - 160 chars)
    if (formData.metaDescription.length >= 90 && formData.metaDescription.length <= 165) {
      score += 25;
      checks.descLength = true;
    } else if (formData.metaDescription.length > 0) {
      score += 10;
    }

    // Focus keyword in title or description
    const focusTerms = (formData.focusKeywords || "")
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const fullText = `${formData.siteTitle} ${formData.metaDescription}`.toLowerCase();
    const hasMatch = focusTerms.some((term) => fullText.includes(term));
    if (hasMatch) {
      score += 20;
      checks.focusMatch = true;
    }

    // Has image
    if (formData.ogImage && formData.ogImage.trim().length > 5) {
      score += 15;
      checks.hasImage = true;
    }

    // Indexable
    if (formData.robotsIndex && formData.robotsFollow) {
      score += 15;
      checks.isIndexable = true;
    }

    return { score: Math.min(100, score), checks };
  };

  const { score, checks } = calculateScore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-neutral-500 font-mono text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-black" />
          <span>Loading SEO Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="space-y-8 font-sans w-full pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-white rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
                SEO & OpenGraph Command Center
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Optimize search rankings, crawler directives, Google SERP snippets, and social card previews
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-300"
          >
            <span>Sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-300"
          >
            <span>Robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 disabled:opacity-60 rounded-lg transition-all shadow-sm active:scale-95"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Banner: SEO Health Score & Audit Meter */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl p-6 shadow-xl border border-neutral-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full text-2xs font-mono uppercase tracking-wider text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Search Optimization Audit</span>
            </div>
            <h2 className="text-xl font-bold">SEO Health Score: {score}/100</h2>
            <p className="text-xs text-neutral-400 max-w-xl">
              {score >= 80
                ? "Excellent! Your meta titles, description lengths, social cards, and crawl policies are fully optimized for search engines."
                : score >= 60
                ? "Good baseline. Fine-tune your title length or add matching focus keywords to boost page rankings."
                : "Action required. Complete your meta descriptions and upload an OpenGraph social image to improve click-through rates."}
            </p>

            {/* Score Bar */}
            <div className="w-full max-w-md bg-neutral-800 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  score >= 80
                    ? "bg-emerald-500"
                    : score >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Quick Audit Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-medium">
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                checks.titleLength
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-neutral-800/60 border-neutral-700 text-neutral-400"
              }`}
            >
              {checks.titleLength ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Title (35-65c)</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                checks.descLength
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-neutral-800/60 border-neutral-700 text-neutral-400"
              }`}
            >
              {checks.descLength ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Desc (90-165c)</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                checks.focusMatch
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-neutral-800/60 border-neutral-700 text-neutral-400"
              }`}
            >
              {checks.focusMatch ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
              <span>Keyword Match</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                checks.hasImage
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-neutral-800/60 border-neutral-700 text-neutral-400"
              }`}
            >
              {checks.hasImage ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Social Banner</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                checks.isIndexable
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-neutral-800/60 border-neutral-700 text-neutral-400"
              }`}
            >
              {checks.isIndexable ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>Indexing ON</span>
            </div>

            <div className="p-2.5 rounded-xl border bg-neutral-800/60 border-neutral-700 text-neutral-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>SSL / HTTPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Real-Time Previews Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === "general"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Search Engine Meta
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("social")}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === "social"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Social & OpenGraph
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("indexing")}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === "indexing"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Robots & Crawlers
            </button>
          </div>

          {/* Tab 1: General Search Meta */}
          {activeTab === "general" && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Primary Meta Title
                  </label>
                  <span
                    className={`text-2xs font-mono font-semibold ${
                      formData.siteTitle.length >= 35 && formData.siteTitle.length <= 65
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {formData.siteTitle.length} / 60 characters
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                  placeholder="e.g. DIMENSION STREET — Premium Heavyweight Streetwear"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                />
                <p className="text-2xs text-neutral-500 mt-1">
                  Keep between 40–60 characters so Google does not truncate your brand headline in search results.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Meta Description
                  </label>
                  <span
                    className={`text-2xs font-mono font-semibold ${
                      formData.metaDescription.length >= 90 && formData.metaDescription.length <= 165
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {formData.metaDescription.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="e.g. Architectural silhouettes crafted from custom milled 320–480 GSM organic cotton knits. Designed in Dhaka, worn worldwide."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all resize-none"
                />
                <p className="text-2xs text-neutral-500 mt-1">
                  Compelling copy that appears below your title in Google search. Aim for 120–160 characters.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  Focus Keywords (For Score Audit)
                </label>
                <input
                  type="text"
                  value={formData.focusKeywords}
                  onChange={(e) => setFormData({ ...formData, focusKeywords: e.target.value })}
                  placeholder="e.g. streetwear, heavyweight hoodie, dhaka"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                />
                <p className="text-2xs text-neutral-500 mt-1">
                  Comma-separated primary terms to verify matching presence in your title and description.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  All Target Keywords (Meta Tag)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g. streetwear, hoodie, 320 GSM, oversized tee, fashion dhaka"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  Canonical Base URL
                </label>
                <input
                  type="url"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  placeholder="https://dimensionstreet.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all font-mono"
                />
                <p className="text-2xs text-neutral-500 mt-1">
                  Prevents duplicate content penalties by declaring the authoritative URL.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Social & OpenGraph */}
          {activeTab === "social" && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  OpenGraph Social Title
                </label>
                <input
                  type="text"
                  value={formData.ogTitle}
                  onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                  placeholder="e.g. DIMENSION STREET — Heavyweight Essentials"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                />
                <p className="text-2xs text-neutral-500 mt-1">
                  Headline displayed when shared on WhatsApp, Facebook, iMessage, and LinkedIn.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  OpenGraph Social Description
                </label>
                <textarea
                  rows={2}
                  value={formData.ogDescription}
                  onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                  placeholder="e.g. Premium architectural streetwear designed for every dimension."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all resize-none"
                />
              </div>

              {/* OpenGraph Image Upload & Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  Social Share Banner Image (1200 x 630 recommended)
                </label>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.ogImage}
                      onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                      placeholder="https://example.com/social-banner.jpg or /uploads/..."
                      className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all font-mono"
                    />

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </button>
                  </div>

                  {formData.ogImage && (
                    <div className="relative w-full h-40 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                      <Image
                        src={formData.ogImage}
                        alt="OpenGraph Banner Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white rounded text-2xs font-mono backdrop-blur-xs">
                        Active Banner (1.91:1)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Twitter Card Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    Twitter / X Card Format
                  </label>
                  <select
                    value={formData.twitterCard}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        twitterCard: e.target.value as "summary" | "summary_large_image",
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  >
                    <option value="summary_large_image">Large Image Card (Recommended)</option>
                    <option value="summary">Small Thumbnail Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={formData.twitterHandle}
                    onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                    placeholder="@dimensionstreet"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Crawling & Indexing */}
          {activeTab === "indexing" && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">Search Engine Indexing (Robots)</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Allow Google, Bing, and other bots to discover and index your storefront.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.robotsIndex}
                      onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">Follow External & Internal Links</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tell web crawlers to pass PageRank authority through links on your site.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.robotsFollow}
                      onChange={(e) => setFormData({ ...formData, robotsFollow: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  Google Search Console Verification Tag
                </label>
                <input
                  type="text"
                  value={formData.googleSiteVerification}
                  onChange={(e) => setFormData({ ...formData, googleSiteVerification: e.target.value })}
                  placeholder="e.g. google-site-verification=abc123xyz..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all font-mono"
                />
                <p className="text-2xs text-neutral-500 mt-1">
                  Allows instant domain ownership verification with Google Search Console.
                </p>
              </div>

              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-600" />
                  <span>Automated Next.js XML Sitemap & Robots Integration</span>
                </div>
                <p className="text-sky-800">
                  Your XML sitemap is dynamically generated at <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-2xs">/sitemap.xml</code> including all published catalog products, and <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-2xs">/robots.txt</code> updates instantaneously whenever you change indexing settings.
                </p>
              </div>
            </div>
          )}

          {/* Quick Preset Action */}
          <div className="flex items-center justify-between p-4 bg-neutral-100/70 rounded-xl border border-neutral-200 text-xs">
            <span className="text-neutral-600 font-medium">
              Want to reset to premium streetwear defaults?
            </span>
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset SEO settings to recommended defaults?")) {
                  setFormData(defaultSeo);
                }
              }}
              className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 font-bold rounded-lg border border-neutral-300 transition-colors"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Google SERP Preview */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-neutral-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Google Search Snippet Preview
                </h3>
              </div>
              <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewDevice === "desktop"
                      ? "bg-white text-neutral-900 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewDevice === "mobile"
                      ? "bg-white text-neutral-900 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Google Result Box */}
            <div
              className={`p-4 bg-neutral-50/60 rounded-xl border border-neutral-200/60 font-sans transition-all ${
                previewDevice === "mobile" ? "max-w-[340px] mx-auto" : "w-full"
              }`}
            >
              {/* Favicon & Breadcrumb */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold">
                  D
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] leading-tight font-medium text-[#202124]">
                    DIMENSION STREET
                  </span>
                  <span className="text-[10px] leading-tight text-[#5f6368] font-mono truncate max-w-[240px]">
                    {formData.canonicalUrl || "https://dimensionstreet.com"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-[16px] leading-snug font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-2">
                {formData.siteTitle || "DIMENSION STREET — Heavyweight Streetwear"}
              </h4>

              {/* Description */}
              <p className="text-[13px] leading-relaxed text-[#4d5156] mt-1.5 line-clamp-3">
                {formData.metaDescription ||
                  "Architectural silhouettes crafted from custom milled 320–480 GSM organic cotton knits."}
              </p>
            </div>
            <p className="text-2xs text-neutral-400 text-center">
              Simulated SERP display based on standard 600px desktop / 360px mobile Google crawl specs.
            </p>
          </div>

          {/* Card 2: Social Media Share Card Preview */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-neutral-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Social Share Card Preview
                </h3>
              </div>
              <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setSocialPlatform("facebook")}
                  className={`px-2 py-1 rounded-md text-2xs font-bold uppercase tracking-wider transition-colors ${
                    socialPlatform === "facebook"
                      ? "bg-white text-neutral-900 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Facebook / LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform("twitter")}
                  className={`px-2 py-1 rounded-md text-2xs font-bold uppercase tracking-wider transition-colors ${
                    socialPlatform === "twitter"
                      ? "bg-white text-neutral-900 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  X / Twitter
                </button>
              </div>
            </div>

            {/* Social Card Simulation */}
            <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-xs">
              {/* Image banner */}
              <div className="relative w-full aspect-[1.91/1] bg-neutral-200 overflow-hidden">
                {formData.ogImage ? (
                  <Image
                    src={formData.ogImage}
                    alt="Social preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1.5">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-2xs font-medium">No Social Image Provided</span>
                  </div>
                )}
              </div>

              {/* Text metadata */}
              <div className="p-3 bg-white space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono block">
                  {new URL(formData.canonicalUrl || "https://dimensionstreet.com").hostname}
                </span>
                <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                  {formData.ogTitle || formData.siteTitle}
                </h4>
                <p className="text-[11px] text-neutral-500 line-clamp-2">
                  {formData.ogDescription || formData.metaDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-2xs text-neutral-500 font-mono pt-1">
              <span>Card format: {formData.twitterCard}</span>
              <span>Handle: {formData.twitterHandle}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
