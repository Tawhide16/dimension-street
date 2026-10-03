"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tag,
  Eye,
  Share2,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Palette,
  AlignLeft,
  Link2,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Code,
  Upload,
  Loader2,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  Edit2,
  Plus,
  X,
  Package,
  ArrowLeft,
  Settings,
  Globe,
  Sliders,
} from "lucide-react";

export default function NewProductShopifyPage() {
  const router = useRouter();

  // Basic Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(
    "Architectural heavyweight streetwear silhouette meticulously crafted from 480 GSM organic loopback cotton. Features an oversized boxy drape, dropped shoulder seams, and double-layered hood."
  );
  const [category, setCategory] = useState("hoodies");
  const [suggestedCategoryDismissed, setSuggestedCategoryDismissed] = useState(false);

  // Status & Publishing
  const [status, setStatus] = useState<"active" | "draft" | "archived">("active");
  const [productType, setProductType] = useState("Hoodie");
  const [vendor, setVendor] = useState("Dimension Street");
  const [collections, setCollections] = useState<string[]>(["New Arrivals", "Dimension Core"]);
  const [newCollectionInput, setNewCollectionInput] = useState("");
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [tags, setTags] = useState<string[]>(["Streetwear", "480 GSM", "Heavyweight", "Oversized"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [themeTemplate, setThemeTemplate] = useState("Default product");

  // Media & Images
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
  ]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [directUrlInput, setDirectUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Pricing
  const [price, setPrice] = useState<number>(110);
  const [compareAtPrice, setCompareAtPrice] = useState<number | "">(130);
  const [costPrice, setCostPrice] = useState<number | "">(45);
  const [chargeTax, setChargeTax] = useState(true);
  const [showCompareAt, setShowCompareAt] = useState(true);
  const [showCostPrice, setShowCostPrice] = useState(true);

  // Inventory
  const [sku, setSku] = useState(`DIM-HOOD-${Date.now().toString().slice(-4)}`);
  const [barcode, setBarcode] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);

  // Shipping
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(true);
  const [packageType, setPackageType] = useState("Store default • Sample box - 8.6 x 5.4 x 1.6 in, 0 lb");
  const [dimensions, setDimensions] = useState({ length: 8.6, width: 5.4, height: 1.6, unit: "in" });
  const [weight, setWeight] = useState({ value: 1.2, unit: "lb" });
  const [countryOfOrigin, setCountryOfOrigin] = useState("Bangladesh");
  const [hsCode, setHsCode] = useState("6110.20");
  const [showShippingDetails, setShowShippingDetails] = useState(false);

  // Variants & Sizes
  const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "One Size"];
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({
    S: 15,
    M: 20,
    L: 20,
    XL: 15,
  });
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [showAddOptions, setShowAddOptions] = useState(false);

  // Metafields / Disclosures
  const [fit, setFit] = useState("Boxy oversized streetwear cut with dropped shoulders.");
  const [material, setMaterial] = useState("100% Combed Organic Cotton — 480 GSM Ultra-Heavyweight Loopback Knit.");
  const [care, setCare] = useState("Machine wash cold at 30°C inside-out with like colors. Hang dry in shade.");
  const [shippingNotice, setShippingNotice] = useState("Dispatched from warehouse within 24h. Express tracked courier.");
  const [showDisclosures, setShowDisclosures] = useState(false);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [urlHandle, setUrlHandle] = useState("");
  const [isEditingSeo, setIsEditingSeo] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync SEO with Title & Description
  useEffect(() => {
    if (!seoTitle) {
      setSeoTitle(title ? `${title} — Dimension Street` : "Product Name — Dimension Street");
    }
    if (!urlHandle) {
      setUrlHandle(
        title
          ? title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
          : "product-handle"
      );
    }
  }, [title]);

  // Total stock calculation
  const totalStock = selectedSizes.reduce((sum, s) => sum + (sizeStocks[s] || 0), 0);

  // Margin calculation
  const calculatedMargin =
    typeof costPrice === "number" && price > 0
      ? Math.round(((price - costPrice) / price) * 100)
      : null;
  const calculatedProfit =
    typeof costPrice === "number" && price > 0 ? (price - costPrice).toFixed(2) : null;

  // Image Upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    setUploadError(null);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          urls.push(data.url);
        } else {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }
      }
      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload photo.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setAsCover = (index: number) => {
    setUploadedImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleAddDirectUrl = () => {
    if (!directUrlInput.trim()) return;
    setUploadedImages((prev) => [...prev, directUrlInput.trim()]);
    setDirectUrlInput("");
    setShowUrlInput(false);
  };

  // Toggle Size
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== size);
      } else {
        if (!sizeStocks[size]) {
          setSizeStocks((st) => ({ ...st, [size]: 10 }));
        }
        return [...prev, size];
      }
    });
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed || selectedSizes.includes(trimmed)) return;
    setSelectedSizes((prev) => [...prev, trimmed]);
    setSizeStocks((st) => ({ ...st, [trimmed]: 10 }));
    setCustomSizeInput("");
  };

  // Tag Manager
  const addTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Collection Manager
  const addCollection = () => {
    const trimmed = newCollectionInput.trim();
    if (trimmed && !collections.includes(trimmed)) {
      setCollections([...collections, trimmed]);
      setNewCollectionInput("");
      setIsAddingCollection(false);
    }
  };

  const removeCollection = (cToRemove: string) => {
    setCollections(collections.filter((c) => c !== cToRemove));
  };

  // Save Product to Backend
  const handleSaveProduct = async () => {
    if (!title.trim()) {
      alert("Please enter a product title.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const slug =
      urlHandle.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const variants = selectedSizes.map((sz) => ({
      sku: `${sku}-${sz}`,
      color: "Pitch Black",
      size: sz,
      price: Number(price) || 0,
      compareAtPrice: typeof compareAtPrice === "number" ? compareAtPrice : undefined,
      stock: sizeStocks[sz] !== undefined ? sizeStocks[sz] : 10,
    }));

    const payload = {
      name: title.trim(),
      slug,
      category,
      collectionName: collections[0] || "dimension-core",
      price: Number(price) || 0,
      compareAtPrice: typeof compareAtPrice === "number" ? compareAtPrice : undefined,
      costPrice: typeof costPrice === "number" ? costPrice : undefined,
      sku,
      description,
      shortDescription: description.slice(0, 160),
      images: uploadedImages.length > 0 ? uploadedImages : ["/images/placeholder.jpg"],
      totalStock: variants.reduce((s, v) => s + v.stock, 0),
      status,
      featured: true,
      newArrival: true,
      tags,
      vendor,
      productType,
      inventoryTracked: trackInventory,
      barcode,
      packageType,
      dimensions,
      weight,
      countryOfOrigin,
      hsCode,
      chargeTax,
      themeTemplate,
      details: {
        fit,
        material,
        care,
        shipping: shippingNotice,
      },
      seo: {
        metaTitle: seoTitle || title,
        metaDescription: seoDescription || description.slice(0, 160),
        keywords: tags,
      },
      variants,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product.");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred while saving.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] text-[#303030] font-sans pb-24">
      {/* 1. TOP HEADER / BREADCRUMB BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/admin/products"
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
            title="Back to products list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="text-neutral-400 text-sm">›</span>
            <h1 className="text-sm sm:text-base font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
              {title ? title : "Unsaved product"}
            </h1>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                status === "active"
                  ? "bg-[#e3f1df] text-[#1b5e20] border border-[#c4e3be]"
                  : status === "draft"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-neutral-200 text-neutral-700"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (urlHandle) window.open(`/product/${urlHandle}`, "_blank");
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("Product creation link copied to clipboard!");
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Share</span>
          </button>

          <button
            type="button"
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            <span>More actions</span>
            <ChevronDown className="w-3 h-3 text-neutral-500" />
          </button>

          <div className="hidden lg:flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              className="p-1.5 hover:bg-neutral-100 border-r border-neutral-200 text-neutral-600"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="p-1.5 hover:bg-neutral-100 text-neutral-600">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="px-4 py-1.5 bg-[#303030] hover:bg-black text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </header>

      {/* Save Error notification */}
      {saveError && (
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
            <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-800">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN (8 COLS) ================= */}
        <div className="lg:col-span-8 space-y-5">
          {/* CARD 1: TITLE & DESCRIPTION */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Authentic African Black Soap All-In-One - Eucalyptus Tea Tree 32 oz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">Description</label>

              {/* Rich-Text Formatting Toolbar */}
              <div className="border border-neutral-300 rounded-lg overflow-hidden bg-white">
                <div className="flex items-center gap-1 p-1.5 border-b border-neutral-200 bg-[#fbfbfb] text-neutral-700 text-xs flex-wrap">
                  <button
                    type="button"
                    title="Generate with AI"
                    onClick={() => {
                      if (!title) {
                        alert("Enter a title first to generate AI description.");
                        return;
                      }
                      setDescription(
                        `Precision-tailored ${title} constructed with artisanal craftsmanship. Designed for durability, heavyweight texture, and an effortless modern silhouette with timeless versatility.`
                      );
                    }}
                    className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700 flex items-center gap-1 font-bold text-[11px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  </button>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  {/* Paragraph Select */}
                  <select className="text-xs bg-transparent border-0 focus:outline-none py-1 px-1 font-medium cursor-pointer">
                    <option>Paragraph</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                    <option>Heading 3</option>
                  </select>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  <button
                    type="button"
                    title="Bold"
                    className="p-1.5 hover:bg-neutral-200 rounded font-black text-xs"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" title="Italic" className="p-1.5 hover:bg-neutral-200 rounded">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" title="Underline" className="p-1.5 hover:bg-neutral-200 rounded">
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" title="Text Color" className="p-1.5 hover:bg-neutral-200 rounded">
                    <Palette className="w-3.5 h-3.5 text-neutral-600" />
                  </button>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  <button type="button" title="Align" className="p-1.5 hover:bg-neutral-200 rounded">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" title="Add Link" className="p-1.5 hover:bg-neutral-200 rounded">
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Insert Photo"
                    onClick={() => setShowUrlInput(true)}
                    className="p-1.5 hover:bg-neutral-200 rounded"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" title="Insert Video" className="p-1.5 hover:bg-neutral-200 rounded">
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" title="Insert Table" className="p-1.5 hover:bg-neutral-200 rounded">
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" title="More" className="p-1.5 hover:bg-neutral-200 rounded">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  <button
                    type="button"
                    title="Toggle HTML Code"
                    className="p-1.5 hover:bg-neutral-200 rounded ml-auto text-neutral-500 hover:text-black"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description, styling notes, fabric compositions, and story..."
                  className="w-full p-3.5 text-xs sm:text-sm text-neutral-800 focus:outline-none bg-white resize-y"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: MEDIA */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Media</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Drag and drop images to reorder. The first photo acts as the primary cover photo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs text-neutral-700 hover:text-black font-semibold hover:underline"
                >
                  {showUrlInput ? "Hide URL" : "Add from URL"}
                </button>
              </div>
            </div>

            {/* Direct URL input if expanded */}
            {showUrlInput && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:border-black bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddDirectUrl}
                  className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded hover:bg-black"
                >
                  Add URL
                </button>
              </div>
            )}

            {/* Image Grid with Featured Cover on Left */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Featured / Main Image Slot */}
              {uploadedImages.length > 0 ? (
                <div className="w-full sm:w-48 aspect-square relative rounded-xl border border-neutral-300 overflow-hidden bg-neutral-50 group shrink-0 shadow-2xs">
                  <img
                    src={uploadedImages[0]}
                    alt="Featured Product"
                    className="w-full h-full object-contain p-2"
                  />
                  <span className="absolute top-2 left-2 bg-neutral-900/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs">
                    Cover
                  </span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeImage(0)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
                      title="Delete cover photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Secondary Thumbnails & Upload Box */}
              <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {uploadedImages.slice(1).map((url, idx) => {
                  const actualIdx = idx + 1;
                  return (
                    <div
                      key={actualIdx}
                      className="aspect-square relative rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50 group shadow-2xs"
                    >
                      <img
                        src={url}
                        alt={`Photo ${actualIdx + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        <button
                          type="button"
                          onClick={() => setAsCover(actualIdx)}
                          className="px-1.5 py-0.5 bg-white text-black text-[9px] font-bold rounded shadow-xs hover:bg-neutral-100"
                        >
                          Make Cover
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(actualIdx)}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700 shadow-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add More Photos Upload Box */}
                <label className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white flex flex-col items-center justify-center cursor-pointer transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingImage}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="sr-only"
                  />
                  {isUploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-400 group-hover:text-black">
                      <Plus className="w-6 h-6 stroke-[1.5]" />
                      <span className="text-[10px] font-semibold">Add</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="p-2 bg-red-50 text-red-600 rounded text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* CARD 3: CATEGORY */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-neutral-900">Category</h3>
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
              >
                <option value="hoodies">Hoodies & Pullovers</option>
                <option value="t-shirts">Heavyweight T-Shirts & Graphic Tees</option>
                <option value="bottoms">Sweatpants, Cargo & Denim Bottoms</option>
                <option value="outerwear">Jackets, Windbreakers & Outerwear</option>
                <option value="accessories">Caps, Beanies, Socks & Accessories</option>
              </select>
            </div>

            {!suggestedCategoryDismissed && (
              <div className="flex items-center justify-between p-2.5 bg-[#f4f7fc] border border-[#d2e3fc] rounded-lg text-xs text-[#1a73e8]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">
                    {category === "hoodies"
                      ? "Heavyweight Fleece Hoodies in Streetwear"
                      : `${category} in Apparel`}
                  </span>
                  <span className="text-[10px] bg-white border border-[#d2e3fc] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Suggested
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuggestedCategoryDismissed(true)}
                  className="text-neutral-400 hover:text-black p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className="text-[11px] text-neutral-400">
              Determines tax rates and adds metafields to improve search, filters, and cross-channel sales
            </p>
          </div>

          {/* CARD 4: PRICING */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Price</h3>

            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-neutral-500 font-mono">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono bg-white"
                />
              </div>
            </div>

            {/* Price modifier pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowCompareAt(!showCompareAt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showCompareAt
                    ? "bg-neutral-100 border-neutral-300 text-neutral-900"
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                Compare-at
              </button>

              <button
                type="button"
                onClick={() => setChargeTax(!chargeTax)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                  chargeTax
                    ? "bg-[#e3f1df] border-[#c4e3be] text-[#1b5e20]"
                    : "bg-white border-neutral-200 text-neutral-600"
                }`}
              >
                <span>Charge tax</span>
                <span className="font-bold">{chargeTax ? "Yes" : "No"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCostPrice(!showCostPrice)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showCostPrice
                    ? "bg-neutral-100 border-neutral-300 text-neutral-900"
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                Cost per item
              </button>
            </div>

            {/* Expanded Pricing Fields */}
            {(showCompareAt || showCostPrice) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {showCompareAt && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">
                      Compare-at price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-neutral-500 font-mono">$</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={compareAtPrice}
                        onChange={(e) =>
                          setCompareAtPrice(
                            e.target.value === "" ? "" : parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-7 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono bg-white"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Shows a strikethrough sale price on product cards.
                    </p>
                  </div>
                )}

                {showCostPrice && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">
                      Cost per item
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-neutral-500 font-mono">$</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={costPrice}
                        onChange={(e) =>
                          setCostPrice(
                            e.target.value === "" ? "" : parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-7 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono bg-white"
                      />
                    </div>
                    {calculatedMargin !== null && (
                      <p className="text-[11px] text-neutral-600 font-mono mt-1">
                        Margin: <span className="font-bold">{calculatedMargin}%</span> • Profit:{" "}
                        <span className="font-bold">${calculatedProfit}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CARD 5: INVENTORY */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Inventory</h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
                <span>Inventory not tracked</span>
                <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="checkbox"
                  checked={!trackInventory}
                  onChange={(e) => setTrackInventory(!e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono bg-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSku(
                        `DIM-${category.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`
                      )
                    }
                    className="px-2.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Barcode (ISBN, UPC, GTIN, etc.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 190198000000"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* CARD 6: SHIPPING */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Shipping</h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
                <span>Physical product</span>
                <input
                  type="checkbox"
                  checked={isPhysicalProduct}
                  onChange={(e) => setIsPhysicalProduct(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {isPhysicalProduct && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Package when shipped alone
                  </label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option>Store default • Sample box - 8.6 x 5.4 x 1.6 in, 0 lb</option>
                    <option>Polymailer Bag - 10 x 13 x 1 in, 0.1 lb</option>
                    <option>Heavyweight Garment Box - 14 x 12 x 4 in, 0.5 lb</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1">
                      <span>Packed product size</span>
                      <HelpCircle className="w-3 h-3 text-neutral-400" />
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white flex-1">
                        <span className="px-2 text-xs text-neutral-400 font-mono">L</span>
                        <input
                          type="number"
                          step="0.1"
                          value={dimensions.length}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full py-1.5 text-xs text-center focus:outline-none font-mono"
                        />
                      </div>
                      <span className="text-xs text-neutral-400">×</span>
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white flex-1">
                        <span className="px-2 text-xs text-neutral-400 font-mono">W</span>
                        <input
                          type="number"
                          step="0.1"
                          value={dimensions.width}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full py-1.5 text-xs text-center focus:outline-none font-mono"
                        />
                      </div>
                      <span className="text-xs text-neutral-400">×</span>
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white flex-1">
                        <span className="px-2 text-xs text-neutral-400 font-mono">H</span>
                        <input
                          type="number"
                          step="0.1"
                          value={dimensions.height}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full py-1.5 text-xs text-center focus:outline-none font-mono"
                        />
                      </div>
                      <select
                        value={dimensions.unit}
                        onChange={(e) => setDimensions({ ...dimensions, unit: e.target.value })}
                        className="border border-neutral-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none"
                      >
                        <option value="in">in</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1">
                      <span>Weight</span>
                      <HelpCircle className="w-3 h-3 text-neutral-400" />
                    </label>
                    <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                      <input
                        type="number"
                        step="0.1"
                        value={weight.value}
                        onChange={(e) =>
                          setWeight({ ...weight, value: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-1.5 text-xs focus:outline-none font-mono"
                      />
                      <select
                        value={weight.unit}
                        onChange={(e) => setWeight({ ...weight, unit: e.target.value })}
                        className="bg-neutral-50 border-l border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none font-medium"
                      >
                        <option value="lb">lb</option>
                        <option value="kg">kg</option>
                        <option value="oz">oz</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Country of Origin & HS Code */}
                <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowShippingDetails(!showShippingDetails)}
                    className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1"
                  >
                    <span>Country of origin & customs HS Code</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        showShippingDetails ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {showShippingDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Country / Region of origin
                      </label>
                      <input
                        type="text"
                        value={countryOfOrigin}
                        onChange={(e) => setCountryOfOrigin(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Harmonized System (HS) code
                      </label>
                      <input
                        type="text"
                        value={hsCode}
                        onChange={(e) => setHsCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CARD 7: VARIANTS */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Variants</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Select available sizes & inventory allocation per size
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOptions(!showAddOptions)}
                className="text-xs text-neutral-700 hover:text-black font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add options like size or color</span>
              </button>
            </div>

            {/* Size selector pills */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {ALL_SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                          : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      <span>{size}</span>
                    </button>
                  );
                })}

                {/* Custom size input */}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Custom size..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    className="w-28 px-2.5 py-1.5 text-xs font-mono uppercase border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Variant Matrix Table */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                <div className="grid grid-cols-12 bg-neutral-50 px-3 py-2 text-[11px] font-bold text-neutral-500 uppercase border-b border-neutral-200">
                  <span className="col-span-3">Variant (Size)</span>
                  <span className="col-span-3">Price ($)</span>
                  <span className="col-span-3">Available Stock</span>
                  <span className="col-span-3">SKU</span>
                </div>

                <div className="divide-y divide-neutral-100">
                  {selectedSizes.map((size) => (
                    <div
                      key={size}
                      className="grid grid-cols-12 px-3 py-2.5 items-center text-xs hover:bg-neutral-50/50"
                    >
                      <div className="col-span-3 font-mono font-bold text-neutral-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neutral-800" />
                        <span>{size}</span>
                      </div>
                      <div className="col-span-3 pr-4">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-neutral-400 font-mono text-xs">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={price}
                            className="w-full pl-6 pr-2 py-1 text-xs border border-neutral-200 rounded focus:outline-none focus:border-black font-mono"
                          />
                        </div>
                      </div>
                      <div className="col-span-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={sizeStocks[size] ?? 10}
                            onChange={(e) =>
                              setSizeStocks({
                                ...sizeStocks,
                                [size]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20 px-2 py-1 text-xs border border-neutral-200 rounded text-center focus:outline-none focus:border-black font-mono font-bold"
                          />
                          <span className="text-[10px] text-neutral-400">units</span>
                        </div>
                      </div>
                      <div className="col-span-3 font-mono text-[11px] text-neutral-500 truncate">
                        {sku}-{size}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 8: PRODUCT METAFIELDS */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Product metafields</h3>
              <button
                type="button"
                onClick={() => setShowDisclosures(!showDisclosures)}
                className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1"
              >
                <span>{showDisclosures ? "Hide details" : "+ Disclosures & Specs"}</span>
              </button>
            </div>

            {showDisclosures && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Silhouette & Fit
                  </label>
                  <input
                    type="text"
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Fabric & Material (GSM)
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Care Instructions
                  </label>
                  <input
                    type="text"
                    value={care}
                    onChange={(e) => setCare(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CARD 9: SEARCH ENGINE LISTING (SEO) */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Search engine listing</h3>
              <button
                type="button"
                onClick={() => setIsEditingSeo(!isEditingSeo)}
                className="text-neutral-500 hover:text-black p-1 rounded"
                title="Edit SEO"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Google SERP Preview Card */}
            <div className="p-3 bg-neutral-50/70 border border-neutral-200 rounded-lg space-y-1">
              <div className="text-[11px] text-neutral-500 font-mono truncate">
                https://dimensionstreet.com › products › {urlHandle || "product-handle"}
              </div>
              <div className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer truncate">
                {seoTitle || title || "Authentic African Black Soap All-In-One - Eucalyptus Tea Tree 32 oz"}
              </div>
              <div className="text-xs text-neutral-600 line-clamp-2">
                {seoDescription ||
                  description ||
                  "Authentic African Black Soap All-In-One - Eucalyptus Tea Tree 32 oz"}
              </div>
              <div className="text-xs font-mono font-bold text-neutral-800 pt-0.5">
                ${price.toFixed(2)} USD
              </div>
            </div>

            {/* SEO Editor Fields */}
            {isEditingSeo && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Page title
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    {seoTitle.length} of 70 characters used
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Meta description
                  </label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    {seoDescription.length} of 320 characters used
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    URL handle
                  </label>
                  <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                    <span className="px-2.5 text-xs text-neutral-400 font-mono">
                      https://dimensionstreet.com/product/
                    </span>
                    <input
                      type="text"
                      value={urlHandle}
                      onChange={(e) => setUrlHandle(e.target.value)}
                      className="flex-1 py-2 pr-3 text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (4 COLS / SIDEBAR) ================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* CARD 1: STATUS */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-2">
            <label className="block text-xs font-bold text-neutral-900">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* CARD 2: PUBLISHING */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900">Publishing</h3>
              <Settings className="w-3.5 h-3.5 text-neutral-400 hover:text-black cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <Globe className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold">All channels</span>
            </div>
          </div>

          {/* CARD 3: SALES */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900">Sales</h3>
            <p className="text-xs text-neutral-500">No recent sales of this product</p>
            <button
              type="button"
              className="text-xs text-[#1a73e8] hover:underline font-semibold"
            >
              View details
            </button>
          </div>

          {/* CARD 4: PRODUCT ORGANIZATION */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-neutral-900">Product organization</h3>
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            </div>

            {/* Type */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Type</label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="e.g. Heavyweight Hoodie"
                className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white"
              />
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Vendor</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Dimension Street"
                className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white"
              />
            </div>

            {/* Collections */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-neutral-600">Collections</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCollection(!isAddingCollection)}
                  className="text-neutral-500 hover:text-black p-0.5"
                  title="Add to collection"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {isAddingCollection && (
                <div className="flex items-center gap-1 mb-2">
                  <input
                    type="text"
                    placeholder="New collection..."
                    value={newCollectionInput}
                    onChange={(e) => setNewCollectionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCollection();
                      }
                    }}
                    className="flex-1 px-2.5 py-1 text-xs border border-neutral-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={addCollection}
                    className="px-2 py-1 bg-black text-white text-xs rounded font-semibold"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5 flex-wrap">
                {collections.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-neutral-200"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => removeCollection(c)}
                      className="text-neutral-400 hover:text-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Tags</label>
              <div className="flex items-center gap-1 mb-2">
                <input
                  type="text"
                  placeholder="+ Add tags"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg"
                >
                  Add
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded flex items-center gap-1 border border-neutral-200"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-neutral-400 hover:text-black"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 5: THEME TEMPLATE */}
          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900">Theme template</h3>
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <select
              value={themeTemplate}
              onChange={(e) => setThemeTemplate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white"
            >
              <option value="Default product">Default product</option>
              <option value="Heavyweight Studio">Heavyweight Studio</option>
              <option value="Minimal Lookbook">Minimal Lookbook</option>
            </select>
          </div>
        </div>
      </main>

      {/* 3. STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-6 py-3 z-40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>{title ? `Editing "${title}"` : "Unsaved product"}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="px-6 py-2 bg-[#303030] hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Product Created!</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
