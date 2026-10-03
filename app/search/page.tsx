"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Product } from "@/types";
import {
  Search,
  X,
  Tag,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Flame,
  Clock,
  LayoutGrid,
  List,
  Filter,
  Package,
  DollarSign,
  Layers,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

const TRENDING_SEARCHES = [
  "Heavyweight",
  "480GSM",
  "Tech Pants",
  "Bomber",
  "Oversized",
  "Cargos",
  "Loopback",
  "Beanie",
];

const PRICE_TIERS = [
  { label: "All Prices", value: "all" },
  { label: "Under $50", value: "under-50", max: 50 },
  { label: "$50 – $100", value: "50-100", min: 50, max: 100 },
  { label: "$100 – $150", value: "100-150", min: 100, max: 150 },
  { label: "$150 & Above", value: "150-plus", min: 150 },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Smart Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("relevance");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyBestSellers, setOnlyBestSellers] = useState<boolean>(false);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsBoxRef = useRef<HTMLDivElement>(null);

  // Load products & recent searches from localStorage
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));

    try {
      const saved = localStorage.getItem("ds_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 6));
      }
    } catch {}
  }, []);

  // Save to recent searches when query changes
  const saveSearchTerm = (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        6
      );
      try {
        localStorage.setItem("ds_recent_searches", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("ds_recent_searches");
    } catch {}
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsBoxRef.current &&
        !suggestionsBoxRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract all categories with count
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const cat = p.category.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Extract unique sizes
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        if (v.size) sizeSet.add(v.size);
      });
    });
    return Array.from(sizeSet);
  }, [products]);

  // Instant Suggestions (Predictive results for typing)
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice(0, 5);
  }, [products, query]);

  // Smart Multi-Token & Attribute Filter
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Text Query (Smart Multi-token matching)
    if (query.trim()) {
      const tokens = query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      list = list.filter((p) => {
        const searchableText = `${p.name} ${p.sku} ${p.category} ${p.description} ${(
          p.tags || []
        ).join(" ")} ${(p.variants || []).map((v) => `${v.color} ${v.size}`).join(" ")}`.toLowerCase();

        // Every token must appear somewhere in the product
        return tokens.every((tok) => searchableText.includes(tok));
      });
    }

    // 2. Category Filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Price Tier
    if (selectedPriceTier !== "all") {
      const tier = PRICE_TIERS.find((t) => t.value === selectedPriceTier);
      if (tier) {
        if (tier.min !== undefined && tier.max !== undefined) {
          list = list.filter((p) => p.price >= tier.min! && p.price <= tier.max!);
        } else if (tier.max !== undefined) {
          list = list.filter((p) => p.price <= tier.max);
        } else if (tier.min !== undefined) {
          list = list.filter((p) => p.price >= tier.min);
        }
      }
    }

    // 4. Stock Filter
    if (onlyInStock) {
      list = list.filter((p) => p.totalStock > 0);
    }

    // 5. Badges Filter
    if (onlyBestSellers) {
      list = list.filter((p) => Boolean(p.bestSeller));
    }
    if (onlyNewArrivals) {
      list = list.filter((p) => Boolean(p.newArrival));
    }

    // 6. Size Filter
    if (selectedSize !== "all") {
      list = list.filter((p) =>
        (p.variants || []).some((v) => v.size === selectedSize && v.stock > 0)
      );
    }

    // 7. Sorting
    if (selectedSort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "newest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (selectedSort === "best-selling") {
      list.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    }

    return list;
  }, [
    products,
    query,
    selectedCategory,
    selectedPriceTier,
    selectedSort,
    onlyInStock,
    onlyBestSellers,
    onlyNewArrivals,
    selectedSize,
  ]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedPriceTier !== "all" ||
    onlyInStock ||
    onlyBestSellers ||
    onlyNewArrivals ||
    selectedSize !== "all" ||
    selectedSort !== "relevance" ||
    query.trim().length > 0;

  const resetAllFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedPriceTier("all");
    setSelectedSort("relevance");
    setOnlyInStock(false);
    setOnlyBestSellers(false);
    setOnlyNewArrivals(false);
    setSelectedSize("all");
  };

  const handleSelectSearch = (term: string) => {
    setQuery(term);
    saveSearchTerm(term);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 md:py-12">
        {/* Search Header Banner */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full text-2xs font-mono tracking-widest uppercase text-neutral-600 mb-3 border border-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Smart Catalog Discovery Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mb-5 font-sans">
            Search The Vault
          </h1>

          {/* Search Input Box with Predictive Dropdown */}
          <div className="relative text-left">
            <div className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveSearchTerm(query);
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search by garment, fabric (e.g. 480GSM), SKU, or style..."
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 text-sm font-mono border-2 border-neutral-900 rounded-xl focus:outline-none placeholder:text-neutral-500 font-medium shadow-md bg-white text-neutral-900 transition-all focus:ring-2 focus:ring-black/10"
              />
              <Search className="w-5 h-5 text-neutral-600 absolute left-4 pointer-events-none" />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-4 text-neutral-400 hover:text-black p-1 transition-colors"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Predictive Auto-Complete Suggestions Box */}
            {showSuggestions && (query.trim() || recentSearches.length > 0) && (
              <div
                ref={suggestionsBoxRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 overflow-hidden divide-y divide-neutral-100 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Instant Product Matches */}
                {suggestions.length > 0 && (
                  <div className="p-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block px-2 mb-2 font-bold">
                      Matched Garments
                    </span>
                    <div className="space-y-1">
                      {suggestions.map((item) => (
                        <Link
                          key={item._id}
                          href={`/product/${item.slug}`}
                          onClick={() => {
                            saveSearchTerm(item.name);
                            setShowSuggestions(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                        >
                          <div className="relative w-9 h-11 bg-neutral-100 rounded overflow-hidden shrink-0 border border-neutral-200">
                            <Image
                              src={item.images?.[0] || item.variants?.[0]?.image || ""}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-neutral-900 block truncate group-hover:underline">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500">
                              {item.category} • {formatPrice(item.price)}
                            </span>
                          </div>
                          <span className="text-2xs font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 uppercase">
                            View ↗
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-3 bg-neutral-50/50">
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>Recent Searches</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[10px] font-mono text-neutral-400 hover:text-black hover:underline"
                      >
                        Clear History
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => handleSelectSearch(term)}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-md text-xs font-mono transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trending Streetwear Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Trending:
            </span>
            {TRENDING_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleSelectSearch(term)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  query.toLowerCase() === term.toLowerCase()
                    ? "bg-black text-white"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200"
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* SMART FILTER TOOLBAR */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 mb-8 space-y-4 shadow-xs">
          {/* Top Row: Category Pills + Quick Chips */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
              <span className="text-neutral-400 mr-1 flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold shrink-0">
                <Layers className="w-3.5 h-3.5" /> Category:
              </span>
              {["all", "hoodies", "t-shirts", "pants", "jackets", "accessories"].map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-black text-white shadow-xs"
                        : "bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-200"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* View Mode & Sort Dropdowns */}
            <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono text-neutral-800 font-bold appearance-none focus:outline-none focus:border-black cursor-pointer shadow-2xs"
                >
                  <option value="relevance">Sort: Best Match</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Releases</option>
                  <option value="best-selling">Best Sellers First</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Grid / List Mode */}
              <div className="flex bg-white rounded-lg border border-neutral-200 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-black"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("compact")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "compact"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:text-black"
                  }`}
                  title="Detailed List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Quick Smart Filter Chips & Price Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200/80 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider mr-1">
                Filter By:
              </span>

              {/* Price Tier Dropdown */}
              <select
                value={selectedPriceTier}
                onChange={(e) => setSelectedPriceTier(e.target.value)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                  selectedPriceTier !== "all"
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                }`}
              >
                {PRICE_TIERS.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>

              {/* In-Stock Toggle */}
              <button
                type="button"
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  onlyInStock
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                }`}
              >
                <Package className="w-3 h-3" />
                <span>In Stock Only</span>
              </button>

              {/* Best Sellers Toggle */}
              <button
                type="button"
                onClick={() => setOnlyBestSellers(!onlyBestSellers)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  onlyBestSellers
                    ? "bg-purple-700 text-white border-purple-700 shadow-2xs"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Best Sellers</span>
              </button>

              {/* New Arrivals Toggle */}
              <button
                type="button"
                onClick={() => setOnlyNewArrivals(!onlyNewArrivals)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  onlyNewArrivals
                    ? "bg-pink-600 text-white border-pink-600 shadow-2xs"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>New Drops</span>
              </button>

              {/* Size Filter Dropdown */}
              {availableSizes.length > 0 && (
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                    selectedSize !== "all"
                      ? "bg-black text-white border-black"
                      : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                  }`}
                >
                  <option value="all">Size: All</option>
                  {availableSizes.map((sz) => (
                    <option key={sz} value={sz}>
                      Size: {sz}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-3 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-2xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Piece" : "Pieces"} Found
            </span>
            {query.trim() && (
              <span className="text-neutral-500">
                matching &ldquo;<span className="text-black font-semibold">{query}</span>&rdquo;
              </span>
            )}
          </div>

          <span className="text-neutral-400 text-2xs">
            Showing filtered archive results
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center text-xs font-mono text-neutral-400">
            Scanning vault database...
          </div>
        )}

        {/* Empty State with Smart Recommendations */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-neutral-50 border border-neutral-200 rounded-2xl p-8 max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-200 mx-auto flex items-center justify-center text-neutral-500">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 font-mono">
              No Direct Matches Found
            </h3>
            <p className="text-xs text-neutral-500 font-sans max-w-sm mx-auto">
              We couldn&apos;t find any garments matching your active search and filters. Try clearing
              your filters or exploring our core heavyweight drops.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!loading && filteredProducts.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Detailed Compact List View */}
        {!loading && filteredProducts.length > 0 && viewMode === "compact" && (
          <div className="space-y-3">
            {filteredProducts.map((p) => (
              <Link
                key={p._id}
                href={`/product/${p.slug}`}
                className="flex items-center justify-between p-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-black rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-16 h-20 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                    <Image
                      src={p.images?.[0] || p.variants?.[0]?.image || ""}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-mono uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-medium">
                        {p.category}
                      </span>
                      {p.bestSeller && (
                        <span className="text-2xs font-mono uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                          Best Seller
                        </span>
                      )}
                      {p.newArrival && (
                        <span className="text-2xs font-mono uppercase bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-bold">
                          New
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 truncate group-hover:underline">
                      {p.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono truncate max-w-md hidden sm:block">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 pl-4">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-neutral-900 block">
                      {formatPrice(p.price)}
                    </span>
                    {p.compareAtPrice && p.compareAtPrice > p.price && (
                      <span className="text-2xs font-mono text-neutral-400 line-through block">
                        {formatPrice(p.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 bg-black text-white rounded-lg group-hover:bg-neutral-800 transition-colors">
                    View
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
