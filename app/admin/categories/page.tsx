"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types";
import {
  Tag,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Sparkles,
  Upload,
  Check,
  AlertCircle,
  X,
  RefreshCw,
  Folder,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const handleOpenCreate = () => {
    setIsNew(true);
    setEditingCategory({
      name: "",
      slug: "",
      description: "",
      image:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      itemCount: 0,
      featured: true,
    });
    setErrorMsg(null);
  };

  const handleOpenEdit = (cat: Category) => {
    setIsNew(false);
    setEditingCategory({ ...cat });
    setErrorMsg(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setEditingCategory((prev) => (prev ? { ...prev, image: data.url } : null));
      } else {
        setErrorMsg("Failed to upload image. Please try again.");
      }
    } catch {
      setErrorMsg("Image upload failed due to network error.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const url = "/api/categories";
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save category");
      }

      setSuccessMsg(isNew ? "Category created successfully!" : `Category "${editingCategory.name}" updated successfully!`);
      setEditingCategory(null);
      await fetchCategories();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories?id=${categoryToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Category "${categoryToDelete.name}" deleted.`);
        setCategoryToDelete(null);
        await fetchCategories();
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch {
      alert("Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div suppressHydrationWarning className="w-full space-y-8 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold">
              CATALOG TAXONOMY
            </span>
            <span className="text-neutral-400 text-xs">•</span>
            <span className="text-xs font-mono text-neutral-500">
              {categories.length} Categories Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">
            Categories Manager
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Edit classifications, update category banners, customize URLs and manage product taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCategories}
            className="p-2.5 border border-neutral-300 rounded-lg hover:border-black text-neutral-600 hover:text-black transition-colors"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono placeholder:text-neutral-400 focus:border-black focus:outline-none transition-all"
          />
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between px-4">
          <span className="text-2xs font-mono uppercase text-neutral-500 font-bold">Featured Categories</span>
          <span className="text-base font-black font-mono text-neutral-900">
            {categories.filter((c) => c.featured).length}
          </span>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between px-4">
          <span className="text-2xs font-mono uppercase text-neutral-500 font-bold">Total Catalog Products</span>
          <span className="text-base font-black font-mono text-neutral-900">
            {categories.reduce((sum, c) => sum + (c.itemCount || 0), 0)}
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-20 font-mono text-xs text-neutral-400">
          Loading categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 border border-neutral-200 rounded-2xl p-6 font-mono text-xs">
          <Folder className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
          <p className="font-bold text-neutral-800">No categories found</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="mt-3 px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase rounded-lg hover:bg-neutral-800"
          >
            + Add New Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Category Image */}
                <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                  <Image
                    src={cat.image || "/images/placeholder.png"}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/70 text-white backdrop-blur-xs">
                      {cat.itemCount || 0} Items
                    </span>
                    {cat.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500 text-white flex items-center gap-1 font-bold shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  {/* Category Name on Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-lg uppercase tracking-tight drop-shadow-sm">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-300">
                      /shop?category={cat.slug}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {cat.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                <Link
                  href={`/shop?category=${cat.slug}`}
                  target="_blank"
                  className="text-2xs font-mono text-neutral-500 hover:text-black flex items-center gap-1"
                >
                  <span>View in Shop</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                  {isNew ? "NEW CLASSIFICATION" : "EDIT CLASSIFICATION"}
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 mt-0.5">
                  {isNew ? "Create New Category" : `Edit Category: ${editingCategory.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              {/* Category Name */}
              <div className="space-y-1">
                <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const autoSlug = isNew
                      ? newName.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-")
                      : editingCategory.slug;
                    setEditingCategory((prev) => ({
                      ...prev,
                      name: newName,
                      slug: isNew ? autoSlug : prev?.slug,
                    }));
                  }}
                  placeholder="e.g. Hoodies & Sweats"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:bg-white focus:border-black focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                  Category Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden px-3">
                  <span className="text-neutral-400 text-xs">/shop?category=</span>
                  <input
                    type="text"
                    required
                    value={editingCategory.slug || ""}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[\s_-]+/g, "-"),
                      }))
                    }
                    placeholder="hoodies"
                    className="w-full py-2 bg-transparent text-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="e.g. Ultra-heavy 480 GSM French terry hoodies with custom architectural cuts..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:bg-white focus:border-black focus:outline-none"
                />
              </div>

              {/* Category Image with Upload */}
              <div className="space-y-2">
                <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                  Category Image URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingCategory.image || ""}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({ ...prev, image: e.target.value }))
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:bg-white focus:border-black focus:outline-none text-[11px]"
                  />
                  <label className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 text-xs font-bold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {editingCategory.image && (
                  <div className="relative h-28 w-full rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 mt-2">
                    <Image
                      src={editingCategory.image}
                      alt="Category Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Product item count & Featured toggle */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                    Item Count Display
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCategory.itemCount ?? 0}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        itemCount: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                    Featured Category
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(editingCategory.featured)}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({ ...prev, featured: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-2xs text-neutral-600">Feature on homepage grid</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:border-black text-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-black hover:bg-neutral-800 text-white font-bold uppercase rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Saving Category..." : isNew ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Delete Category?</h3>
                <p className="text-xs text-neutral-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 font-mono">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-black">"{categoryToDelete.name}"</span>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:border-black text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase rounded-lg disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
