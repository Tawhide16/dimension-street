"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Plus, Trash2, Edit, Search, Tag, Eye, Check } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newProd, setNewProd] = useState({
    name: "",
    slug: "",
    category: "t-shirts",
    collectionName: "dimension-core",
    price: 65,
    compareAtPrice: 80,
    costPrice: 22,
    sku: "DIM-NEW-001",
    description: "Engineered from custom milled 320 GSM organic cotton knit.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
    totalStock: 40,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this streetwear garment?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch {
      // local fallback
      setProducts(products.filter((p) => p._id !== id));
    }
  };

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
        // Reset form
        setNewProd({
          name: "",
          slug: "",
          category: "t-shirts",
          collectionName: "dimension-core",
          price: 65,
          compareAtPrice: 80,
          costPrice: 22,
          sku: `DIM-NEW-${Date.now().toString().slice(-3)}`,
          description: "Engineered from custom milled 320 GSM organic cotton knit.",
          image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
          totalStock: 40,
          featured: true,
          newArrival: true,
        });
      }
    } catch {
      alert("Error adding product");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your milled streetwear items, variants, SKUs, and stock quantities
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-md flex items-center gap-2 self-start shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-black font-sans"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>Total: <strong>{products.length}</strong> styles</span>
          <span>•</span>
          <span>In Stock: <strong className="text-emerald-600">{products.filter(p => p.totalStock > 0).length}</strong></span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 uppercase text-[10px]">
              <tr>
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
              {filtered.map((prod) => (
                <tr key={prod._id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-neutral-100 rounded overflow-hidden flex-shrink-0 border border-neutral-200">
                        <Image
                          src={prod.images[0] || "/placeholder.jpg"}
                          alt={prod.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-neutral-900 block truncate max-w-xs font-sans">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {prod.variants.length} variant options
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-bold text-neutral-700">
                    {prod.sku}
                  </td>

                  <td className="py-3 px-4 uppercase text-neutral-600">
                    {prod.category}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-black">{formatPrice(prod.price)}</div>
                    {prod.compareAtPrice && (
                      <div className="text-[10px] text-neutral-400 line-through">
                        {formatPrice(prod.compareAtPrice)}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
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
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {prod.newArrival && (
                        <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded">NEW</span>
                      )}
                      {prod.bestSeller && (
                        <span className="text-[9px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded">BEST</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/product/${prod.slug}`}
                        target="_blank"
                        className="p-1.5 text-neutral-400 hover:text-black transition-colors"
                        title="View on storefront"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-base font-black font-sans uppercase">Create Streetwear Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Architectural Drop Shoulder Hoodie"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none bg-white"
                  >
                    <option value="t-shirts">T-Shirts</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="pants">Pants & Cargos</option>
                    <option value="jackets">Jackets</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    value={newProd.compareAtPrice}
                    onChange={(e) => setNewProd({ ...newProd, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Total Stock</label>
                  <input
                    type="number"
                    required
                    value={newProd.totalStock}
                    onChange={(e) => setNewProd({ ...newProd, totalStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">High-Res Image URL</label>
                <input
                  type="url"
                  required
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProd.newArrival}
                    onChange={(e) => setNewProd({ ...newProd, newArrival: e.target.checked })}
                    className="accent-black w-4 h-4"
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProd.featured}
                    onChange={(e) => setNewProd({ ...newProd, featured: e.target.checked })}
                    className="accent-black w-4 h-4"
                  />
                  <span>Mark as Featured</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black hover:bg-neutral-800 text-white rounded uppercase font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
