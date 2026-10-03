"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CommunityReel } from "@/types";
import {
  Video,
  Upload,
  Plus,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export default function AdminCommunityReelsPage() {
  const [reels, setReels] = useState<CommunityReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productThumbnail, setProductThumbnail] = useState("");
  const [productSlug, setProductSlug] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReels = () => {
    setLoading(true);
    fetch("/api/community/reels")
      .then((res) => res.json())
      .then((data) => {
        if (data.reels) setReels(data.reels);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
  };

  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoPreviewUrl && !videoFile) {
      alert("Please select or enter a video file");
      return;
    }

    if (!productName || !productPrice) {
      alert("Please provide product name and price");
      return;
    }

    setUploading(true);

    try {
      let finalVideoUrl = videoPreviewUrl;

      // If a local file was chosen, upload via API endpoint
      if (videoFile) {
        const formData = new FormData();
        formData.append("file", videoFile);

        const uploadRes = await fetch("/api/community/upload-video", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.videoUrl) {
          finalVideoUrl = uploadData.videoUrl;
        } else {
          throw new Error("Video file upload failed");
        }
      }

      // Create new Community Reel entry
      const res = await fetch("/api/community/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || productName,
          videoUrl: finalVideoUrl,
          posterUrl: productThumbnail || "/images/review_green_hoodie.jpg",
          product: {
            name: productName,
            price: Number(productPrice),
            slug: productSlug || "architectural-pullover-hoodie-480gsm",
            thumbnail: productThumbnail || "/images/review_green_hoodie.jpg",
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.reel) {
        setReels((prev) => [data.reel, ...prev]);
        setShowUploadModal(false);
        setVideoFile(null);
        setVideoPreviewUrl("");
        setTitle("");
        setProductName("");
        setProductPrice("");
        setProductThumbnail("");
        setProductSlug("");

        setNotification({
          type: "success",
          message: "New community reel published live to storefront!",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: "Failed to publish reel. Please try again.",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reel?")) return;

    try {
      const res = await fetch(`/api/community/reels?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setReels((prev) => prev.filter((r) => r._id !== id));
        setNotification({
          type: "success",
          message: "Reel deleted successfully",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      alert("Failed to delete reel");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/community/reels?id=${id}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success && data.reel) {
        setReels((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isActive: data.reel.isActive } : r))
        );
      }
    } catch {
      alert("Failed to toggle status");
    }
  };

  return (
    <div className="w-full space-y-6 font-mono pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
              Community Reels & Video Studio
            </h1>
            <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded">
              REELS V2
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Upload vertical 9:16 videos, attach shoppable clothing items, and showcase your community
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 border border-neutral-300 text-neutral-800 text-xs font-bold uppercase rounded-md hover:bg-neutral-100 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View on Storefront</span>
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-md flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Reel</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3 text-xs rounded-md font-bold flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
              : "bg-red-50 border border-red-300 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Reels Grid Preview */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Active Community Reels ({reels.length})
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">
            First 5 reels are featured in homepage &quot;Meet Our Community&quot;
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading reels...</div>
        ) : reels.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            No community reels uploaded yet. Click &quot;Upload New Reel&quot; to add your first video!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {reels.map((reel) => (
              <div
                key={reel._id}
                className="bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden flex flex-col justify-between group"
              >
                {/* Video / Photo Preview */}
                <div className="relative aspect-[9/15] bg-black overflow-hidden flex items-center justify-center">
                  {reel.videoUrl ? (
                    <video
                      src={reel.videoUrl}
                      poster={reel.posterUrl || undefined}
                      playsInline
                      loop
                      muted
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : reel.posterUrl ? (
                    <Image
                      src={reel.posterUrl}
                      alt={reel.title || "Community reel"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-mono">
                      No Media Attached
                    </span>
                  )}
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      onClick={() => handleToggleActive(reel._id)}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        reel.isActive ? "bg-emerald-600 text-white" : "bg-neutral-600 text-white"
                      }`}
                    >
                      {reel.isActive ? "Active" : "Hidden"}
                    </button>
                  </div>
                </div>

                {/* Product Bar & Actions */}
                <div className="p-3 bg-white border-t border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden">
                      <Image
                        src={reel.product.thumbnail || "/images/review_green_hoodie.jpg"}
                        alt={reel.product.name}
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-neutral-900 truncate">
                        {reel.product.name}
                      </p>
                      <p className="text-[10px] text-neutral-600 font-semibold">
                        Tk {reel.product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-neutral-400 truncate max-w-28">
                      {reel.title}
                    </span>
                    <button
                      onClick={() => handleDeleteReel(reel._id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload New Reel Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold uppercase text-neutral-900">
                  Upload Community Reel / Video
                </h2>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-400 hover:text-black font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReel} className="space-y-4 text-xs">
              {/* 1. Video File Picker */}
              <div className="space-y-2">
                <label className="font-bold text-neutral-800 uppercase block">
                  1. Video File / Reel (MP4, WebM, MOV)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-300 hover:border-black rounded-lg p-5 text-center cursor-pointer transition-colors bg-neutral-50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                  {videoFile ? (
                    <div className="space-y-1">
                      <p className="font-bold text-emerald-600">✓ Selected: {videoFile.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1.5 text-neutral-500">
                      <Upload className="w-6 h-6 text-neutral-400" />
                      <p className="font-bold text-neutral-700">Click to upload video from device</p>
                      <p className="text-[10px] text-neutral-400">Vertical 9:16 video recommended</p>
                    </div>
                  )}
                </div>

                {/* Or Direct Video URL */}
                <div className="pt-1">
                  <span className="text-[10px] text-neutral-400 block mb-1">
                    Or paste direct video URL:
                  </span>
                  <input
                    type="url"
                    placeholder="https://.../video.mp4"
                    value={videoPreviewUrl}
                    onChange={(e) => {
                      setVideoPreviewUrl(e.target.value);
                      setVideoFile(null);
                    }}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                  />
                </div>

                {/* Video Live Preview */}
                {Boolean(videoPreviewUrl && videoPreviewUrl.trim()) && (
                  <div className="mt-2 relative aspect-[9/12] max-w-[180px] mx-auto bg-black rounded-lg overflow-hidden border border-neutral-300">
                    <video
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* 2. Product Name */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-800 uppercase block">
                  2. Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Community club Singh hoodie - Grey stonewash"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              {/* 3. Product Price */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-800 uppercase block">
                  3. Price (in BDT Tk)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 13600"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              {/* 4. Product Thumbnail Image URL */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-800 uppercase block">
                  4. Product Thumbnail Image URL
                </label>
                <input
                  type="text"
                  placeholder="/images/review_green_hoodie.jpg"
                  value={productThumbnail}
                  onChange={(e) => setProductThumbnail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              {/* 5. Product Link / Slug */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-800 uppercase block">
                  5. Product Slug / Link
                </label>
                <input
                  type="text"
                  placeholder="architectural-pullover-hoodie-480gsm"
                  value={productSlug}
                  onChange={(e) => setProductSlug(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              {/* 6. Reel Caption / Title */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-800 uppercase block">
                  6. Reel Caption / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gym Workout Community Fit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded text-neutral-700 font-bold uppercase hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-black hover:bg-neutral-800 text-white font-bold uppercase rounded flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Publish Reel</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
