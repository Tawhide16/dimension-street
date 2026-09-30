"use client";

import React, { useState, useEffect } from "react";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Product } from "@/types";
import { Search, X, Tag } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of all products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  const filtered = products.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const popularSearches = ["Heavyweight", "480GSM", "Tech Pants", "Bomber", "Tote", "Cargo"];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        {/* Search Input Bar */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-2">
            ARCHIVE DISCOVERY
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mb-6">
            SEARCH THE VAULT
          </h1>

          <div className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by garment name, SKU (e.g. DIM-001), or fabric..."
              className="w-full pl-12 pr-10 py-4 text-sm font-mono border-2 border-black rounded-xs focus:outline-none placeholder:text-neutral-400 shadow-md"
            />
            <Search className="w-5 h-5 text-neutral-500 absolute left-4 top-4.5" />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-4.5 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick search tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Popular:
            </span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-[11px] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200 text-xs font-mono">
          <span className="text-neutral-500">
            {query.trim()
              ? `Found ${filtered.length} results for "${query}"`
              : `All Vault Products (${filtered.length})`}
          </span>
        </div>

        {/* Product Results Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 border border-neutral-200 rounded">
            <p className="text-xs font-mono uppercase text-neutral-500">
              No products found matching &ldquo;{query}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
