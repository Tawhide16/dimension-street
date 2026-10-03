"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CollectionItem } from "@/types";
import {
  Layers,
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
  FolderPlus,
  Eye,
} from "lucide-react";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingCollection, setEditingCollection] = useState<Partial<CollectionItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<CollectionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/collections", { cache: "no-store" });
      const data = await res.json();
      if (data.collections) {
        setCollections(data.collections);
      }
    } catch (e) {
      console.error("Failed to load collections", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const filteredCollections = collections.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const handleOpenCreate = () => {
    setIsNew(true);
    setEditingCollection({
      title: "",
      slug: "",
      description: "",
      bannerImage:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
      itemCount: 0,
      featured: true,
    });
    setErrorMsg(null);
  };

  const handleOpenEdit = (col: CollectionItem) => {
    setIsNew(false);
    setEditingCollection({ ...col });
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
        setEditingCollection((prev) => (prev ? { ...prev, bannerImage: data.url } : null));
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
    if (!editingCollection?.title?.trim()) {
      setErrorMsg("Collection title is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const url = "/api/collections";
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCollection),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save collection");
      }

      setSuccessMsg(isNew ? "Collection created successfully!" : "Collection updated successfully!");
      setEditingCollection(null);
      await fetchCollections();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/collections?id=${collectionToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Collection "${collectionToDelete.title}" deleted.`);
        setCollectionToDelete(null);
        await fetchCollections();
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch {
      alert("Failed to delete collection");
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
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">
              DROPS & ARCHIVES
            </span>
            <span className="text-neutral-400 text-xs">•</span>
            <span className="text-xs font-mono text-neutral-500">
              {collections.length} Collections Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">
            Collections Manager
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Create, edit and organize thematic product collections for storefront drops and homepage section links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCollections}
            className="p-2.5 border border-neutral-300 rounded-lg hover:border-black text-neutral-600 hover:text-black transition-colors"
            title="Refresh Collections"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Collection</span>
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

      {/* Search & Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections by title, slug or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono placeholder:text-neutral-400 focus:border-black focus:outline-none transition-all"
          />
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between px-4">
          <span className="text-2xs font-mono uppercase text-neutral-500 font-bold">Featured Collections</span>
          <span className="text-base font-black font-mono text-neutral-900">
            {collections.filter((c) => c.featured).length}
          </span>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between px-4">
          <span className="text-2xs font-mono uppercase text-neutral-500 font-bold">Total Catalog Drop Items</span>
          <span className="text-base font-black font-mono text-neutral-900">
            {collections.reduce((sum, c) => sum + (c.itemCount || 0), 0)}
          </span>
        </div>
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="text-center py-20 font-mono text-xs text-neutral-400">
          Loading collections...
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 border border-neutral-200 rounded-2xl p-6 font-mono text-xs">
          <FolderPlus className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
          <p className="font-bold text-neutral-800">No collections found</p>
          <p className="text-neutral-500 text-2xs mt-1 mb-4">
            Create your first drop collection to showcase themed streetwear lines.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase rounded-lg hover:bg-neutral-800"
          >
            + Create Collection Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((col) => (
            <div
              key={col._id}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Banner Image */}
                <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                  <Image
                    src={col.bannerImage || "/images/placeholder.png"}
                    alt={col.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/70 text-white backdrop-blur-xs">
                      {col.itemCount || 0} Products
                    </span>
                    {col.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-400 text-black flex items-center gap-1 font-bold shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured Drop</span>
                      </span>
                    )}
                  </div>

                  {/* Title on Banner */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-lg uppercase tracking-tight drop-shadow-sm">
                      {col.title}
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-300">
                      /collections/{col.slug}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {col.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                <Link
                  href={`/collections/${col.slug}`}
                  target="_blank"
                  className="text-2xs font-mono text-neutral-500 hover:text-black flex items-center gap-1"
                >
                  <span>Preview Drop</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(col)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionToDelete(col)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                  {isNew ? "NEW DROP" : "EDIT DROP"}
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 mt-0.5">
                  {isNew ? "Create New Collection" : `Edit: ${editingCollection.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCollection(null)}
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
              {/* Collection Title */}
              <div className="space-y-1">
                <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                  Collection Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCollection.title || ""}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const autoSlug = isNew
                      ? newTitle.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-")
                      : editingCollection.slug;
                    setEditingCollection((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: isNew ? autoSlug : prev?.slug,
                    }));
                  }}
                  placeholder="e.g. Heavyweight Essentials"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:bg-white focus:border-black focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                  Collection URL Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden px-3">
                  <span className="text-neutral-400 text-xs">/collections/</span>
                  <input
                    type="text"
                    required
                    value={editingCollection.slug || ""}
                    onChange={(e) =>
                      setEditingCollection((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[\s_-]+/g, "-"),
                      }))
                    }
                    placeholder="heavyweight-essentials"
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
                  value={editingCollection.description || ""}
                  onChange={(e) =>
                    setEditingCollection((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief story and design philosophy behind this collection drop..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:bg-white focus:border-black focus:outline-none"
                />
              </div>

              {/* Banner Image with Upload */}
              <div className="space-y-2">
                <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                  Banner Image URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingCollection.bannerImage || ""}
                    onChange={(e) =>
                      setEditingCollection((prev) => ({ ...prev, bannerImage: e.target.value }))
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

                {editingCollection.bannerImage && (
                  <div className="relative h-28 w-full rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 mt-2">
                    <Image
                      src={editingCollection.bannerImage}
                      alt="Banner Preview"
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
                    value={editingCollection.itemCount ?? 0}
                    onChange={(e) =>
                      setEditingCollection((prev) => ({
                        ...prev,
                        itemCount: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <label className="block text-2xs uppercase tracking-wider text-neutral-700 font-bold">
                    Featured Collection
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(editingCollection.featured)}
                      onChange={(e) =>
                        setEditingCollection((prev) => ({ ...prev, featured: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-black border-neutral-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-2xs text-neutral-600">Show badge & feature on homepage</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:border-black text-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-black hover:bg-neutral-800 text-white font-bold uppercase rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Saving Drop..." : isNew ? "Create Collection" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {collectionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Delete Collection?</h3>
                <p className="text-xs text-neutral-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 font-mono">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-black">"{collectionToDelete.title}"</span>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCollectionToDelete(null)}
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
