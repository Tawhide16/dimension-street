"use client";

import React, { useState, useMemo } from "react";
import { Product, Category, CollectionItem } from "@/types";
import ProductCard from "./ProductCard";
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  Layers,
  ArrowUpDown,
} from "lucide-react";

interface ShopCatalogViewProps {
  initialProducts: Product[];
  categories: Category[];
  collections: CollectionItem[];
  initialCategory?: string;
  initialCollection?: string;
}

export default function ShopCatalogView({
  initialProducts,
  categories,
  collections,
  initialCategory,
  initialCollection,
}: ShopCatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceMax, setPriceMax] = useState<number>(25000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract all unique sizes & colors
  const allSizes = ["S", "M", "L", "XL", "One Size"];
  const allColors = ["Black", "Chalk", "Olive", "Carbon", "Sand", "Indigo"];

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Collection filter
    if (selectedCollection !== "all") {
      list = list.filter((p) => p.collectionName?.toLowerCase() === selectedCollection.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Size filter
    if (selectedSize !== "all") {
      list = list.filter((p) => p.variants.some((v) => v.size === selectedSize && v.stock > 0));
    }

    // Color filter
    if (selectedColor !== "all") {
      list = list.filter((p) =>
        p.variants.some((v) => v.color.toLowerCase().includes(selectedColor.toLowerCase()))
      );
    }

    // Price range
    list = list.filter((p) => p.price <= priceMax);

    // Stock
    if (onlyInStock) {
      list = list.filter((p) => p.totalStock > 0);
    }

    // Sort
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "best-selling") {
      list.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    }

    return list;
  }, [
    initialProducts,
    selectedCategory,
    selectedCollection,
    searchQuery,
    selectedSize,
    selectedColor,
    priceMax,
    onlyInStock,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedCollection("all");
    setSearchQuery("");
    setSelectedSize("all");
    setSelectedColor("all");
    setPriceMax(25000);
    setOnlyInStock(false);
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedCollection !== "all" ||
    searchQuery !== "" ||
    selectedSize !== "all" ||
    selectedColor !== "all" ||
    priceMax < 25000 ||
    onlyInStock;

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 md:py-12">
      {/* Top Banner & Header */}
      <div className="border-b border-neutral-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400">
            CATALOG // ARCHIVE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-1">
            {selectedCategory !== "all"
              ? `${selectedCategory} COLLECTION`
              : selectedCollection !== "all"
              ? `${selectedCollection} DROP`
              : "ALL STREETWEAR PIECES"}
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Showing {filteredProducts.length} of {initialProducts.length} total garments
          </p>
        </div>

        {/* Sort & Mobile Filter Buttons */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-mono font-bold uppercase rounded-xs flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && "•"}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 border border-neutral-300 rounded-xs px-3 py-2 bg-white">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-mono font-bold uppercase bg-transparent text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Drop</option>
              <option value="newest">Newest Additions</option>
              <option value="best-selling">Best Selling</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS (col-span-3) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 pr-4 border-r border-neutral-200">
          {/* Search Bar */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 block mb-1.5">
              Search Garments
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, SKU, tag..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-300 rounded-xs font-mono focus:outline-none focus:border-black"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2.5 text-neutral-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Category
            </h3>
            <div className="space-y-1 text-xs font-mono">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left py-1 px-2 rounded-xs flex justify-between ${
                  selectedCategory === "all"
                    ? "bg-black text-white font-bold"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span>All Categories</span>
                <span>{initialProducts.length}</span>
              </button>
              {categories.map((cat) => {
                const count = initialProducts.filter((p) => p.category === cat.slug).length;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left py-1 px-2 rounded-xs flex justify-between ${
                      selectedCategory === cat.slug
                        ? "bg-black text-white font-bold"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collection Filter */}
          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Capsule Collection
            </h3>
            <div className="space-y-1 text-xs font-mono">
              <button
                onClick={() => setSelectedCollection("all")}
                className={`w-full text-left py-1 px-2 rounded-xs ${
                  selectedCollection === "all"
                    ? "bg-black text-white font-bold"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                All Collections
              </button>
              {collections.map((col) => (
                <button
                  key={col.slug}
                  onClick={() => setSelectedCollection(col.slug)}
                  className={`w-full text-left py-1 px-2 rounded-xs ${
                    selectedCollection === col.slug
                      ? "bg-black text-white font-bold"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {col.title}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Size
            </h3>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
              <button
                onClick={() => setSelectedSize("all")}
                className={`py-1.5 border rounded-xs ${
                  selectedSize === "all"
                    ? "bg-black text-white border-black font-bold"
                    : "border-neutral-300 text-neutral-700 hover:border-black"
                }`}
              >
                All
              </button>
              {allSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-1.5 border rounded-xs ${
                    selectedSize === sz
                      ? "bg-black text-white border-black font-bold"
                      : "border-neutral-300 text-neutral-700 hover:border-black"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Color Tone
            </h3>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => setSelectedColor("all")}
                className={`px-2.5 py-1 border rounded-xs ${
                  selectedColor === "all"
                    ? "bg-black text-white border-black font-bold"
                    : "border-neutral-300 text-neutral-700 hover:border-black"
                }`}
              >
                All
              </button>
              {allColors.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`px-2.5 py-1 border rounded-xs ${
                    selectedColor === col
                      ? "bg-black text-white border-black font-bold"
                      : "border-neutral-300 text-neutral-700 hover:border-black"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="font-bold uppercase text-neutral-900">Max Price</span>
              <span className="font-bold text-black">৳{priceMax.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={200}
              max={25000}
              step={200}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Stock Toggle */}
          <div className="pt-4 border-t border-neutral-200">
            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="accent-black w-4 h-4 rounded"
              />
              <span className="font-semibold text-neutral-800">In-Stock Only</span>
            </label>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-mono font-bold uppercase rounded-xs transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* PRODUCTS GRID (col-span-9) */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 border border-neutral-200 rounded-xs">
              <h3 className="text-base font-bold font-mono uppercase text-neutral-800">
                No matching garments found
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6 font-mono">
                Try loosening your filters or searching for alternative streetwear keywords.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <span className="font-black font-mono uppercase tracking-widest text-sm">
                  Filters
                </span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase mb-2">Category</h4>
                <div className="space-y-1 text-xs font-mono">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left py-1.5 px-2 rounded ${
                      selectedCategory === "all" ? "bg-black text-white font-bold" : "text-neutral-700"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left py-1.5 px-2 rounded ${
                        selectedCategory === c.slug ? "bg-black text-white font-bold" : "text-neutral-700"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply / Reset Button */}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
                <button
                  onClick={resetFilters}
                  className="w-full py-2.5 bg-neutral-100 text-neutral-700 text-xs font-mono font-bold uppercase tracking-wider"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
