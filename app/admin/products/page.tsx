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
  Upload,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  Loader2,
  ArrowUpRight,
  Layers,
  FileText,
  Star,
  Copy,
  Wand2,
  SlidersHorizontal,
  Info,
} from "lucide-react";

interface BulkRowItem {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number;
  totalStock: number;
  sku: string;
  image: string;
  description?: string;
  isUploading?: boolean;
}

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

  // Add Product Modal & Bulk State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTab, setAddModalTab] = useState<"single" | "bulk_table" | "csv">("single");

  // Single Product Form & Device Image Upload
  const [newProd, setNewProd] = useState({
    name: "",
    slug: "",
    category: "hoodies",
    collectionName: "dimension-core",
    price: 110,
    compareAtPrice: 130,
    costPrice: 45,
    sku: `DIM-HOOD-${Date.now().toString().slice(-3)}`,
    description: "Architectural heavyweight streetwear silhouette meticulously crafted from 480 GSM organic loopback cotton. Features an oversized boxy drape, dropped shoulder seams, and double-layered hood.",
    shortDescription: "480 GSM heavyweight loopback fleece hoodie with architectural boxy drape.",
    fit: "Boxy oversized streetwear fit with dropped shoulders and relaxed sleeve volume.",
    material: "100% Combed Organic Cotton — 480 GSM Ultra-Heavyweight Loopback Knit.",
    care: "Machine wash cold at 30°C inside-out with like colors. Hang dry in shade.",
    shipping: "Dispatched from warehouse within 24h. Global express tracked courier 2-4 days.",
    image: "",
    totalStock: 50,
    featured: true,
    newArrival: true,
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Garment Size & Variant State
  const ALL_STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "One Size"];
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({
    S: 10,
    M: 15,
    L: 15,
    XL: 10,
  });
  const [customSizeInput, setCustomSizeInput] = useState("");

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        if (prev.length === 1) return prev; // keep at least 1 size
        const next = prev.filter((s) => s !== size);
        return next;
      } else {
        const next = [...prev, size];
        if (sizeStocks[size] === undefined) {
          setSizeStocks((st) => ({ ...st, [size]: 10 }));
        }
        return next;
      }
    });
  };

  const applySizePreset = (preset: "standard" | "extended" | "onesize" | "all") => {
    if (preset === "standard") {
      setSelectedSizes(["S", "M", "L", "XL"]);
      setSizeStocks({ S: 10, M: 15, L: 15, XL: 10 });
      setNewProd((p) => ({ ...p, totalStock: 50 }));
    } else if (preset === "extended") {
      setSelectedSizes(["XS", "S", "M", "L", "XL", "2XL"]);
      setSizeStocks({ XS: 5, S: 10, M: 15, L: 15, XL: 10, "2XL": 5 });
      setNewProd((p) => ({ ...p, totalStock: 60 }));
    } else if (preset === "onesize") {
      setSelectedSizes(["One Size"]);
      setSizeStocks({ "One Size": newProd.totalStock || 50 });
    } else if (preset === "all") {
      setSelectedSizes(["XS", "S", "M", "L", "XL", "2XL", "3XL"]);
      setSizeStocks({ XS: 5, S: 10, M: 15, L: 15, XL: 10, "2XL": 5, "3XL": 5 });
      setNewProd((p) => ({ ...p, totalStock: 65 }));
    }
  };

  const updateSizeStock = (size: string, stock: number) => {
    const val = Math.max(0, stock);
    setSizeStocks((prev) => {
      const updated = { ...prev, [size]: val };
      const sum = selectedSizes.reduce(
        (total, s) => total + (s === size ? val : (updated[s] ?? 10)),
        0
      );
      setNewProd((p) => ({ ...p, totalStock: sum }));
      return updated;
    });
  };

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customSizeInput.trim().toUpperCase();
    if (!clean) return;
    if (!selectedSizes.includes(clean)) {
      setSelectedSizes((prev) => [...prev, clean]);
      setSizeStocks((prev) => ({ ...prev, [clean]: 10 }));
      setNewProd((p) => ({ ...p, totalStock: p.totalStock + 10 }));
    }
    setCustomSizeInput("");
  };

  // Bulk Multi-Row Table State
  const [bulkRows, setBulkRows] = useState<BulkRowItem[]>([
    {
      id: "bulk-1",
      name: "Architectural Heavyweight Hoodie",
      category: "hoodies",
      price: 110,
      compareAtPrice: 130,
      totalStock: 50,
      sku: "DIM-HOOD-01",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
      description: "480 GSM heavyweight loopback cotton hoodie with dropped shoulders.",
    },
    {
      id: "bulk-2",
      name: "Vintage Acid Washed Graphic Tee",
      category: "t-shirts",
      price: 65,
      compareAtPrice: 75,
      totalStock: 60,
      sku: "DIM-TEE-01",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
      description: "260 GSM vintage acid-washed combed jersey with high ribbed collar.",
    },
    {
      id: "bulk-3",
      name: "Modular Cargo Tech Pants",
      category: "bottoms",
      price: 140,
      compareAtPrice: 165,
      totalStock: 35,
      sku: "DIM-CARGO-01",
      image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85",
      description: "Durable tactical ripstop trousers with 6 utility pockets and cinch cuffs.",
    },
  ]);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // CSV Bulk Import State
  const [csvProducts, setCsvProducts] = useState<any[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);

  // Product Edit Modal State
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products?all=true");
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

  // Upload image from user's device for Single Product
  const handleSingleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    setUploadError(null);
    try {
      const uploadedUrls: string[] = [];
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
          uploadedUrls.push(data.url);
        } else {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }
      }
      setUploadedImages((prev) => [...prev, ...uploadedUrls]);
      // Set main image if not currently set
      if (!newProd.image && uploadedUrls.length > 0) {
        setNewProd((p) => ({ ...p, image: uploadedUrls[0] }));
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeSingleImage = (index: number) => {
    setUploadedImages((prev) => {
      const target = prev[index];
      const next = prev.filter((_, i) => i !== index);
      if (newProd.image === target) {
        setNewProd((p) => ({ ...p, image: next[0] || "" }));
      }
      return next;
    });
  };

  const setAsMainImage = (url: string) => {
    setUploadedImages((prev) => [url, ...prev.filter((u) => u !== url)]);
    setNewProd((p) => ({ ...p, image: url }));
  };

  // Preset Description Generator for Streetwear
  const applyDescriptionPreset = (type: "hoodie" | "tee" | "cargo" | "jacket") => {
    if (type === "hoodie") {
      setNewProd((p) => ({
        ...p,
        category: "hoodies",
        description:
          "Architectural heavyweight streetwear silhouette meticulously crafted from 480 GSM organic loopback cotton. Features an oversized boxy drape, dropped shoulder seams, double-layered hood with ergonomic cross-over collar, and thick ribbed cuffs designed to maintain structural shape through daily rotation.",
        shortDescription: "480 GSM heavyweight loopback fleece hoodie with architectural boxy drape.",
        fit: "Boxy oversized streetwear fit with dropped shoulders and relaxed sleeve volume.",
        material: "100% Combed Organic Cotton — 480 GSM Ultra-Heavyweight Loopback Knit.",
        care: "Machine wash cold at 30°C inside-out with like colors. Hang dry in shade. Do not tumble dry. Cool iron avoiding embroidery.",
        shipping: "Dispatched from warehouse within 24 business hours. Global express tracked courier delivery in 2-4 days.",
      }));
    } else if (type === "tee") {
      setNewProd((p) => ({
        ...p,
        category: "t-shirts",
        description:
          "Vintage-washed heavyweight streetwear t-shirt constructed from 260 GSM combed cotton jersey. Individually enzyme treated for an authentic lived-in patina and ultra-soft tactile handfeel. Styled with a high ribbed collar, relaxed drop-shoulder cut, and reinforced twin-needle stitching at hem and sleeves.",
        shortDescription: "260 GSM vintage acid-washed heavyweight tee with relaxed drop shoulders.",
        fit: "Relaxed streetwear boxy cut, true to modern streetwear sizing.",
        material: "100% Ring-Spun Combed Cotton — 260 GSM Custom Vintage Dye Jersey.",
        care: "Machine wash cold with mild detergent. Do not bleach. Air dry flat to preserve garment wash tone.",
        shipping: "Standard global fulfillment. Tracked door-to-door delivery with live tracking.",
      }));
    } else if (type === "cargo") {
      setNewProd((p) => ({
        ...p,
        category: "bottoms",
        description:
          "Utilitarian technical cargo trousers engineered from abrasion-resistant cotton-ripstop blend. Features 6 ergonomic storage compartments including dual waterproof YKK zippered thigh pockets, modular bungee drawcords at leg openings for customizable silhouette adjustment, and reinforced gusseted crotch for unrestricted urban mobility.",
        shortDescription: "Technical ripstop streetwear cargo trousers with 6 modular utility pockets.",
        fit: "Straight-leg utility profile with adjustable bungee cinch ankles for tapered or relaxed styling.",
        material: "70% Cotton, 30% High-Density Tactical Nylon Ripstop.",
        care: "Machine wash warm inside-out. Fasten all zips and velcros prior to washing.",
        shipping: "Priority tracked courier shipping. Free exchanges on sizing within 14 days.",
      }));
    } else if (type === "jacket") {
      setNewProd((p) => ({
        ...p,
        category: "outerwear",
        description:
          "Technical streetwear bomber jacket crafted with a water-repellent flight nylon outer shell and lightweight thermal insulation. Features heavy-duty matte black industrial hardware, ribbed collar and waist, utility sleeve pocket with modular pull tab, and satin-quilted interior lining.",
        shortDescription: "Water-repellent technical bomber jacket with micro-quilted thermal insulation.",
        fit: "Structured cropped streetwear silhouette with comfortable room for layering over hoodies.",
        material: "Outer: 100% Weatherproof Flight Nylon. Lining: Quilted Polyester Satin with 80 GSM insulation.",
        care: "Wipe clean with damp cloth or professional dry clean only.",
        shipping: "Worldwide tracked courier with secure protective garment bag.",
      }));
    }
  };

  // Single product creation
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) {
      alert("Please enter a garment name.");
      return;
    }

    const finalImages =
      uploadedImages.length > 0
        ? uploadedImages
        : [
            newProd.image ||
              "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
          ];
    const mainImg = newProd.image || finalImages[0];

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProd,
          image: mainImg,
          images: finalImages,
          description: newProd.description,
          shortDescription: newProd.shortDescription || newProd.description.slice(0, 160),
          details: {
            fit: newProd.fit || "Relaxed oversized streetwear silhouette.",
            material: newProd.material || "100% Combed Cotton.",
            care: newProd.care || "Machine wash cold inside-out.",
            shipping: newProd.shipping || "Express courier shipping worldwide.",
          },
          slug:
            newProd.slug ||
            newProd.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") +
              "-" +
              Date.now().toString().slice(-4),
          variants: selectedSizes.map((sz) => ({
            sku: `${newProd.sku}-${sz}`,
            color: "Pitch Black",
            size: sz,
            price: newProd.price,
            stock:
              sizeStocks[sz] !== undefined
                ? sizeStocks[sz]
                : Math.max(0, Math.round(newProd.totalStock / Math.max(1, selectedSizes.length))),
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts([data.product, ...products]);
        setShowAddModal(false);
        setBulkSuccessMsg(`Successfully published garment "${data.product.name}"!`);
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
          shortDescription: "Heavyweight streetwear cut tailored with clean geometric lines.",
          fit: "Boxy oversized streetwear cut with dropped shoulders.",
          material: "100% Combed Organic Cotton (480 GSM Loopback French Terry).",
          care: "Machine wash cold inside-out. Hang dry in shade. Do not iron directly on print.",
          shipping: "Orders dispatched within 24h. Express tracked global courier.",
          image: "",
          totalStock: 50,
          featured: true,
          newArrival: true,
        });
        setUploadedImages([]);
        setSelectedSizes(["S", "M", "L", "XL"]);
        setSizeStocks({ S: 10, M: 15, L: 15, XL: 10 });
      } else {
        const errData = await res.json();
        alert(errData?.error || "Error adding product");
      }
    } catch {
      alert("Error adding product");
    }
  };

  // Edit Product Modal Handlers
  const openEditModal = (product: Product) => {
    setProductToEdit(product);
    setEditFormData({
      name: product.name,
      category: product.category,
      collectionName: product.collectionName || "dimension-core",
      price: product.price,
      compareAtPrice: product.compareAtPrice || "",
      costPrice: product.costPrice || "",
      totalStock: product.totalStock,
      sku: product.sku,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      fit: product.details?.fit || "Relaxed oversized streetwear silhouette.",
      material: product.details?.material || "100% Combed Cotton.",
      care: product.details?.care || "Machine wash cold inside-out.",
      shipping: product.details?.shipping || "Express courier shipping worldwide.",
      image: product.images?.[0] || "",
      images:
        product.images && product.images.length > 0
          ? product.images
          : [],
      featured: Boolean(product.featured),
      bestSeller: Boolean(product.bestSeller),
      newArrival: Boolean(product.newArrival),
    });
  };

  const handleEditImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editFormData) return;
    setIsUploadingEditImage(true);
    try {
      const newUrls: string[] = [];
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
          newUrls.push(data.url);
        }
      }
      setEditFormData((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), ...newUrls],
        image: prev.image || newUrls[0] || "",
      }));
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploadingEditImage(false);
    }
  };

  const removeEditImage = (index: number) => {
    if (!editFormData) return;
    const target = editFormData.images[index];
    const filtered = editFormData.images.filter((_: any, i: number) => i !== index);
    setEditFormData((prev: any) => ({
      ...prev,
      images: filtered,
      image: prev.image === target ? filtered[0] || "" : prev.image,
    }));
  };

  const setAsEditMainImage = (url: string) => {
    if (!editFormData) return;
    setEditFormData((prev: any) => ({
      ...prev,
      image: url,
      images: [url, ...prev.images.filter((u: string) => u !== url)],
    }));
  };

  const applyEditDescriptionPreset = (type: "hoodie" | "tee" | "cargo" | "jacket") => {
    if (!editFormData) return;
    if (type === "hoodie") {
      setEditFormData((p: any) => ({
        ...p,
        description:
          "Architectural heavyweight streetwear silhouette meticulously crafted from 480 GSM organic loopback cotton. Features an oversized boxy drape, dropped shoulder seams, double-layered hood with ergonomic cross-over collar, and thick ribbed cuffs.",
        shortDescription: "480 GSM heavyweight loopback fleece hoodie with architectural boxy drape.",
        fit: "Boxy oversized streetwear fit with dropped shoulders and relaxed sleeve volume.",
        material: "100% Combed Organic Cotton — 480 GSM Ultra-Heavyweight Loopback Knit.",
        care: "Machine wash cold at 30°C inside-out with like colors. Hang dry in shade.",
        shipping: "Dispatched within 24h. Express tracked global courier 2-4 days.",
      }));
    } else if (type === "tee") {
      setEditFormData((p: any) => ({
        ...p,
        description:
          "Vintage-washed heavyweight streetwear t-shirt constructed from 260 GSM combed cotton jersey. Individually enzyme treated for an authentic lived-in patina and ultra-soft tactile handfeel. Styled with a high ribbed collar, relaxed drop-shoulder cut, and reinforced twin-needle stitching.",
        shortDescription: "260 GSM vintage acid-washed heavyweight tee with relaxed drop shoulders.",
        fit: "Relaxed streetwear boxy cut, true to modern streetwear sizing.",
        material: "100% Ring-Spun Combed Cotton — 260 GSM Custom Vintage Dye Jersey.",
        care: "Machine wash cold with mild detergent. Air dry flat to preserve garment wash tone.",
        shipping: "Standard global fulfillment. Tracked door-to-door delivery.",
      }));
    } else if (type === "cargo") {
      setEditFormData((p: any) => ({
        ...p,
        description:
          "Utilitarian technical cargo trousers engineered from abrasion-resistant cotton-ripstop blend. Features 6 ergonomic storage compartments including dual waterproof YKK zippered thigh pockets, modular bungee drawcords at leg openings, and reinforced gusseted crotch.",
        shortDescription: "Technical ripstop streetwear cargo trousers with 6 modular utility pockets.",
        fit: "Straight-leg utility profile with adjustable bungee cinch ankles for tapered or relaxed styling.",
        material: "70% Cotton, 30% High-Density Tactical Nylon Ripstop.",
        care: "Machine wash warm inside-out. Fasten all zips and velcros prior to washing.",
        shipping: "Priority tracked courier shipping. Free exchanges on sizing within 14 days.",
      }));
    } else if (type === "jacket") {
      setEditFormData((p: any) => ({
        ...p,
        description:
          "Technical streetwear bomber jacket crafted with a water-repellent flight nylon outer shell and lightweight thermal insulation. Features heavy-duty matte black industrial hardware, utility sleeve pocket with modular pull tab, and satin-quilted interior lining.",
        shortDescription: "Water-repellent technical bomber jacket with micro-quilted thermal insulation.",
        fit: "Structured cropped streetwear silhouette with comfortable room for layering.",
        material: "Outer: 100% Weatherproof Flight Nylon. Lining: Quilted Polyester Satin with 80 GSM insulation.",
        care: "Wipe clean with damp cloth or professional dry clean only.",
        shipping: "Worldwide tracked courier with secure protective garment bag.",
      }));
    }
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit || !editFormData) return;
    setIsSavingEdit(true);

    try {
      const payload = {
        name: editFormData.name,
        category: editFormData.category,
        collectionName: editFormData.collectionName,
        price: Number(editFormData.price) || 0,
        compareAtPrice: editFormData.compareAtPrice ? Number(editFormData.compareAtPrice) : undefined,
        costPrice: editFormData.costPrice ? Number(editFormData.costPrice) : undefined,
        totalStock: Number(editFormData.totalStock) || 0,
        sku: editFormData.sku,
        description: editFormData.description,
        shortDescription: editFormData.shortDescription || editFormData.description.slice(0, 160),
        details: {
          fit: editFormData.fit,
          material: editFormData.material,
          care: editFormData.care,
          shipping: editFormData.shipping,
        },
        image: editFormData.images?.[0] || editFormData.image,
        images:
          editFormData.images && editFormData.images.length > 0
            ? editFormData.images
            : [editFormData.image].filter(Boolean),
        featured: editFormData.featured,
        bestSeller: editFormData.bestSeller,
        newArrival: editFormData.newArrival,
      };

      const res = await fetch(`/api/products/${productToEdit._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productToEdit._id ? { ...p, ...payload } : p))
        );
        setProductToEdit(null);
        setEditFormData(null);
        setBulkSuccessMsg(`Updated garment "${payload.name}" and description successfully!`);
        setTimeout(() => setBulkSuccessMsg(null), 3500);
      } else {
        alert(data.error || "Failed to update product.");
      }
    } catch (err: any) {
      alert(err.message || "Network error while updating product.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Bulk Multi-Row Table Helpers
  const addBulkRow = () => {
    const nextIdx = bulkRows.length + 1;
    setBulkRows((prev) => [
      ...prev,
      {
        id: `bulk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: "",
        category: "hoodies",
        price: 110,
        compareAtPrice: 130,
        totalStock: 50,
        sku: `DIM-ITEM-${Date.now().toString().slice(-3)}-${nextIdx}`,
        image: "",
      },
    ]);
  };

  const removeBulkRow = (id: string) => {
    if (bulkRows.length <= 1) {
      alert("You must have at least one product row.");
      return;
    }
    setBulkRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateBulkRow = (id: string, field: keyof BulkRowItem, value: any) => {
    setBulkRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleBulkRowImageUpload = async (rowId: string, file: File | null) => {
    if (!file) return;
    setBulkRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, isUploading: true } : r))
    );
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setBulkRows((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, image: data.url, isUploading: false } : r
          )
        );
      } else {
        alert(data.error || "Failed to upload image for this row.");
        setBulkRows((prev) =>
          prev.map((r) => (r.id === rowId ? { ...r, isUploading: false } : r))
        );
      }
    } catch (err: any) {
      alert(err.message || "Upload failed.");
      setBulkRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, isUploading: false } : r))
      );
    }
  };

  const handleBulkRowsSubmit = async () => {
    const validRows = bulkRows.filter((r) => r.name.trim().length > 0);
    if (validRows.length === 0) {
      alert("Please enter a name for at least one garment row.");
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const payload = validRows.map((r) => ({
        name: r.name.trim(),
        category: r.category,
        price: Number(r.price) || 50,
        compareAtPrice: r.compareAtPrice ? Number(r.compareAtPrice) : undefined,
        totalStock: Number(r.totalStock) || 50,
        sku: r.sku || `DIM-${Date.now().toString().slice(-4)}`,
        image:
          r.image ||
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
        images: [
          r.image ||
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
        ],
        description:
          r.description && r.description.trim()
            ? r.description.trim()
            : `Premium streetwear garment: ${r.name.trim()}`,
      }));

      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: payload }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => [...data.products, ...prev]);
        setShowAddModal(false);
        setBulkSuccessMsg(`Successfully published ${data.count} new products!`);
        setBulkRows([
          {
            id: `bulk-${Date.now()}-1`,
            name: "",
            category: "hoodies",
            price: 110,
            compareAtPrice: 130,
            totalStock: 50,
            sku: `DIM-HOOD-${Date.now().toString().slice(-3)}`,
            image: "",
          },
        ]);
      } else {
        alert(data.error || "Failed to create products in bulk.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to publish products.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // CSV Import Helpers
  const downloadSampleCsv = () => {
    const headers = "name,category,price,compareAtPrice,totalStock,sku,image,description";
    const sampleRows = [
      '"Heavyweight Oversized Hoodie",hoodies,110,130,50,DIM-HOOD-01,"https://images.unsplash.com/photo-1556905055-8f358a7a47b2","Heavyweight 480 GSM organic cotton knit"',
      '"Acid Wash Graphic Tee",t-shirts,65,75,40,DIM-TEE-01,"https://images.unsplash.com/photo-1521572267360-ee0c2909d518","Vintage wash graphic t-shirt"',
      '"Tactical Cargo Pants",bottoms,140,165,30,DIM-CARGO-01,"https://images.unsplash.com/photo-1517445312882-bc9910d016b7","Utilitarian streetwear cargo pants"',
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...sampleRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dimension_products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvFileChange = (file: File | null) => {
    if (!file) return;
    setCsvFileName(file.name);
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;

        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setCsvProducts(parsed);
          } else {
            setCsvError("JSON must contain an array of products.");
          }
          return;
        }

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setCsvError("CSV file must have a header row and at least one data row.");
          return;
        }

        const parseLine = (line: string) => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(current.trim().replace(/^"|"$/g, ""));
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim().replace(/^"|"$/g, ""));
          return result;
        };

        const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
        const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("title"));
        const priceIdx = headers.findIndex((h) => h.includes("price") && !h.includes("compare"));
        const compareIdx = headers.findIndex((h) => h.includes("compare"));
        const catIdx = headers.findIndex((h) => h.includes("cat"));
        const stockIdx = headers.findIndex((h) => h.includes("stock") || h.includes("qty"));
        const skuIdx = headers.findIndex((h) => h.includes("sku"));
        const imgIdx = headers.findIndex(
          (h) => h.includes("image") || h.includes("photo") || h.includes("url")
        );
        const descIdx = headers.findIndex((h) => h.includes("desc"));

        const items: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]);
          if (!cols || cols.length === 0 || !cols[nameIdx >= 0 ? nameIdx : 0]) continue;
          items.push({
            name: cols[nameIdx >= 0 ? nameIdx : 0] || "Streetwear Garment",
            price:
              priceIdx >= 0 && cols[priceIdx]
                ? parseFloat(cols[priceIdx]) || 50
                : 50,
            compareAtPrice:
              compareIdx >= 0 && cols[compareIdx]
                ? parseFloat(cols[compareIdx])
                : undefined,
            category: catIdx >= 0 && cols[catIdx] ? cols[catIdx] : "hoodies",
            totalStock:
              stockIdx >= 0 && cols[stockIdx]
                ? parseInt(cols[stockIdx]) || 40
                : 40,
            sku:
              skuIdx >= 0 && cols[skuIdx]
                ? cols[skuIdx]
                : `DIM-CSV-${Date.now().toString().slice(-4)}-${i}`,
            image:
              imgIdx >= 0 && cols[imgIdx]
                ? cols[imgIdx]
                : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
            description: descIdx >= 0 && cols[descIdx] ? cols[descIdx] : "",
          });
        }

        if (items.length === 0) {
          setCsvError("No valid product rows found in the CSV.");
        } else {
          setCsvProducts(items);
        }
      } catch (err: any) {
        setCsvError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImportSubmit = async () => {
    if (csvProducts.length === 0) return;
    setIsImportingCsv(true);
    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: csvProducts }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => [...data.products, ...prev]);
        setShowAddModal(false);
        setBulkSuccessMsg(
          `Successfully imported ${data.count} products from ${csvFileName}!`
        );
        setCsvProducts([]);
        setCsvFileName("");
      } else {
        alert(data.error || "Failed to import products.");
      }
    } catch (err: any) {
      alert(err.message || "Network error while importing.");
    } finally {
      setIsImportingCsv(false);
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
            onClick={() => {
              setAddModalTab("single");
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-pink-400" />
            <span>Add Product</span>
          </button>

          {/* Bulk Upload Button */}
          <button
            type="button"
            onClick={() => {
              setAddModalTab("bulk_table");
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>Bulk Upload</span>
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
                Array.from({ length: 7 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <div className="w-4 h-4 bg-neutral-200 rounded"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-neutral-200 rounded-md shrink-0"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-neutral-200 rounded w-44"></div>
                          <div className="h-3 bg-neutral-100 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-neutral-200 rounded w-20"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-neutral-200 rounded w-16"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-neutral-200 rounded w-14"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-neutral-200 rounded w-12"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-5 bg-neutral-200 rounded-full w-20"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-8 bg-neutral-200 rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
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
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-neutral-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Edit garment & description"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
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

      {/* MODAL 5: Product Upload Studio (Single, Bulk Fast Table & CSV Importer) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            className={`bg-white rounded-2xl w-full p-6 space-y-4 my-8 shadow-2xl border border-neutral-200 transition-all ${
              addModalTab === "single" ? "max-w-3xl" : "max-w-5xl"
            }`}
          >
            {/* Header with Title & Tab Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-pink-500" />
                  <span>Product Upload Studio</span>
                </h3>
                <p className="text-xs text-neutral-500 font-sans mt-0.5">
                  Upload high-res product photos from your device & publish single or multiple garments
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAddModalTab("single")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    addModalTab === "single"
                      ? "bg-white text-black shadow-xs font-black"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-pink-500" />
                  <span>Single Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddModalTab("bulk_table")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    addModalTab === "bulk_table"
                      ? "bg-white text-black shadow-xs font-black"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Bulk Multi-Row</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddModalTab("csv")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    addModalTab === "csv"
                      ? "bg-white text-black shadow-xs font-black"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>CSV Spreadsheet</span>
                </button>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-black ml-2 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB 1: Single Product with Device Image Uploader */}
            {addModalTab === "single" && (
              <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
                {/* Device Image Uploader Section */}
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-neutral-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-pink-500" />
                        <span>Product Images (From Device)</span>
                      </span>
                      <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                        Upload 1 or more photos. The first image is used as the main cover photo.
                      </p>
                    </div>
                    {uploadedImages.length > 0 && (
                      <span className="text-[11px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">
                        {uploadedImages.length} image{uploadedImages.length > 1 ? "s" : ""} uploaded
                      </span>
                    )}
                  </div>

                  {/* Dropzone / Upload button */}
                  <label className="relative border-2 border-dashed border-neutral-300 hover:border-black bg-white rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingImage}
                      onChange={(e) => handleSingleImageUpload(e.target.files)}
                      className="sr-only"
                    />
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2 text-neutral-600">
                        <Loader2 className="w-6 h-6 animate-spin text-black" />
                        <span className="font-bold text-xs">Uploading images...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
                          <Upload className="w-5 h-5 text-neutral-700 group-hover:text-black" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-neutral-800">
                            Click to browse or drag & drop images
                          </span>
                          <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                            Supports JPG, PNG, WEBP, AVIF (Multiple files allowed)
                          </p>
                        </div>
                      </div>
                    )}
                  </label>

                  {uploadError && (
                    <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Live Thumbnails Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                      {uploadedImages.map((url, idx) => (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 group bg-neutral-100 ${
                            idx === 0
                              ? "border-pink-500 shadow-xs"
                              : "border-neutral-200"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Main
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                title="Set as main cover"
                                onClick={() => setAsMainImage(url)}
                                className="p-1 bg-white/90 hover:bg-white text-black rounded text-[9px] font-bold shadow-xs cursor-pointer"
                              >
                                Cover
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete photo"
                              onClick={() => removeSingleImage(idx)}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shadow-xs cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback Image URL input */}
                  <div className="pt-2">
                    <label className="block text-[11px] text-neutral-500 uppercase font-bold mb-1">
                      Or Direct Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newProd.image}
                      onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded font-mono text-[11px] focus:outline-none focus:border-black bg-white"
                    />
                  </div>
                </div>

                {/* Garment Details Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-neutral-600 uppercase font-bold mb-1">
                      Garment Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Architectural Heavyweight Hoodie 480 GSM"
                      value={newProd.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewProd({
                          ...newProd,
                          name: val,
                          sku:
                            newProd.sku === `DIM-HOOD-${Date.now().toString().slice(-3)}` || !newProd.sku
                              ? `DIM-${val.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X")}-${Date.now().toString().slice(-3)}`
                              : newProd.sku,
                        });
                      }}
                      className="w-full px-3 py-2 border rounded font-sans focus:outline-none focus:border-black text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 uppercase font-bold mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      required
                      value={newProd.sku}
                      onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 uppercase font-bold mb-1">
                      Category
                    </label>
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
                    <label className="block text-neutral-600 uppercase font-bold mb-1">
                      Price ($ USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newProd.price}
                      onChange={(e) =>
                        setNewProd({ ...newProd, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 uppercase font-bold mb-1">
                      Compare-At Price ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newProd.compareAtPrice || ""}
                      onChange={(e) =>
                        setNewProd({
                          ...newProd,
                          compareAtPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 uppercase font-bold mb-1">
                      Total Stock
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newProd.totalStock}
                      onChange={(e) =>
                        setNewProd({ ...newProd, totalStock: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 uppercase font-bold mb-1">
                      Collection
                    </label>
                    <input
                      type="text"
                      value={newProd.collectionName}
                      onChange={(e) => setNewProd({ ...newProd, collectionName: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Garment Sizes & Inventory Distribution (XS, S, M, L, XL, 2XL, etc.) */}
                  <div className="col-span-2 pt-3 border-t border-neutral-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-neutral-800 uppercase font-black text-xs tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                          Available Sizes & Stock Distribution
                        </label>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Click to toggle sizes on/off or add custom numbers (e.g. 28, 30, 32 for pants).
                        </p>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase mr-1">Presets:</span>
                        <button
                          type="button"
                          onClick={() => applySizePreset("standard")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          S, M, L, XL
                        </button>
                        <button
                          type="button"
                          onClick={() => applySizePreset("extended")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          XS – 2XL
                        </button>
                        <button
                          type="button"
                          onClick={() => applySizePreset("onesize")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          One Size
                        </button>
                        <button
                          type="button"
                          onClick={() => applySizePreset("all")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          All
                        </button>
                      </div>
                    </div>

                    {/* Size Pills Toggle Row */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {ALL_STANDARD_SIZES.map((size) => {
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`h-9 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                              isSelected
                                ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                                : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900 hover:text-black"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                            {size}
                          </button>
                        );
                      })}

                      {/* Custom Size Adder */}
                      <div className="flex items-center gap-1 ml-auto">
                        <input
                          type="text"
                          placeholder="Add size..."
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomSize();
                            }
                          }}
                          className="w-24 px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-black"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomSize()}
                          className="h-8 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Per-Size Stock Grid */}
                    <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase text-neutral-500 pb-1 border-b border-neutral-200">
                        <span>Active Sizes Stock Breakdown</span>
                        <span className="font-mono text-neutral-700">
                          Total: {newProd.totalStock} units across {selectedSizes.length} sizes
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                        {selectedSizes.map((size) => (
                          <div
                            key={size}
                            className="bg-white p-2 rounded-lg border border-neutral-200 shadow-xs flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-900 rounded">
                                {size}
                              </span>
                              {selectedSizes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => toggleSize(size)}
                                  className="text-neutral-400 hover:text-red-500 text-[10px] p-0.5 cursor-pointer"
                                  title={`Remove size ${size}`}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={sizeStocks[size] ?? 10}
                                onChange={(e) => updateSizeStock(size, parseInt(e.target.value) || 0)}
                                className="w-full text-center px-1 py-1 border border-neutral-200 rounded text-xs font-mono font-bold focus:outline-none focus:border-black"
                              />
                              <span className="text-[10px] text-neutral-400">pcs</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Product Story & Rich Description Suite */}
                  <div className="col-span-2 pt-3 border-t border-neutral-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-pink-500" />
                        <span className="text-xs font-bold uppercase text-neutral-900">
                          Garment Story & Description Suite
                        </span>
                      </div>

                      {/* Streetwear Auto-Presets */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-bold">
                          <Wand2 className="w-3 h-3 text-indigo-500" /> Presets:
                        </span>
                        <button
                          type="button"
                          onClick={() => applyDescriptionPreset("hoodie")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Hoodie
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDescriptionPreset("tee")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          T-Shirt
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDescriptionPreset("cargo")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Cargo
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDescriptionPreset("jacket")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Jacket
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-neutral-600 uppercase font-bold text-[11px]">
                          Main Product Description *
                        </label>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {newProd.description.length} chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={newProd.description}
                        onChange={(e) =>
                          setNewProd({ ...newProd, description: e.target.value })
                        }
                        placeholder="Detailed garment story, fabric milling, silhouette drape, and styling details..."
                        className="w-full px-3 py-2 border rounded font-sans focus:outline-none focus:border-black text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-600 uppercase font-bold mb-1 text-[11px]">
                        Short Summary (Card Highlight & SEO)
                      </label>
                      <input
                        type="text"
                        value={newProd.shortDescription}
                        onChange={(e) =>
                          setNewProd({ ...newProd, shortDescription: e.target.value })
                        }
                        placeholder="e.g. 480 GSM loopback cotton hoodie with architectural boxy drape."
                        className="w-full px-3 py-1.5 border rounded font-sans text-xs focus:outline-none focus:border-black"
                      />
                    </div>

                    {/* Streetwear Technical Garment Specifications */}
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                      <span className="text-[11px] font-bold uppercase text-neutral-700 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Technical Garment Specifications (Shown in Storefront Accordions)</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-neutral-500 uppercase font-bold text-[10px] mb-0.5">
                            Material & Fabric GSM
                          </label>
                          <input
                            type="text"
                            value={newProd.material}
                            onChange={(e) =>
                              setNewProd({ ...newProd, material: e.target.value })
                            }
                            placeholder="e.g. 100% Combed Cotton, 480 GSM Loopback Knit"
                            className="w-full px-2.5 py-1.5 bg-white border rounded text-[11px] focus:outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="block text-neutral-500 uppercase font-bold text-[10px] mb-0.5">
                            Fit & Silhouette Profile
                          </label>
                          <input
                            type="text"
                            value={newProd.fit}
                            onChange={(e) =>
                              setNewProd({ ...newProd, fit: e.target.value })
                            }
                            placeholder="e.g. Boxy oversized cut, dropped shoulders"
                            className="w-full px-2.5 py-1.5 bg-white border rounded text-[11px] focus:outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="block text-neutral-500 uppercase font-bold text-[10px] mb-0.5">
                            Washing & Care Instructions
                          </label>
                          <input
                            type="text"
                            value={newProd.care}
                            onChange={(e) =>
                              setNewProd({ ...newProd, care: e.target.value })
                            }
                            placeholder="e.g. Machine wash cold, hang dry in shade"
                            className="w-full px-2.5 py-1.5 bg-white border rounded text-[11px] focus:outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="block text-neutral-500 uppercase font-bold text-[10px] mb-0.5">
                            Shipping & Delivery Policy
                          </label>
                          <input
                            type="text"
                            value={newProd.shipping}
                            onChange={(e) =>
                              setNewProd({ ...newProd, shipping: e.target.value })
                            }
                            placeholder="e.g. Dispatched in 24h, tracked global courier"
                            className="w-full px-2.5 py-1.5 bg-white border rounded text-[11px] focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges Toggles */}
                  <div className="col-span-2 flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-sans text-xs">
                      <input
                        type="checkbox"
                        checked={newProd.featured}
                        onChange={(e) => setNewProd({ ...newProd, featured: e.target.checked })}
                        className="rounded"
                      />
                      <span>Featured Garment</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-sans text-xs">
                      <input
                        type="checkbox"
                        checked={newProd.newArrival}
                        onChange={(e) => setNewProd({ ...newProd, newArrival: e.target.checked })}
                        className="rounded"
                      />
                      <span>New Arrival</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-neutral-300 rounded font-bold uppercase text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingImage}
                    className="px-6 py-2 bg-black hover:bg-neutral-800 text-white rounded font-bold uppercase shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-pink-400" />
                    <span>Publish Garment</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Multiple Products Fast Multi-Row Form */}
            {addModalTab === "bulk_table" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between bg-violet-50 p-3 rounded-xl border border-violet-200">
                  <div className="flex items-center gap-2 text-violet-900 font-sans">
                    <Layers className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>
                      Add multiple garments simultaneously. Upload images per item directly from your device.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addBulkRow}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                {/* Multi-Row Table */}
                <div className="overflow-x-auto border border-neutral-200 rounded-xl max-h-[50vh]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-neutral-100 border-b border-neutral-200 sticky top-0 z-10 uppercase text-neutral-600">
                      <tr>
                        <th className="p-2.5 w-20">Image</th>
                        <th className="p-2.5 min-w-[180px]">Garment Name *</th>
                        <th className="p-2.5 w-28">Category</th>
                        <th className="p-2.5 w-20">Price ($)</th>
                        <th className="p-2.5 w-20">Compare ($)</th>
                        <th className="p-2.5 w-20">Stock</th>
                        <th className="p-2.5 w-24">SKU</th>
                        <th className="p-2.5 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {bulkRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                          {/* Image cell with device uploader */}
                          <td className="p-2">
                            <div className="flex items-center gap-1.5">
                              <label
                                className={`relative w-10 h-10 rounded border flex items-center justify-center cursor-pointer overflow-hidden group ${
                                  row.image ? "border-neutral-300" : "border-dashed border-neutral-400 bg-neutral-50 hover:bg-neutral-100"
                                }`}
                                title="Upload product photo"
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={row.isUploading}
                                  onChange={(e) =>
                                    handleBulkRowImageUpload(
                                      row.id,
                                      e.target.files ? e.target.files[0] : null
                                    )
                                  }
                                  className="sr-only"
                                />
                                {row.isUploading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                                ) : row.image ? (
                                  <>
                                    <img
                                      src={row.image}
                                      alt="Item"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Upload className="w-3 h-3 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <Upload className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black" />
                                )}
                              </label>
                            </div>
                          </td>

                          {/* Name */}
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="e.g. Acid Wash Tee"
                              value={row.name}
                              onChange={(e) => updateBulkRow(row.id, "name", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs font-sans focus:outline-none focus:border-black"
                            />
                          </td>

                          {/* Category */}
                          <td className="p-2">
                            <select
                              value={row.category}
                              onChange={(e) => updateBulkRow(row.id, "category", e.target.value)}
                              className="w-full px-1.5 py-1 border rounded uppercase text-[11px] bg-white focus:outline-none focus:border-black"
                            >
                              <option value="hoodies">hoodies</option>
                              <option value="t-shirts">t-shirts</option>
                              <option value="bottoms">bottoms</option>
                              <option value="outerwear">outerwear</option>
                              <option value="accessories">accessories</option>
                            </select>
                          </td>

                          {/* Price */}
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              value={row.price}
                              onChange={(e) =>
                                updateBulkRow(row.id, "price", parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:border-black"
                            />
                          </td>

                          {/* Compare At Price */}
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              value={row.compareAtPrice || ""}
                              onChange={(e) =>
                                updateBulkRow(
                                  row.id,
                                  "compareAtPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:border-black"
                            />
                          </td>

                          {/* Stock */}
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              value={row.totalStock}
                              onChange={(e) =>
                                updateBulkRow(
                                  row.id,
                                  "totalStock",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:border-black"
                            />
                          </td>

                          {/* SKU */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.sku}
                              onChange={(e) => updateBulkRow(row.id, "sku", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-[10px] focus:outline-none focus:border-black"
                            />
                          </td>

                          {/* Remove */}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeBulkRow(row.id)}
                              className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addBulkRow}
                      className="px-3 py-1.5 border border-neutral-300 rounded font-bold uppercase text-[11px] hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Row</span>
                    </button>
                    <span className="text-neutral-500 text-[11px]">
                      {bulkRows.length} item{bulkRows.length > 1 ? "s" : ""} queued
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-neutral-300 rounded font-bold uppercase text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingBulk}
                      onClick={handleBulkRowsSubmit}
                      className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded font-bold uppercase shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmittingBulk ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Publish All ({bulkRows.length}) Garments</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CSV / JSON Bulk Spreadsheet Importer */}
            {addModalTab === "csv" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-emerald-900 text-xs uppercase flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Bulk Spreadsheet Importer</span>
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-sans mt-0.5">
                      Upload a CSV or JSON file containing product names, categories, prices, images, and stocks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadSampleCsv}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sample CSV</span>
                  </button>
                </div>

                {/* File Dropzone */}
                <label className="border-2 border-dashed border-neutral-300 hover:border-black bg-neutral-50 hover:bg-white rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept=".csv, .json, text/csv, application/json"
                    onChange={(e) =>
                      handleCsvFileChange(e.target.files ? e.target.files[0] : null)
                    }
                    className="sr-only"
                  />
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="font-bold text-xs text-neutral-800">
                    {csvFileName ? `Selected: ${csvFileName}` : "Click to choose CSV or JSON file"}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-sans mt-1">
                    Accepts comma-separated .csv or .json files
                  </span>
                </label>

                {csvError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{csvError}</span>
                  </div>
                )}

                {/* Parsed CSV Preview Table */}
                {csvProducts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-[11px] text-neutral-700">
                        Detected Products ({csvProducts.length})
                      </span>
                      <span className="text-[11px] text-emerald-600 font-bold">Ready to import</span>
                    </div>

                    <div className="overflow-x-auto border border-neutral-200 rounded-xl max-h-48">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead className="bg-neutral-100 border-b uppercase text-neutral-600 sticky top-0">
                          <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Stock</th>
                            <th className="p-2">SKU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 bg-white">
                          {csvProducts.slice(0, 10).map((item, i) => (
                            <tr key={i} className="hover:bg-neutral-50">
                              <td className="p-2 font-sans font-bold">{item.name}</td>
                              <td className="p-2 uppercase">{item.category}</td>
                              <td className="p-2">${item.price}</td>
                              <td className="p-2">{item.totalStock}</td>
                              <td className="p-2 text-[10px] text-neutral-500">{item.sku}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {csvProducts.length > 10 && (
                      <p className="text-[10px] text-neutral-400 italic">
                        Showing first 10 of {csvProducts.length} items. All will be imported.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-neutral-300 rounded font-bold uppercase text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={csvProducts.length === 0 || isImportingCsv}
                    onClick={handleCsvImportSubmit}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold uppercase shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isImportingCsv ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Import ({csvProducts.length}) Garments</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* MODAL 6: Edit Garment & Full Description Suite Modal */}
      {productToEdit && editFormData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 space-y-4 my-8 shadow-2xl border border-neutral-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>Edit Garment & Description</span>
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {editFormData.name} ({editFormData.sku})
                </span>
              </div>
              <button
                onClick={() => {
                  setProductToEdit(null);
                  setEditFormData(null);
                }}
                className="p-1 text-neutral-400 hover:text-black rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4 text-xs font-mono">
              {/* Product Photos in Edit Modal */}
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-neutral-800 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>Garment Photos</span>
                  </span>
                  <label className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 rounded text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-xs">
                    <Upload className="w-3 h-3" />
                    <span>Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingEditImage}
                      onChange={(e) => handleEditImageUpload(e.target.files)}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Thumbnails */}
                {editFormData.images && editFormData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {editFormData.images.map((imgUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 group bg-neutral-100 ${
                          idx === 0 ? "border-pink-500 shadow-xs" : "border-neutral-200"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Edit img ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-0.5 left-0.5 bg-pink-500 text-white text-[8px] font-bold px-1 py-0.2 rounded">
                            Main
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setAsEditMainImage(imgUrl)}
                              className="p-1 bg-white text-black text-[8px] font-bold rounded"
                              title="Make Cover"
                            >
                              Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeEditImage(idx)}
                            className="p-1 bg-red-600 text-white rounded"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Basic Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-4">
                  <label className="block text-neutral-600 uppercase font-bold mb-1">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border rounded font-sans focus:outline-none focus:border-black text-sm"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 border rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">
                    Compare Price ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.compareAtPrice}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        compareAtPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 border rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">
                    Total Stock
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.totalStock}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        totalStock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 border rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, category: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border rounded bg-white uppercase focus:outline-none focus:border-black"
                  >
                    <option value="hoodies">hoodies</option>
                    <option value="t-shirts">t-shirts</option>
                    <option value="bottoms">bottoms</option>
                    <option value="outerwear">outerwear</option>
                    <option value="accessories">accessories</option>
                  </select>
                </div>
              </div>

              {/* Description & Technical Specifications Suite */}
              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-neutral-800 flex items-center gap-1.5 text-xs">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Product Description & Specifications</span>
                  </span>

                  {/* Preset Auto-filler */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-neutral-400 font-bold">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyEditDescriptionPreset("hoodie")}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Hoodie
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEditDescriptionPreset("tee")}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Tee
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEditDescriptionPreset("cargo")}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Cargo
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEditDescriptionPreset("jacket")}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-black hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Jacket
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-600 uppercase font-bold text-[11px]">
                      Full Product Description
                    </label>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {editFormData.description?.length || 0} chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded font-sans focus:outline-none focus:border-black text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 uppercase font-bold mb-1 text-[11px]">
                    Short Summary (Card & SEO)
                  </label>
                  <input
                    type="text"
                    value={editFormData.shortDescription}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, shortDescription: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border rounded font-sans text-xs focus:outline-none focus:border-black"
                  />
                </div>

                {/* Technical Accordion Details */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-neutral-500 uppercase font-bold text-[10px] mb-0.5">
                      Material / Fabric
                    </label>
                    <input
                      type="text"
                      value={editFormData.material}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, material: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded text-[11px] focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-500 uppercase font-bold text-[10px] mb-0.5">
                      Fit Profile
                    </label>
                    <input
                      type="text"
                      value={editFormData.fit}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, fit: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded text-[11px] focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-500 uppercase font-bold text-[10px] mb-0.5">
                      Care Instructions
                    </label>
                    <input
                      type="text"
                      value={editFormData.care}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, care: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded text-[11px] focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-500 uppercase font-bold text-[10px] mb-0.5">
                      Shipping Details
                    </label>
                    <input
                      type="text"
                      value={editFormData.shipping}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, shipping: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded text-[11px] focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs">
                  <input
                    type="checkbox"
                    checked={editFormData.featured}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, featured: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Featured Garment</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs">
                  <input
                    type="checkbox"
                    checked={editFormData.newArrival}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, newArrival: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs">
                  <input
                    type="checkbox"
                    checked={editFormData.bestSeller}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bestSeller: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setProductToEdit(null);
                    setEditFormData(null);
                  }}
                  className="px-4 py-2 border border-neutral-300 rounded font-bold uppercase text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2 bg-black hover:bg-neutral-800 text-white rounded font-bold uppercase shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Save Changes</span>
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
