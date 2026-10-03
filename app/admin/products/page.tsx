"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Search,
  Eye,
  Check,
  CheckSquare,
  Square,
  Sliders,
  DollarSign,
  Package,
  Folder,
  Tag,
  Sparkles,
  RefreshCw,
  AlertCircle,
  X,
  Edit3,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [badgeFilter, setBadgeFilter] = useState<"all" | "featured" | "new" | "bestseller">("all");
  const [sortFilter, setSortFilter] = useState<"default" | "price-high" | "price-low" | "stock-high" | "stock-low" | "name-az">("default");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk Edit Modals state
  const [activeBulkModal, setActiveBulkModal] = useState<
    "price" | "stock" | "category" | "badges" | null
  >(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Bulk edit form states
  const [bulkPriceType, setBulkPriceType] = useState<"fixed" | "percent">("percent");
  const [bulkPriceValue, setBulkPriceValue] = useState<number>(10);
  const [bulkComparePrice, setBulkComparePrice] = useState<string>("");

  const [bulkStockType, setBulkStockType] = useState<"set" | "adjust">("adjust");
  const [bulkStockValue, setBulkStockValue] = useState<number>(10);

  const [bulkCategoryValue, setBulkCategoryValue] = useState("hoodies");

  const [bulkBadgeAction, setBulkBadgeAction] = useState<{
    newArrival?: boolean;
    bestSeller?: boolean;
    featured?: boolean;
  }>({ newArrival: true });

  // Inline Fast Edit Mode state
  const [inlineEditMode, setInlineEditMode] = useState(false);
  const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({});
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    slug: "",
    category: "hoodies",
    collectionName: "dimension-core",
    price: 110,
    compareAtPrice: 130,
    costPrice: 45,
    sku: "DIM-HOODIE-001",
    description: "Architectural heavyweight silhouette milled from 480 GSM organic cotton knit.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
    totalStock: 50,
    featured: true,
    newArrival: true,
  });

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products using Smart Multi-Token & Attribute Matching
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      // 1. Search matching across tokens
      if (search.trim()) {
        const tokens = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const searchable = `${p.name} ${p.sku} ${p.category} ${p.description || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
        const matchesAllTokens = tokens.every((tok) => searchable.includes(tok));
        if (!matchesAllTokens) return false;
      }

      // 2. Category matching
      if (categoryFilter !== "all" && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // 3. Stock Status filter
      if (stockFilter === "in-stock" && p.totalStock <= 0) return false;
      if (stockFilter === "low-stock" && (p.totalStock <= 0 || p.totalStock > 10)) return false;
      if (stockFilter === "out-of-stock" && p.totalStock > 0) return false;

      // 4. Badge filter
      if (badgeFilter === "featured" && !p.featured) return false;
      if (badgeFilter === "new" && !p.newArrival) return false;
      if (badgeFilter === "bestseller" && !p.bestSeller) return false;

      return true;
    });

    // 5. Sorting
    if (sortFilter === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortFilter === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortFilter === "stock-high") {
      list.sort((a, b) => b.totalStock - a.totalStock);
    } else if (sortFilter === "stock-low") {
      list.sort((a, b) => a.totalStock - b.totalStock);
    } else if (sortFilter === "name-az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, search, categoryFilter, stockFilter, badgeFilter, sortFilter]);

  // Selection helpers
  const isAllSelected =
    filtered.length > 0 && filtered.every((p) => selectedIds.has(p._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      filtered.forEach((p) => next.add(p._id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Bulk update handler
  const handleBulkUpdate = async (updates: Record<string, any>) => {
    if (selectedIds.size === 0) return;
    setIsProcessingBulk(true);
    try {
      const res = await fetch("/api/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          updates,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkSuccessMsg(data.message || "Bulk update applied successfully!");
        setActiveBulkModal(null);
        setSelectedIds(new Set());
        await loadProducts();
        setTimeout(() => setBulkSuccessMsg(null), 4000);
      } else {
        alert(data.error || "Failed to execute bulk update.");
      }
    } catch {
      alert("Network error executing bulk update.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Bulk delete handler
  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (data.success) {
        const idSet = new Set(Array.from(selectedIds));
        setProducts((prev) => prev.filter((p) => !idSet.has(String(p._id)) && !idSet.has(p.slug)));
        setBulkSuccessMsg(`Deleted ${data.deletedCount} products successfully.`);
        setShowBulkDeleteModal(false);
        setSelectedIds(new Set());
        setTimeout(() => setBulkSuccessMsg(null), 4000);
      } else {
        alert(data.error || "Failed to delete products.");
      }
    } catch {
      alert("Network error deleting products.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Single product delete
  const confirmSingleDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete._id;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.filter((p) => String(p._id) !== String(id) && p.slug !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setBulkSuccessMsg(`"${productToDelete.name}" deleted successfully.`);
        setProductToDelete(null);
        setTimeout(() => setBulkSuccessMsg(null), 3500);
      } else {
        alert(data?.error || "Failed to delete product.");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      alert("Network error while deleting product.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Single product creation
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProd,
          images: [newProd.image],
          slug: newProd.slug || newProd.name.toLowerCase().replace(/\s+/g, "-"),
          variants: [
            { sku: `${newProd.sku}-M`, color: "Pitch Black", size: "M", price: newProd.price, stock: Math.round(newProd.totalStock / 2) },
            { sku: `${newProd.sku}-L`, color: "Pitch Black", size: "L", price: newProd.price, stock: Math.round(newProd.totalStock / 2) },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts([data.product, ...products]);
        setShowAddModal(false);
        setNewProd({
          name: "",
          slug: "",
          category: "hoodies",
          collectionName: "dimension-core",
          price: 110,
          compareAtPrice: 130,
          costPrice: 45,
          sku: `DIM-HOOD-${Date.now().toString().slice(-3)}`,
          description: "Architectural heavyweight silhouette milled from 480 GSM organic cotton knit.",
          image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
          totalStock: 50,
          featured: true,
          newArrival: true,
        });
      }
    } catch {
      alert("Error adding product");
    }
  };

  // Inline edit handlers
  const handleInlineChange = (id: string, field: keyof Product, value: any) => {
    setEditedProducts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveAllInline = async () => {
    const idsToUpdate = Object.keys(editedProducts);
    if (idsToUpdate.length === 0) {
      setInlineEditMode(false);
      return;
    }

    setIsSavingInline(true);
    try {
      for (const id of idsToUpdate) {
        const updates = editedProducts[id];
        await fetch(`/api/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      }
      setBulkSuccessMsg(`Saved inline changes for ${idsToUpdate.length} product(s)!`);
      setEditedProducts({});
      setInlineEditMode(false);
      await loadProducts();
      setTimeout(() => setBulkSuccessMsg(null), 4000);
    } catch {
      alert("Error saving inline edits.");
    } finally {
      setIsSavingInline(false);
    }
  };

  return (
    <div className="w-full space-y-6 font-mono pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
              Product Catalog & Bulk Manager
            </h1>
            <span className="text-[10px] bg-black text-white font-mono font-bold px-2 py-0.5 rounded">
              {products.length} STYLES
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-sans mt-0.5">
            Select items to edit prices, adjust stock quantities, assign categories, and update badges in bulk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Inline Edit Mode */}
          <button
            type="button"
            onClick={() => {
              if (inlineEditMode) {
                handleSaveAllInline();
              } else {
                setInlineEditMode(true);
              }
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
              inlineEditMode
                ? "bg-amber-500 border-amber-600 text-white shadow-xs"
                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-300"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>
              {inlineEditMode
                ? isSavingInline
                  ? "Saving..."
                  : "Save Inline Edits"
                : "Inline Fast Edit Mode"}
            </span>
          </button>

          {/* Add New Product Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-pink-400" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {bulkSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono rounded-xl flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">{bulkSuccessMsg}</span>
          </div>
          <button onClick={() => setBulkSuccessMsg(null)} className="text-neutral-400 hover:text-black">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Smart Search, Filter & Bulk Selection Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 space-y-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, SKU, fabric, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-7 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-sans bg-neutral-50/50 placeholder:text-neutral-500"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono focus:border-black focus:outline-none bg-neutral-50 text-neutral-800 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="hoodies">Hoodies</option>
              <option value="t-shirts">T-Shirts</option>
              <option value="pants">Pants & Bottoms</option>
              <option value="jackets">Jackets & Outerwear</option>
              <option value="accessories">Accessories</option>
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono focus:border-black focus:outline-none bg-neutral-50 text-neutral-800 cursor-pointer"
            >
              <option value="all">Stock: All</option>
              <option value="in-stock">In Stock (&gt;0)</option>
              <option value="low-stock">Low Stock (≤10)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>

            {/* Badges Filter */}
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value as any)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono focus:border-black focus:outline-none bg-neutral-50 text-neutral-800 cursor-pointer"
            >
              <option value="all">Badges: All</option>
              <option value="featured">Featured On Home</option>
              <option value="new">New Arrivals</option>
              <option value="bestseller">Best Sellers</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value as any)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono focus:border-black focus:outline-none bg-neutral-50 text-neutral-800 cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="name-az">Name: A to Z</option>
            </select>

            {/* Select All Checkbox Button */}
            <button
              type="button"
              onClick={toggleSelectAll}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedIds.size > 0
                  ? "bg-black text-white border-black"
                  : "bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-100"
              }`}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-pink-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {isAllSelected
                  ? "Deselect All"
                  : selectedIds.size > 0
                  ? `Selected (${selectedIds.size})`
                  : "Select All"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono shrink-0">
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong>
            </span>
            <span>•</span>
            <span>
              In Stock:{" "}
              <strong className="text-emerald-600 font-bold">
                {products.filter((p) => p.totalStock > 0).length}
              </strong>
            </span>
          </div>
        </div>

        {/* Quick Smart Filter Chips Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-neutral-400 text-2xs uppercase tracking-wider font-bold mr-1">
              Quick Filters:
            </span>

            <button
              type="button"
              onClick={() => setStockFilter(stockFilter === "low-stock" ? "all" : "low-stock")}
              className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-colors cursor-pointer ${
                stockFilter === "low-stock"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              ⚡ Low Stock Alert ({products.filter((p) => p.totalStock > 0 && p.totalStock <= 10).length})
            </button>

            <button
              type="button"
              onClick={() => setStockFilter(stockFilter === "out-of-stock" ? "all" : "out-of-stock")}
              className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-colors cursor-pointer ${
                stockFilter === "out-of-stock"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              📦 Out of Stock ({products.filter((p) => p.totalStock === 0).length})
            </button>

            <button
              type="button"
              onClick={() => setBadgeFilter(badgeFilter === "bestseller" ? "all" : "bestseller")}
              className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-colors cursor-pointer ${
                badgeFilter === "bestseller"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
              }`}
            >
              🔥 Best Sellers ({products.filter((p) => Boolean(p.bestSeller)).length})
            </button>

            <button
              type="button"
              onClick={() => setBadgeFilter(badgeFilter === "featured" ? "all" : "featured")}
              className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-colors cursor-pointer ${
                badgeFilter === "featured"
                  ? "bg-pink-600 text-white"
                  : "bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200"
              }`}
            >
              ✨ Homepage Featured ({products.filter((p) => Boolean(p.featured)).length})
            </button>
          </div>

          {(search || categoryFilter !== "all" || stockFilter !== "all" || badgeFilter !== "all" || sortFilter !== "default") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStockFilter("all");
                setBadgeFilter("all");
                setSortFilter("default");
              }}
              className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-md text-2xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ml-auto"
            >
              <X className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Table with Selection Checkboxes */}
      <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-black cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-400" />
                    <span>Loading products inventory...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isSelected = selectedIds.has(prod._id);
                  const edited = editedProducts[prod._id] || {};
                  const currentPrice = edited.price !== undefined ? edited.price : prod.price;
                  const currentCompare =
                    edited.compareAtPrice !== undefined ? edited.compareAtPrice : prod.compareAtPrice;
                  const currentStock =
                    edited.totalStock !== undefined ? edited.totalStock : prod.totalStock;
                  const currentCategory =
                    edited.category !== undefined ? edited.category : prod.category;

                  return (
                    <tr
                      key={prod._id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-pink-50/50"
                          : "hover:bg-neutral-50/70"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(prod._id)}
                          className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-black cursor-pointer"
                        />
                      </td>

                      {/* Garment Image & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0 border border-neutral-200">
                            <Image
                              src={prod.images[0] || "/placeholder.jpg"}
                              alt={prod.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            {inlineEditMode ? (
                              <input
                                type="text"
                                value={edited.name !== undefined ? edited.name : prod.name}
                                onChange={(e) =>
                                  handleInlineChange(prod._id, "name", e.target.value)
                                }
                                className="w-full px-2 py-1 text-xs border border-neutral-300 rounded font-sans font-bold"
                              />
                            ) : (
                              <span className="font-bold text-neutral-900 block truncate max-w-xs font-sans">
                                {prod.name}
                              </span>
                            )}
                            <span className="text-[10px] text-neutral-400 block font-mono">
                              {prod.variants.length} variant options
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-bold text-neutral-700 font-mono">
                        {prod.sku}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 uppercase text-neutral-600 font-mono">
                        {inlineEditMode ? (
                          <select
                            value={currentCategory}
                            onChange={(e) =>
                              handleInlineChange(prod._id, "category", e.target.value)
                            }
                            className="px-2 py-1 text-xs border border-neutral-300 rounded font-mono bg-white"
                          >
                            <option value="hoodies">hoodies</option>
                            <option value="t-shirts">t-shirts</option>
                            <option value="bottoms">bottoms</option>
                            <option value="outerwear">outerwear</option>
                            <option value="accessories">accessories</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 bg-neutral-100 rounded text-[11px] font-bold text-neutral-700">
                            {prod.category}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        {inlineEditMode ? (
                          <div className="space-y-1">
                            <input
                              type="number"
                              value={currentPrice}
                              onChange={(e) =>
                                handleInlineChange(prod._id, "price", parseFloat(e.target.value) || 0)
                              }
                              className="w-20 px-2 py-0.5 text-xs border border-neutral-300 rounded font-bold"
                            />
                            <input
                              type="number"
                              placeholder="Compare"
                              value={currentCompare || ""}
                              onChange={(e) =>
                                handleInlineChange(
                                  prod._id,
                                  "compareAtPrice",
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                              className="w-20 px-2 py-0.5 text-[10px] border border-neutral-200 rounded text-neutral-500"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-black">{formatPrice(prod.price)}</div>
                            {prod.compareAtPrice && (
                              <div className="text-[10px] text-neutral-400 line-through">
                                {formatPrice(prod.compareAtPrice)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-4">
                        {inlineEditMode ? (
                          <input
                            type="number"
                            value={currentStock}
                            onChange={(e) =>
                              handleInlineChange(prod._id, "totalStock", parseInt(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-0.5 text-xs border border-neutral-300 rounded font-bold"
                          />
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                              prod.totalStock > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                prod.totalStock > 0 ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />
                            {prod.totalStock > 0 ? `${prod.totalStock} in stock` : "Sold Out"}
                          </span>
                        )}
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {prod.newArrival && (
                            <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-bold">
                              NEW
                            </span>
                          )}
                          {prod.bestSeller && (
                            <span className="text-[9px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-bold">
                              BEST
                            </span>
                          )}
                          {prod.featured && (
                            <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-bold">
                              FEATURED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/product/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-black transition-colors"
                            title="View on storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Sticky Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-40 bg-neutral-900 text-white p-3.5 sm:px-6 rounded-2xl border border-neutral-700 shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-bottom-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-pink-600 text-white font-mono font-bold text-xs flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold font-sans">
              Garments selected for bulk batch action
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Bulk Price */}
            <button
              type="button"
              onClick={() => setActiveBulkModal("price")}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bulk Price</span>
            </button>

            {/* 2. Bulk Stock */}
            <button
              type="button"
              onClick={() => setActiveBulkModal("stock")}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Bulk Stock</span>
            </button>

            {/* 3. Bulk Category */}
            <button
              type="button"
              onClick={() => setActiveBulkModal("category")}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
            >
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>Category</span>
            </button>

            {/* 4. Bulk Badges */}
            <button
              type="button"
              onClick={() => setActiveBulkModal("badges")}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-pink-400" />
              <span>Badges</span>
            </button>

            {/* 5. Bulk Delete */}
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.size})</span>
            </button>

            {/* Deselect All */}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-neutral-400 hover:text-white cursor-pointer ml-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Bulk Price Editor */}
      {activeBulkModal === "price" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold uppercase text-neutral-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Bulk Adjust Price ({selectedIds.size} items)</span>
              </h3>
              <button onClick={() => setActiveBulkModal(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkPriceType("percent")}
                  className={`p-2.5 rounded-lg border text-center font-bold transition-colors ${
                    bulkPriceType === "percent"
                      ? "bg-black text-white border-black"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkPriceType("fixed")}
                  className={`p-2.5 rounded-lg border text-center font-bold transition-colors ${
                    bulkPriceType === "fixed"
                      ? "bg-black text-white border-black"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200"
                  }`}
                >
                  Set Fixed Price ($)
                </button>
              </div>

              {bulkPriceType === "percent" ? (
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Percent Adjustment (e.g. 10 for +10%, -15 for -15% discount):
                  </label>
                  <input
                    type="number"
                    value={bulkPriceValue}
                    onChange={(e) => setBulkPriceValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded font-mono text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Set Fixed Price ($ USD):
                  </label>
                  <input
                    type="number"
                    value={bulkPriceValue}
                    onChange={(e) => setBulkPriceValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded font-mono text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Optional Compare-At Price ($ USD or leave empty):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={bulkComparePrice}
                  onChange={(e) => setBulkComparePrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setActiveBulkModal(null)}
                className="px-4 py-2 border rounded text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingBulk}
                onClick={() => {
                  const updates: Record<string, any> = {};
                  if (bulkPriceType === "percent") {
                    updates.pricePercentAdjust = bulkPriceValue;
                  } else {
                    updates.price = bulkPriceValue;
                  }
                  if (bulkComparePrice) {
                    updates.compareAtPrice = parseFloat(bulkComparePrice);
                  }
                  handleBulkUpdate(updates);
                }}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded text-xs font-bold uppercase disabled:opacity-50"
              >
                {isProcessingBulk ? "Applying..." : "Apply Price Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Stock Editor */}
      {activeBulkModal === "stock" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold uppercase text-neutral-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Bulk Adjust Inventory Stock ({selectedIds.size} items)</span>
              </h3>
              <button onClick={() => setActiveBulkModal(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkStockType("adjust")}
                  className={`p-2.5 rounded-lg border text-center font-bold transition-colors ${
                    bulkStockType === "adjust"
                      ? "bg-black text-white border-black"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200"
                  }`}
                >
                  Add / Subtract (+/-)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkStockType("set")}
                  className={`p-2.5 rounded-lg border text-center font-bold transition-colors ${
                    bulkStockType === "set"
                      ? "bg-black text-white border-black"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200"
                  }`}
                >
                  Set Fixed Total Stock
                </button>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {bulkStockType === "adjust"
                    ? "Units to Add/Subtract (e.g. +20 to restock, -5):"
                    : "Set Exact Total Inventory Units:"}
                </label>
                <input
                  type="number"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setActiveBulkModal(null)}
                className="px-4 py-2 border rounded text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingBulk}
                onClick={() => {
                  const updates: Record<string, any> = {};
                  if (bulkStockType === "adjust") {
                    updates.stockAdjust = bulkStockValue;
                  } else {
                    updates.totalStock = bulkStockValue;
                  }
                  handleBulkUpdate(updates);
                }}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded text-xs font-bold uppercase disabled:opacity-50"
              >
                {isProcessingBulk ? "Applying..." : "Apply Stock Updates"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Bulk Category Editor */}
      {activeBulkModal === "category" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold uppercase text-neutral-900 flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-500" />
                <span>Move to Category ({selectedIds.size} items)</span>
              </h3>
              <button onClick={() => setActiveBulkModal(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-neutral-700">
                Select Destination Category:
              </label>
              <select
                value={bulkCategoryValue}
                onChange={(e) => setBulkCategoryValue(e.target.value)}
                className="w-full px-3 py-2 border rounded font-mono text-xs bg-neutral-50"
              >
                <option value="hoodies">hoodies</option>
                <option value="t-shirts">t-shirts</option>
                <option value="bottoms">bottoms</option>
                <option value="outerwear">outerwear</option>
                <option value="accessories">accessories</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setActiveBulkModal(null)}
                className="px-4 py-2 border rounded text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingBulk}
                onClick={() => handleBulkUpdate({ category: bulkCategoryValue })}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded text-xs font-bold uppercase disabled:opacity-50"
              >
                {isProcessingBulk ? "Applying..." : "Assign Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Bulk Badges Editor */}
      {activeBulkModal === "badges" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold uppercase text-neutral-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-pink-500" />
                <span>Bulk Badges & Flags ({selectedIds.size} items)</span>
              </h3>
              <button onClick={() => setActiveBulkModal(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border cursor-pointer">
                <span className="font-bold text-neutral-800">New Arrival Badge</span>
                <input
                  type="checkbox"
                  checked={Boolean(bulkBadgeAction.newArrival)}
                  onChange={(e) =>
                    setBulkBadgeAction((prev) => ({ ...prev, newArrival: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-black"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border cursor-pointer">
                <span className="font-bold text-neutral-800">Best Seller Badge</span>
                <input
                  type="checkbox"
                  checked={Boolean(bulkBadgeAction.bestSeller)}
                  onChange={(e) =>
                    setBulkBadgeAction((prev) => ({ ...prev, bestSeller: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-black"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border cursor-pointer">
                <span className="font-bold text-neutral-800">Featured On Homepage</span>
                <input
                  type="checkbox"
                  checked={Boolean(bulkBadgeAction.featured)}
                  onChange={(e) =>
                    setBulkBadgeAction((prev) => ({ ...prev, featured: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-black"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setActiveBulkModal(null)}
                className="px-4 py-2 border rounded text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingBulk}
                onClick={() => handleBulkUpdate(bulkBadgeAction)}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded text-xs font-bold uppercase disabled:opacity-50"
              >
                {isProcessingBulk ? "Applying..." : "Apply Badges"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Single Product Delete Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Delete Product?</h3>
                <p className="text-xs text-neutral-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
              <div className="relative w-12 h-14 bg-neutral-200 rounded overflow-hidden shrink-0">
                <Image
                  src={productToDelete.images?.[0] || "/images/placeholder.png"}
                  alt={productToDelete.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-neutral-900 truncate">
                  {productToDelete.name}
                </h4>
                <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                  SKU: {productToDelete.sku} • ${productToDelete.price.toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600">
              Are you sure you want to permanently remove this product from your store inventory and storefront?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmSingleDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Bulk Delete Confirmation */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Delete {selectedIds.size} Products?</h3>
                <p className="text-xs text-neutral-500">Batch deletion from store catalog.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600">
              Are you sure you want to permanently delete all <strong>{selectedIds.size}</strong> selected items? This will remove them from the database, storefront, and active cart drawers.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmBulkDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting ({selectedIds.size})...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete ({selectedIds.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Add New Product Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 my-8 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-500" />
                <span>Add Milled Streetwear Garment</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-neutral-600 uppercase font-bold mb-1">Garment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architectural Heavyweight Hoodie 480 GSM"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded font-sans focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black bg-white uppercase"
                  >
                    <option value="hoodies">hoodies</option>
                    <option value="t-shirts">t-shirts</option>
                    <option value="bottoms">bottoms</option>
                    <option value="outerwear">outerwear</option>
                    <option value="accessories">accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">Compare-At Price ($)</label>
                  <input
                    type="number"
                    value={newProd.compareAtPrice}
                    onChange={(e) => setNewProd({ ...newProd, compareAtPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">Total Stock</label>
                  <input
                    type="number"
                    required
                    value={newProd.totalStock}
                    onChange={(e) => setNewProd({ ...newProd, totalStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">Collection</label>
                  <input
                    type="text"
                    value={newProd.collectionName}
                    onChange={(e) => setNewProd({ ...newProd, collectionName: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-neutral-600 uppercase font-bold mb-1">Main Image URL</label>
                  <input
                    type="url"
                    required
                    value={newProd.image}
                    onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                    className="w-full px-3 py-2 border rounded font-mono text-[11px] focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded font-bold uppercase text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black hover:bg-neutral-800 text-white rounded font-bold uppercase shadow-sm"
                >
                  Publish Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
