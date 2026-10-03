import {
  Product,
  Category,
  CollectionItem,
  Order,
  OrderStatus,
  Coupon,
  Review,
  HomepageSection,
  AdminAnalytics,
  User,
} from "@/types";
import {
  initialProducts,
  initialCategories,
  initialCollections,
  initialOrders,
  initialCoupons,
  initialReviews,
  initialHomepageSections,
  initialUsers,
} from "./seedData";
import { connectToDatabase, isMongoConnected } from "./db";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";
import { CategoryModel } from "@/models/Category";
import { CollectionModel } from "@/models/Collection";
import { CouponModel } from "@/models/Coupon";
import { ReviewModel } from "@/models/Review";
import { HomepageSectionModel } from "@/models/HomepageSection";
import { NavbarConfigModel, INavbarConfig } from "@/models/NavbarConfig";
import { SeoConfigModel, ISeoConfig } from "@/models/SeoConfig";
import { UserModel } from "@/models/User";
import { FooterConfigModel, IFooterConfig, initialFooterConfig } from "@/models/FooterConfig";
import fs from "fs";
import path from "path";

export const initialNavbarConfig: INavbarConfig = {
  logoType: "image",
  logoText: "DIMENSION STREET",
  logoImageUrl: "/images/logo.png",
  menuPillLabel: "Menu",
  showCart: true,
  showWishlist: true,
  showAccount: true,
  showSearch: true,
  sticky: true,
  items: [
    { id: "nav-1", label: "Home", href: "/", isActive: true },
    { id: "nav-2", label: "Shop All", href: "/shop", isActive: true },
    { id: "nav-3", label: "Contact", href: "/contact", isActive: true },
    { id: "nav-4", label: "About", href: "/about", isActive: true },
  ],
  announcement: {
    enabled: true,
    text: "Dimension Street — Made in Bangladesh",
    linkUrl: "",
    bgColor: "#000000",
    textColor: "#ffffff",
  },
};

export const initialSeoConfig: ISeoConfig = {
  siteTitle: "DIMENSION STREET — Premium Heavyweight Streetwear",
  titleTemplate: "%s | DIMENSION STREET",
  metaDescription:
    "Architectural silhouettes crafted from custom milled 320–480 GSM organic cotton knits. Designed in Dhaka, worn worldwide.",
  keywords:
    "Dimension Street, streetwear, heavyweight hoodie, oversized tee, tactical pants, Dhaka streetwear, 320 GSM, bangladesh streetwear",
  canonicalUrl: "https://dimensionstreet.com",
  ogTitle: "DIMENSION STREET — Heavyweight Essentials",
  ogDescription: "Premium architectural streetwear designed for every dimension.",
  ogImage:
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterHandle: "@dimensionstreet",
  robotsIndex: true,
  robotsFollow: true,
  googleSiteVerification: "",
  focusKeywords: "streetwear, heavyweight hoodie, dhaka, dimension street",
};

// File-backed persistence for local state when Mongo is not provided
const DATA_FILE = path.join(process.cwd(), ".data-cache.json");

interface LocalStore {
  products: Product[];
  categories: Category[];
  collections: CollectionItem[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  homepageSections: HomepageSection[];
  users: User[];
  navbarConfig?: INavbarConfig;
  seoConfig?: ISeoConfig;
  footerConfig?: IFooterConfig;
}

function loadLocalStore(): LocalStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);

      // Initialize products if missing
      if (!parsed.products || !Array.isArray(parsed.products)) {
        parsed.products = initialProducts;
      }

      // Ensure all products have reviews from initialReviews if missing
      const existingProductIdsWithReviews = new Set(
        (parsed.reviews || []).map((r: Review) => r.productId)
      );
      const missingReviews = initialReviews.filter(
        (r) => !existingProductIdsWithReviews.has(r.productId)
      );
      if (missingReviews.length > 0) {
        parsed.reviews = [...(parsed.reviews || []), ...missingReviews];
      }

      // Ensure homepageSections exist in local store
      if (
        !parsed.homepageSections ||
        !Array.isArray(parsed.homepageSections) ||
        parsed.homepageSections.length === 0
      ) {
        parsed.homepageSections = initialHomepageSections;
      }

      // Ensure navbarConfig exists in local store
      if (!parsed.navbarConfig || !Array.isArray(parsed.navbarConfig.items)) {
        parsed.navbarConfig = { ...initialNavbarConfig };
      }

      // Ensure seoConfig exists in local store
      if (!parsed.seoConfig || !parsed.seoConfig.siteTitle) {
        parsed.seoConfig = { ...initialSeoConfig };
      }

      if (
        missingReviews.length > 0 ||
        !parsed.homepageSections ||
        !parsed.navbarConfig ||
        !parsed.seoConfig
      ) {
        try {
          fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), "utf-8");
        } catch {}
      }
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load local store file:", e);
  }
  return {
    products: initialProducts,
    categories: initialCategories,
    collections: initialCollections,
    orders: initialOrders,
    coupons: initialCoupons,
    reviews: initialReviews,
    homepageSections: initialHomepageSections,
    users: initialUsers,
    navbarConfig: { ...initialNavbarConfig },
    seoConfig: { ...initialSeoConfig },
  };
}

let memoryStore: LocalStore = loadLocalStore();

function saveLocalStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not save to data file:", e);
  }
}

const stripId = <T extends { _id?: string }>(items: T[]) =>
  items.map((item) => {
    const copy = { ...item } as Record<string, unknown>;
    delete copy._id;
    return copy;
  });

let hasSeededMongo = false;
async function autoSeedMongoIfEmpty() {
  if (hasSeededMongo || !isMongoConnected()) return;
  try {
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      console.log("🌱 Auto-seeding initial products to MongoDB...");
      await ProductModel.insertMany(stripId(initialProducts));
    }
    const catCount = await CategoryModel.countDocuments();
    if (catCount === 0) {
      console.log("🌱 Auto-seeding categories to MongoDB...");
      await CategoryModel.insertMany(stripId(initialCategories));
    }
    const colCount = await CollectionModel.countDocuments();
    if (colCount === 0) {
      console.log("🌱 Auto-seeding collections to MongoDB...");
      await CollectionModel.insertMany(stripId(initialCollections));
    }
    const revCount = await ReviewModel.countDocuments();
    if (revCount === 0) {
      console.log("🌱 Auto-seeding reviews to MongoDB...");
      await ReviewModel.insertMany(stripId(initialReviews));
    }
    const coupCount = await CouponModel.countDocuments();
    if (coupCount === 0) {
      console.log("🌱 Auto-seeding coupons to MongoDB...");
      await CouponModel.insertMany(stripId(initialCoupons));
    }
    const secCount = await HomepageSectionModel.countDocuments();
    if (secCount === 0) {
      console.log("🌱 Auto-seeding homepage sections to MongoDB...");
      await HomepageSectionModel.insertMany(stripId(initialHomepageSections));
    }
    hasSeededMongo = true;
  } catch (err) {
    console.warn("MongoDB auto-seed note:", err);
  }
}

// ---------------- PRODUCTS ----------------
export async function getProducts(options?: {
  category?: string;
  collection?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
}): Promise<Product[]> {
  await connectToDatabase();
  await autoSeedMongoIfEmpty();

  let list: Product[] = [];
  if (isMongoConnected()) {
    try {
      const filter: Record<string, unknown> = { status: "active" };
      if (options?.category && options.category !== "all") {
        filter.category = options.category;
      }
      if (options?.collection && options.collection !== "all") {
        filter.collectionName = options.collection;
      }
      if (options?.featured) filter.featured = true;
      if (options?.bestSeller) filter.bestSeller = true;
      if (options?.newArrival) filter.newArrival = true;

      const raw = await ProductModel.find(filter).lean();
      list = raw.map((p) => ({ ...p, _id: p._id.toString() } as unknown as Product));
    } catch {
      list = [...memoryStore.products];
    }
  } else {
    list = [...memoryStore.products];
  }

  // Filter in memory for search or if Mongo was offline
  if (options?.category && options.category !== "all") {
    list = list.filter((p) => p.category.toLowerCase() === options.category?.toLowerCase());
  }
  if (options?.collection && options.collection !== "all") {
    list = list.filter((p) => p.collectionName?.toLowerCase() === options.collection?.toLowerCase());
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (options?.featured) list = list.filter((p) => p.featured);
  if (options?.bestSeller) list = list.filter((p) => p.bestSeller);
  if (options?.newArrival) list = list.filter((p) => p.newArrival);

  // Sorting
  if (options?.sort === "price-low") {
    list.sort((a, b) => a.price - b.price);
  } else if (options?.sort === "price-high") {
    list.sort((a, b) => b.price - a.price);
  } else if (options?.sort === "newest") {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (options?.sort === "best-selling") {
    list.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
  }

  return list;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  await connectToDatabase();
  await autoSeedMongoIfEmpty();
  if (isMongoConnected()) {
    try {
      const raw = await ProductModel.find().sort({ createdAt: -1 }).lean();
      return raw.map((p) => ({ ...p, _id: p._id.toString() } as unknown as Product));
    } catch {
      return memoryStore.products;
    }
  }
  return memoryStore.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await connectToDatabase();
  await autoSeedMongoIfEmpty();
  if (isMongoConnected()) {
    try {
      const raw = await ProductModel.findOne({ slug }).lean();
      if (raw) return { ...raw, _id: raw._id.toString() } as unknown as Product;
    } catch {
      // fallback
    }
  }
  const match = memoryStore.products.find((p) => p.slug === slug || p._id === slug);
  return match || null;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const newProduct: Product = {
    _id: `prod-${Date.now()}`,
    name: data.name || "Untitled Streetwear Garment",
    slug: data.slug || `garment-${Date.now()}`,
    description: data.description || "",
    shortDescription: data.shortDescription || "",
    images: data.images && data.images.length > 0 ? data.images : [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85"
    ],
    price: data.price || 50,
    compareAtPrice: data.compareAtPrice,
    costPrice: data.costPrice || 20,
    variants: data.variants || [
      { sku: `SKU-${Date.now()}-M`, color: "Pitch Black", size: "M", price: data.price || 50, stock: 20 },
      { sku: `SKU-${Date.now()}-L`, color: "Pitch Black", size: "L", price: data.price || 50, stock: 20 },
    ],
    category: data.category || "t-shirts",
    collectionName: data.collectionName || "dimension-core",
    tags: data.tags || ["Streetwear"],
    sku: data.sku || `DIM-${Date.now().toString().slice(-4)}`,
    totalStock: data.variants ? data.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 40,
    status: data.status || "active",
    featured: Boolean(data.featured),
    bestSeller: Boolean(data.bestSeller),
    newArrival: Boolean(data.newArrival),
    rating: 5.0,
    reviewCount: 0,
    details: data.details || {
      fit: "Relaxed streetwear fit.",
      material: "100% Combed Cotton.",
      care: "Machine wash cold.",
      shipping: "Standard delivery.",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.products.unshift(newProduct);
  saveLocalStore();

  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      await ProductModel.create(newProduct);
    } catch (e) {
      console.warn("Mongo insert product failed:", e);
    }
  }

  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const index = memoryStore.products.findIndex((p) => p._id === id || p.slug === id);
  if (index !== -1) {
    const updated = {
      ...memoryStore.products[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (updated.variants) {
      updated.totalStock = updated.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    }
    memoryStore.products[index] = updated;
    saveLocalStore();

    await connectToDatabase();
    if (isMongoConnected()) {
      try {
        await ProductModel.updateOne({ _id: id }, updated);
      } catch (e) {
        console.warn("Mongo update product failed:", e);
      }
    }
    return updated;
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const strId = String(id);
  memoryStore.products = memoryStore.products.filter(
    (p) => String(p._id) !== strId && p.slug !== strId
  );
  saveLocalStore();

  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const isHex = /^[0-9a-fA-F]{24}$/.test(strId);
      await ProductModel.deleteOne(
        isHex
          ? { $or: [{ _id: strId }, { slug: strId }] }
          : { slug: strId }
      );
    } catch (err) {
      console.warn("Mongo deleteProduct error:", err);
    }
  }
  return true;
}

export async function bulkUpdateProducts(
  ids: string[],
  updates: {
    price?: number;
    compareAtPrice?: number;
    pricePercentAdjust?: number;
    category?: string;
    collectionName?: string;
    totalStock?: number;
    stockAdjust?: number;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
  }
): Promise<{ updatedCount: number }> {
  await connectToDatabase();
  const idSet = new Set(ids.map(String));
  let count = 0;

  // 1. Update in MongoDB
  if (isMongoConnected()) {
    try {
      const validHexIds = ids.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
      const query = {
        $or: [
          ...(validHexIds.length > 0 ? [{ _id: { $in: validHexIds } }] : []),
          { slug: { $in: ids } },
          { _id: { $in: ids } },
        ],
      };

      const docs = await ProductModel.find(query);
      for (const doc of docs) {
        count++;
        let newPrice = doc.price;
        if (typeof updates.price === "number") {
          newPrice = updates.price;
        } else if (typeof updates.pricePercentAdjust === "number") {
          newPrice = Math.max(1, Math.round(doc.price * (1 + updates.pricePercentAdjust / 100)));
        }

        let newStock = doc.totalStock;
        if (typeof updates.totalStock === "number") {
          newStock = Math.max(0, updates.totalStock);
        } else if (typeof updates.stockAdjust === "number") {
          newStock = Math.max(0, doc.totalStock + updates.stockAdjust);
        }

        doc.price = newPrice;
        if (updates.compareAtPrice !== undefined) doc.compareAtPrice = updates.compareAtPrice;
        if (updates.category) doc.category = updates.category;
        if (updates.collectionName) doc.collectionName = updates.collectionName;
        doc.totalStock = newStock;
        if (updates.featured !== undefined) doc.featured = updates.featured;
        if (updates.newArrival !== undefined) doc.newArrival = updates.newArrival;
        if (updates.bestSeller !== undefined) doc.bestSeller = updates.bestSeller;

        if (Array.isArray(doc.variants) && doc.variants.length > 0) {
          doc.variants = doc.variants.map((v: any) => ({
            ...v,
            price: newPrice,
            stock: newStock > 0 ? Math.round(newStock / Math.max(1, doc.variants.length)) : 0,
          }));
        }

        await doc.save();
      }
    } catch (e) {
      console.warn("Mongo bulkUpdate error:", e);
    }
  }

  // 2. Update memory store
  let memCount = 0;
  for (let i = 0; i < memoryStore.products.length; i++) {
    const p = memoryStore.products[i];
    const pid = String(p._id);
    if (idSet.has(pid) || idSet.has(p.slug)) {
      memCount++;
      let newPrice = p.price;
      if (typeof updates.price === "number") {
        newPrice = updates.price;
      } else if (typeof updates.pricePercentAdjust === "number") {
        newPrice = Math.max(1, Math.round(p.price * (1 + updates.pricePercentAdjust / 100)));
      }

      let newStock = p.totalStock;
      if (typeof updates.totalStock === "number") {
        newStock = Math.max(0, updates.totalStock);
      } else if (typeof updates.stockAdjust === "number") {
        newStock = Math.max(0, p.totalStock + updates.stockAdjust);
      }

      const updatedVariants = (p.variants || []).map((v) => ({
        ...v,
        price: newPrice,
        stock: newStock > 0 ? Math.round(newStock / Math.max(1, p.variants.length)) : 0,
      }));

      memoryStore.products[i] = {
        ...p,
        price: newPrice,
        compareAtPrice: updates.compareAtPrice !== undefined ? updates.compareAtPrice : p.compareAtPrice,
        category: updates.category || p.category,
        collectionName: updates.collectionName || p.collectionName,
        totalStock: newStock,
        variants: updatedVariants,
        featured: updates.featured !== undefined ? updates.featured : p.featured,
        newArrival: updates.newArrival !== undefined ? updates.newArrival : p.newArrival,
        bestSeller: updates.bestSeller !== undefined ? updates.bestSeller : p.bestSeller,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  saveLocalStore();
  return { updatedCount: Math.max(count, memCount) };
}

export async function bulkDeleteProducts(ids: string[]): Promise<{ deletedCount: number }> {
  await connectToDatabase();
  const idSet = new Set(ids.map(String));
  let mongoDeleted = 0;

  if (isMongoConnected()) {
    try {
      const validHexIds = ids.filter((id) => /^[0-9a-fA-F]{24}$/.test(String(id)));
      const res = await ProductModel.deleteMany({
        $or: [
          ...(validHexIds.length > 0 ? [{ _id: { $in: validHexIds } }] : []),
          { slug: { $in: ids } },
        ],
      });
      mongoDeleted = res.deletedCount || 0;
    } catch (err) {
      console.warn("Mongo bulkDeleteProducts error:", err);
    }
  }

  const initialCount = memoryStore.products.length;
  memoryStore.products = memoryStore.products.filter(
    (p) => !idSet.has(String(p._id)) && !idSet.has(p.slug)
  );
  const memDeleted = initialCount - memoryStore.products.length;
  saveLocalStore();

  return { deletedCount: Math.max(mongoDeleted, memDeleted) };
}

// ---------------- CATEGORIES & COLLECTIONS ----------------
export async function getCategories(): Promise<Category[]> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const raw = await CategoryModel.find().lean();
      if (raw.length > 0) return raw.map((c) => ({ ...c, _id: c._id.toString() } as unknown as Category));
    } catch {
      // fallback
    }
  }
  return memoryStore.categories;
}

export async function getCollections(): Promise<CollectionItem[]> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const raw = await CollectionModel.find().lean();
      if (raw.length > 0) return raw.map((c) => ({ ...c, _id: c._id.toString() } as unknown as CollectionItem));
    } catch {
      // fallback
    }
  }
  return memoryStore.collections;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  await connectToDatabase();
  const slug = (data.slug || data.name || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const newCat: Category = {
    _id: "cat-" + Date.now().toString(36),
    name: data.name?.trim() || "Untitled Category",
    slug: slug || "category-" + Date.now(),
    description: data.description?.trim() || "",
    image: data.image?.trim() || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    itemCount: Number(data.itemCount) || 0,
    featured: Boolean(data.featured),
  };

  if (isMongoConnected()) {
    try {
      const doc = await CategoryModel.create({
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description,
        image: newCat.image,
        itemCount: newCat.itemCount,
        featured: newCat.featured,
      });
      newCat._id = doc._id.toString();
    } catch (e) {
      console.warn("Mongo Category create note:", e);
    }
  }

  if (!memoryStore.categories) memoryStore.categories = [];
  memoryStore.categories.push(newCat);
  saveLocalStore();
  return newCat;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  await connectToDatabase();
  let updatedDoc: Category | null = null;

  if (isMongoConnected()) {
    try {
      const doc = await CategoryModel.findOne({
        $or: [{ _id: id }, { slug: id }],
      });
      if (doc) {
        if (data.name !== undefined) doc.name = data.name.trim();
        if (data.slug !== undefined) {
          doc.slug = data.slug.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
        }
        if (data.description !== undefined) doc.description = data.description.trim();
        if (data.image !== undefined) doc.image = data.image.trim();
        if (data.itemCount !== undefined) doc.itemCount = Number(data.itemCount);
        if (data.featured !== undefined) doc.featured = Boolean(data.featured);
        await doc.save();
        updatedDoc = { ...doc.toObject(), _id: doc._id.toString() } as unknown as Category;
      }
    } catch (e) {
      console.warn("Mongo Category update note:", e);
    }
  }

  const idx = (memoryStore.categories || []).findIndex((c) => c._id === id || c.slug === id);
  if (idx !== -1) {
    const existing = memoryStore.categories[idx];
    const merged: Category = {
      ...existing,
      ...data,
      _id: existing._id,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      slug: data.slug !== undefined ? data.slug.toLowerCase().trim() : existing.slug,
    };
    memoryStore.categories[idx] = merged;
    saveLocalStore();
    if (!updatedDoc) updatedDoc = merged;
  }

  return updatedDoc;
}

export async function deleteCategory(id: string): Promise<boolean> {
  await connectToDatabase();
  let deleted = false;

  if (isMongoConnected()) {
    try {
      const res = await CategoryModel.deleteOne({ $or: [{ _id: id }, { slug: id }] });
      if (res.deletedCount && res.deletedCount > 0) deleted = true;
    } catch (e) {
      console.warn("Mongo Category delete note:", e);
    }
  }

  const initialLen = (memoryStore.categories || []).length;
  memoryStore.categories = (memoryStore.categories || []).filter(
    (c) => c._id !== id && c.slug !== id
  );
  if (memoryStore.categories.length < initialLen) deleted = true;

  saveLocalStore();
  return deleted;
}

export async function createCollection(data: Partial<CollectionItem>): Promise<CollectionItem> {
  await connectToDatabase();
  const slug = (data.slug || data.title || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const newCol: CollectionItem = {
    _id: "col-" + Date.now().toString(36),
    title: data.title?.trim() || "Untitled Collection",
    slug: slug || "collection-" + Date.now(),
    description: data.description?.trim() || "",
    bannerImage: data.bannerImage?.trim() || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    itemCount: Number(data.itemCount) || 0,
    featured: Boolean(data.featured),
  };

  if (isMongoConnected()) {
    try {
      const doc = await CollectionModel.create({
        title: newCol.title,
        slug: newCol.slug,
        description: newCol.description,
        bannerImage: newCol.bannerImage,
        itemCount: newCol.itemCount,
        featured: newCol.featured,
      });
      newCol._id = doc._id.toString();
    } catch (e) {
      console.warn("Mongo Collection create note:", e);
    }
  }

  if (!memoryStore.collections) memoryStore.collections = [];
  memoryStore.collections.push(newCol);
  saveLocalStore();
  return newCol;
}

export async function updateCollection(id: string, data: Partial<CollectionItem>): Promise<CollectionItem | null> {
  await connectToDatabase();
  let updatedDoc: CollectionItem | null = null;

  if (isMongoConnected()) {
    try {
      const doc = await CollectionModel.findOne({
        $or: [{ _id: id }, { slug: id }],
      });
      if (doc) {
        if (data.title !== undefined) doc.title = data.title.trim();
        if (data.slug !== undefined) {
          doc.slug = data.slug.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
        }
        if (data.description !== undefined) doc.description = data.description.trim();
        if (data.bannerImage !== undefined) doc.bannerImage = data.bannerImage.trim();
        if (data.itemCount !== undefined) doc.itemCount = Number(data.itemCount);
        if (data.featured !== undefined) doc.featured = Boolean(data.featured);
        await doc.save();
        updatedDoc = { ...doc.toObject(), _id: doc._id.toString() } as unknown as CollectionItem;
      }
    } catch (e) {
      console.warn("Mongo Collection update note:", e);
    }
  }

  const idx = (memoryStore.collections || []).findIndex((c) => c._id === id || c.slug === id);
  if (idx !== -1) {
    const existing = memoryStore.collections[idx];
    const merged: CollectionItem = {
      ...existing,
      ...data,
      _id: existing._id,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      slug: data.slug !== undefined ? data.slug.toLowerCase().trim() : existing.slug,
    };
    memoryStore.collections[idx] = merged;
    saveLocalStore();
    if (!updatedDoc) updatedDoc = merged;
  }

  return updatedDoc;
}

export async function deleteCollection(id: string): Promise<boolean> {
  await connectToDatabase();
  let deleted = false;

  if (isMongoConnected()) {
    try {
      const res = await CollectionModel.deleteOne({ $or: [{ _id: id }, { slug: id }] });
      if (res.deletedCount && res.deletedCount > 0) deleted = true;
    } catch (e) {
      console.warn("Mongo Collection delete note:", e);
    }
  }

  const initialLen = (memoryStore.collections || []).length;
  memoryStore.collections = (memoryStore.collections || []).filter(
    (c) => c._id !== id && c.slug !== id
  );
  if (memoryStore.collections.length < initialLen) deleted = true;

  saveLocalStore();
  return deleted;
}

// ---------------- ORDERS & COMMERCE ----------------
export async function getOrders(): Promise<Order[]> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const raw = await OrderModel.find().sort({ createdAt: -1 }).lean();
      if (raw.length > 0) return raw.map((o) => ({ ...o, _id: o._id.toString() } as unknown as Order));
    } catch {
      // fallback
    }
  }
  return memoryStore.orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const raw = await OrderModel.findOne({ $or: [{ _id: id }, { orderNumber: id }] }).lean();
      if (raw) return { ...raw, _id: raw._id.toString() } as unknown as Order;
    } catch {
      // fallback
    }
  }
  return memoryStore.orders.find((o) => o._id === id || o.orderNumber === id) || null;
}

export async function getOrdersByCustomerEmail(email: string): Promise<Order[]> {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized) return [];

  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const raw = await OrderModel.find({
        "customer.email": { $regex: new RegExp(`^${normalized}$`, "i") },
      })
        .sort({ createdAt: -1 })
        .lean();
      if (raw && raw.length > 0) {
        return raw.map((o) => ({ ...o, _id: o._id.toString() } as unknown as Order));
      }
    } catch {
      // fallback
    }
  }

  return (memoryStore.orders || []).filter(
    (o) => (o.customer?.email || "").trim().toLowerCase() === normalized
  );
}

export async function createOrder(data: {
  customer: Order["customer"];
  items: Order["items"];
  shippingAddress: Order["shippingAddress"];
  paymentMethod: Order["paymentMethod"];
  couponCode?: string;
  notes?: string;
}): Promise<Order> {
  const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate discount if coupon applied
  let discount = 0;
  if (data.couponCode) {
    const coupon = await validateCoupon(data.couponCode, subtotal);
    if (coupon.valid && coupon.coupon) {
      if (coupon.coupon.discountType === "percentage") {
        discount = (subtotal * coupon.coupon.discountValue) / 100;
        if (coupon.coupon.maxDiscount && discount > coupon.coupon.maxDiscount) {
          discount = coupon.coupon.maxDiscount;
        }
      } else {
        discount = coupon.coupon.discountValue;
      }
    }
  }

  const shipping = subtotal >= 150 ? 0 : 15;
  const total = Math.max(0, subtotal - discount + shipping);

  const orderNumber = `DS-${Math.floor(10000 + Math.random() * 90000)}`;

  const newOrder: Order = {
    _id: `ord-${Date.now()}`,
    orderNumber,
    customer: data.customer,
    items: data.items,
    subtotal,
    shipping,
    discount,
    total,
    couponCode: data.couponCode,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentMethod === "cod" ? "pending" : "paid",
    orderStatus: "Pending",
    trackingNumber: `TRK-${orderNumber}`,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Decrement variant stock
  for (const item of data.items) {
    const product = memoryStore.products.find((p) => p._id === item.productId || p.slug === item.slug);
    if (product) {
      const variant = product.variants.find((v) => v.sku === item.sku);
      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.quantity);
      }
      product.totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    }
  }

  memoryStore.orders.unshift(newOrder);
  saveLocalStore();

  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      await OrderModel.create(newOrder);
    } catch (e) {
      console.warn("Mongo order creation failed:", e);
    }
  }

  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const order = memoryStore.orders.find((o) => o._id === id || o.orderNumber === id);
  if (order) {
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    saveLocalStore();

    await connectToDatabase();
    if (isMongoConnected()) {
      try {
        await OrderModel.updateOne({ _id: order._id }, { orderStatus: status, updatedAt: new Date() });
      } catch {
        // ignore
      }
    }
    return order;
  }
  return null;
}

// ---------------- COUPONS ----------------
export async function getCoupons(): Promise<Coupon[]> {
  return memoryStore.coupons;
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> {
  const coupon = memoryStore.coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
  );
  if (!coupon) {
    return { valid: false, message: "Invalid promo code" };
  }
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      message: `Minimum order value for ${coupon.code} is $${coupon.minOrderValue}`,
    };
  }
  return { valid: true, coupon };
}

export async function createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const newC: Coupon = {
    _id: `coup-${Date.now()}`,
    code: coupon.code?.toUpperCase() || `PROMO${Date.now().toString().slice(-4)}`,
    discountType: coupon.discountType || "percentage",
    discountValue: coupon.discountValue || 10,
    minOrderValue: coupon.minOrderValue || 0,
    maxDiscount: coupon.maxDiscount,
    usageLimit: coupon.usageLimit || 100,
    usageCount: 0,
    isActive: true,
  };
  memoryStore.coupons.unshift(newC);
  saveLocalStore();
  return newC;
}

// ---------------- REVIEWS ----------------
export async function getReviews(productId?: string): Promise<Review[]> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const filter: Record<string, unknown> = {};
      if (productId) {
        const prod = memoryStore.products.find(
          (p) => p._id === productId || p.slug === productId
        );
        const matchIds = [productId];
        if (prod) {
          if (prod._id && !matchIds.includes(prod._id)) matchIds.push(prod._id);
          if (prod.slug && !matchIds.includes(prod.slug)) matchIds.push(prod.slug);
        }
        filter.$or = [
          { productId: { $in: matchIds } },
          { productSlug: { $in: matchIds } },
        ];
      }
      const raw = await ReviewModel.find(filter).sort({ createdAt: -1 }).lean();
      if (raw && raw.length > 0) {
        return raw.map((r) => ({ ...r, _id: r._id.toString() } as unknown as Review));
      }
    } catch (e) {
      console.error("Error querying reviews from mongo:", e);
    }
  }

  if (productId) {
    const prod = memoryStore.products.find(
      (p) => p._id === productId || p.slug === productId
    );
    const results = memoryStore.reviews.filter(
      (r) =>
        r.productId === productId ||
        r.productSlug === productId ||
        (prod && (
          r.productId === prod._id ||
          r.productId === prod.slug ||
          r.productSlug === prod.slug ||
          r.productSlug === prod._id
        ))
    );
    return results;
  }
  return memoryStore.reviews;
}

export async function createReview(data: Partial<Review>): Promise<Review> {
  const prod = memoryStore.products.find(
    (p) =>
      p._id === data.productId ||
      p.slug === data.productSlug ||
      p.slug === data.productId ||
      p._id === data.productSlug
  );

  const newReview: Review = {
    _id: `rev-${Date.now()}`,
    productId: data.productId || prod?._id || "",
    productName: data.productName || prod?.name || "Dimension Streetwear Item",
    productSlug: data.productSlug || prod?.slug || "dimension-item",
    customerName: data.customerName || "Anonymous Customer",
    customerEmail: data.customerEmail || "",
    rating: data.rating || 5,
    title: data.title || "Great quality",
    comment: data.comment || "",
    status: "Approved", // auto-approve for seamless live display
    verifiedPurchase: true,
    image: data.image || prod?.images?.[0] || "/images/bestseller_singh_black_tee.jpg",
    createdAt: new Date().toISOString(),
  };

  memoryStore.reviews.unshift(newReview);

  // Update product's aggregate rating and reviewCount if product exists
  if (prod) {
    const productReviews = memoryStore.reviews.filter(
      (r) =>
        r.productId === prod._id ||
        r.productSlug === prod.slug ||
        r.productId === prod.slug
    );
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    prod.reviewCount = productReviews.length;
    prod.rating = Number((totalRating / productReviews.length).toFixed(1));
  }

  saveLocalStore();

  // Also persist in Mongo if connected
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      await ReviewModel.create({
        productId: newReview.productId,
        productName: newReview.productName,
        customerName: newReview.customerName,
        customerEmail: newReview.customerEmail,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        status: newReview.status,
        verifiedPurchase: newReview.verifiedPurchase,
      });
    } catch (e) {
      console.warn("Could not save review in Mongo:", e);
    }
  }

  return newReview;
}

export async function updateReviewStatus(id: string, status: Review["status"]): Promise<boolean> {
  const rev = memoryStore.reviews.find((r) => r._id === id);
  if (rev) {
    rev.status = status;
    saveLocalStore();
    return true;
  }
  return false;
}

// ---------------- HOMEPAGE CMS SECTIONS ----------------
const CANONICAL_TYPES = [
  "hero",
  "new_arrivals",
  "promo_banner",
  "shop_by_category",
  "brand_story",
  "best_sellers",
  "statement_banner",
  "community_gallery",
];

function normalizeSectionType(type: string): string {
  if (type === "categories") return "shop_by_category";
  if (type === "statement") return "statement_banner";
  if (type === "community") return "community_gallery";
  return type;
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  await connectToDatabase();
  await autoSeedMongoIfEmpty();

  let list: HomepageSection[] = [];

  if (isMongoConnected()) {
    try {
      let raw = await HomepageSectionModel.find().lean();
      
      // Normalize and deduplicate by canonical type
      const byType = new Map<string, any>();
      for (const doc of raw) {
        const norm = normalizeSectionType(doc.type);
        if (!byType.has(norm)) {
          byType.set(norm, { ...doc, type: norm, _id: doc._id.toString() });
        }
      }

      // Check for missing canonical sections from initialHomepageSections
      for (const init of initialHomepageSections) {
        const norm = normalizeSectionType(init.type);
        if (!byType.has(norm)) {
          try {
            const newDoc = new HomepageSectionModel({
              type: norm,
              title: init.title || (norm === "hero" ? "HERO BANNER" : norm.toUpperCase()),
              subtitle: init.subtitle || "",
              order: init.order,
              isActive: init.isActive,
              data: init.data || {},
            });
            await newDoc.save();
            byType.set(norm, { ...newDoc.toObject(), type: norm, _id: newDoc._id.toString() });
          } catch (e) {
            console.warn("Failed saving missing canonical section to mongo:", norm, e);
          }
        }
      }

      list = Array.from(byType.values()).map((s) => ({
        ...s,
        order: CANONICAL_TYPES.indexOf(s.type) + 1,
      } as unknown as HomepageSection));

      list.sort((a, b) => a.order - b.order);
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Mongo getHomepageSections fallback to memory:", err);
    }
  }

  // Memory fallback
  if (!memoryStore.homepageSections || !Array.isArray(memoryStore.homepageSections)) {
    memoryStore.homepageSections = [...initialHomepageSections];
  }

  const byTypeMem = new Map<string, HomepageSection>();
  for (const s of memoryStore.homepageSections) {
    const norm = normalizeSectionType(s.type);
    if (!byTypeMem.has(norm)) {
      byTypeMem.set(norm, { ...s, type: norm as any });
    }
  }
  for (const init of initialHomepageSections) {
    const norm = normalizeSectionType(init.type);
    if (!byTypeMem.has(norm)) {
      byTypeMem.set(norm, { ...init, type: norm as any });
    }
  }

  list = Array.from(byTypeMem.values()).map((s) => ({
    ...s,
    order: CANONICAL_TYPES.indexOf(s.type) + 1,
  }));
  list.sort((a, b) => a.order - b.order);
  memoryStore.homepageSections = list;
  saveLocalStore();
  return list;
}

export async function updateHomepageSection(
  id: string,
  updates: Partial<HomepageSection>
): Promise<HomepageSection | null> {
  await connectToDatabase();
  let updatedMongoDoc: HomepageSection | null = null;
  const typeMatch = id.replace(/^sec-/, "").replace(/-/g, "_");

  if (isMongoConnected()) {
    try {
      let doc = null;
      // Only search by _id if id is a valid 24-hex ObjectId to avoid CastError
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          doc = await HomepageSectionModel.findById(id);
        } catch {}
      }

      if (!doc) {
        doc = await HomepageSectionModel.findOne({
          $or: [{ type: id }, { type: typeMatch }],
        });
      }

      if (!doc) {
        doc = new HomepageSectionModel({
          type: typeMatch || id,
          title: updates.title ?? "",
          subtitle: updates.subtitle ?? "",
          order: updates.order ?? 1,
          isActive: updates.isActive !== undefined ? updates.isActive : true,
          data: updates.data || {},
        });
      } else {
        if (updates.title !== undefined) doc.title = updates.title;
        if (updates.subtitle !== undefined) doc.subtitle = updates.subtitle;
        if (updates.order !== undefined) doc.order = updates.order;
        if (updates.isActive !== undefined) doc.isActive = updates.isActive;
        if (updates.data !== undefined) {
          doc.data = { ...(doc.data || {}), ...updates.data };
          doc.markModified("data");
        }
      }

      await doc.save();
      updatedMongoDoc = {
        ...doc.toObject(),
        _id: doc._id.toString(),
      } as unknown as HomepageSection;
    } catch (err) {
      console.warn("Mongo updateHomepageSection failed:", err);
    }
  }

  if (!memoryStore.homepageSections || !Array.isArray(memoryStore.homepageSections)) {
    memoryStore.homepageSections = [...initialHomepageSections];
  }

  let section = memoryStore.homepageSections.find(
    (s) =>
      s._id === id ||
      s.type === id ||
      s.type === typeMatch ||
      (s as any)._id?.toString() === id
  );

  if (!section) {
    section = {
      _id: id,
      type: typeMatch as any,
      title: updates.title || "",
      subtitle: updates.subtitle || "",
      order: updates.order || 1,
      isActive: updates.isActive !== undefined ? updates.isActive : true,
      data: updates.data || {},
      createdAt: new Date().toISOString(),
    };
    memoryStore.homepageSections.push(section);
  } else {
    if (updates.title !== undefined) section.title = updates.title;
    if (updates.subtitle !== undefined) section.subtitle = updates.subtitle;
    if (updates.order !== undefined) section.order = updates.order;
    if (updates.isActive !== undefined) section.isActive = updates.isActive;
    if (updates.data !== undefined) {
      section.data = { ...(section.data || {}), ...updates.data };
    }
  }

  saveLocalStore();
  return updatedMongoDoc || section;
}

export async function saveAllHomepageSections(
  sections: HomepageSection[]
): Promise<HomepageSection[]> {
  for (const s of sections) {
    await updateHomepageSection(s._id || s.type, s);
  }
  return getHomepageSections();
}

// ---------------- LIVE ADMIN ANALYTICS ----------------
// Dynamic analytics calculated directly from actual store records, NO hardcoded numbers!
export async function getAdminAnalytics(period: "7D" | "30D" | "ALL" = "ALL"): Promise<AdminAnalytics> {
  const orders = await getOrders();
  const products = await getAllProductsAdmin();

  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const bdtRate = 120; // 1 USD = 120 BDT
  const revenueBdt = totalRevenue * bdtRate;

  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing" || o.orderStatus === "Packed"
  ).length;

  const uniqueCustomerEmails = new Set(orders.map((o) => o.customer.email.toLowerCase()));
  const actualCustomers = uniqueCustomerEmails.size;
  const verifiedBuyers = orders.filter((o) => o.paymentStatus === "paid").length;

  const inStockProducts = products.filter((p) => p.totalStock > 0).length;
  const outOfStockProducts = products.filter((p) => p.totalStock === 0).length;

  const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
  const fulfillmentRate = totalOrdersCount > 0 ? Math.round((deliveredOrders / totalOrdersCount) * 100) : 0;
  const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Calculate top selling items from order items
  const productSalesMap: Record<string, { name: string; image: string; salesCount: number; revenue: number }> = {};
  for (const o of orders) {
    for (const item of o.items) {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.name,
          image: item.image,
          salesCount: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId].salesCount += item.quantity;
      productSalesMap[item.productId].revenue += item.price * item.quantity;
    }
  }

  const topSelling = Object.entries(productSalesMap)
    .map(([productId, info]) => ({
      productId,
      name: info.name,
      image: info.image,
      salesCount: info.salesCount,
      revenue: info.revenue,
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  // Live revenue trend over recent dates
  const trendMap: Record<string, { amount: number; orders: number }> = {};
  orders.forEach((o) => {
    const day = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!trendMap[day]) {
      trendMap[day] = { amount: 0, orders: 0 };
    }
    trendMap[day].amount += o.total;
    trendMap[day].orders += 1;
  });

  const revenueTrend = Object.entries(trendMap).map(([date, data]) => ({
    date,
    amount: data.amount,
    orders: data.orders,
  }));

  return {
    revenue: totalRevenue,
    revenueBdt,
    totalOrders: totalOrdersCount,
    pendingDispatch: pendingOrders,
    actualCustomers,
    verifiedBuyers,
    activeCatalogCount: inStockProducts,
    outOfStockCount: outOfStockProducts,
    fulfillmentRate,
    averageOrderValue: aov,
    recentOrders: orders.slice(0, 10),
    topSelling,
    revenueTrend,
  };
}

// ==========================================
// STOREFRONT NAVBAR & NAVIGATION CONFIGURATION
// ==========================================

export async function getNavbarConfig(): Promise<INavbarConfig> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const doc = await NavbarConfigModel.findOne().lean();
      if (doc) {
        return {
          logoType: (doc.logoType as "image" | "text") || "image",
          logoText: doc.logoText || "DIMENSION STREET",
          logoImageUrl: doc.logoImageUrl || "/images/logo.png",
          menuPillLabel: doc.menuPillLabel || "Menu",
          showCart: doc.showCart !== false,
          showWishlist: doc.showWishlist !== false,
          showAccount: doc.showAccount !== false,
          showSearch: doc.showSearch !== false,
          sticky: doc.sticky !== false,
          items:
            Array.isArray(doc.items) && doc.items.length > 0
              ? doc.items.map((it: any) => ({
                  id: it.id || `nav-${Math.random().toString(36).substring(2, 7)}`,
                  label: it.label || "Link",
                  href: it.href || "/",
                  isActive: it.isActive !== false,
                  isExternal: Boolean(it.isExternal),
                  badge: it.badge || "",
                  badgeColor: it.badgeColor || "bg-rose-500",
                }))
              : initialNavbarConfig.items,
          announcement: doc.announcement || initialNavbarConfig.announcement,
        };
      } else {
        // Seed initial navbar config in Mongo
        const created = await NavbarConfigModel.create(initialNavbarConfig);
        return created.toObject();
      }
    } catch (err) {
      console.warn("Mongo getNavbarConfig fallback to local memory:", err);
    }
  }

  if (!memoryStore.navbarConfig || !Array.isArray(memoryStore.navbarConfig.items)) {
    memoryStore.navbarConfig = { ...initialNavbarConfig };
    saveLocalStore();
  }
  return memoryStore.navbarConfig;
}

export async function updateNavbarConfig(
  updates: Partial<INavbarConfig>
): Promise<INavbarConfig> {
  await connectToDatabase();
  let result: INavbarConfig = {
    ...initialNavbarConfig,
    ...(memoryStore.navbarConfig || {}),
    ...updates,
  };

  if (isMongoConnected()) {
    try {
      let doc = await NavbarConfigModel.findOne();
      if (!doc) {
        doc = await NavbarConfigModel.create({ ...initialNavbarConfig, ...updates });
      } else {
        if (updates.logoType !== undefined) doc.logoType = updates.logoType;
        if (updates.logoText !== undefined) doc.logoText = updates.logoText;
        if (updates.logoImageUrl !== undefined) doc.logoImageUrl = updates.logoImageUrl;
        if (updates.menuPillLabel !== undefined) doc.menuPillLabel = updates.menuPillLabel;
        if (updates.showCart !== undefined) doc.showCart = updates.showCart;
        if (updates.showWishlist !== undefined) doc.showWishlist = updates.showWishlist;
        if (updates.showAccount !== undefined) doc.showAccount = updates.showAccount;
        if (updates.showSearch !== undefined) doc.showSearch = updates.showSearch;
        if (updates.sticky !== undefined) doc.sticky = updates.sticky;
        if (updates.items !== undefined) doc.items = updates.items as any;
        if (updates.announcement !== undefined) doc.announcement = updates.announcement;

        await doc.save();
      }
      result = doc.toObject();
    } catch (err) {
      console.warn("Mongo updateNavbarConfig error, saved to memory:", err);
    }
  }

  memoryStore.navbarConfig = result;
  saveLocalStore();
  return result;
}

export async function getSeoConfig(): Promise<ISeoConfig> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const doc = await SeoConfigModel.findOne().lean();
      if (doc) {
        return {
          siteTitle: doc.siteTitle || initialSeoConfig.siteTitle,
          titleTemplate: doc.titleTemplate || initialSeoConfig.titleTemplate,
          metaDescription: doc.metaDescription || initialSeoConfig.metaDescription,
          keywords: doc.keywords || initialSeoConfig.keywords,
          canonicalUrl: doc.canonicalUrl || initialSeoConfig.canonicalUrl,
          ogTitle: doc.ogTitle || initialSeoConfig.ogTitle,
          ogDescription: doc.ogDescription || initialSeoConfig.ogDescription,
          ogImage: doc.ogImage || initialSeoConfig.ogImage,
          ogType: doc.ogType || initialSeoConfig.ogType,
          twitterCard: (doc.twitterCard as any) || initialSeoConfig.twitterCard,
          twitterHandle: doc.twitterHandle || initialSeoConfig.twitterHandle,
          robotsIndex: doc.robotsIndex ?? initialSeoConfig.robotsIndex,
          robotsFollow: doc.robotsFollow ?? initialSeoConfig.robotsFollow,
          googleSiteVerification: doc.googleSiteVerification || "",
          focusKeywords: doc.focusKeywords || initialSeoConfig.focusKeywords,
        };
      } else {
        const created = await SeoConfigModel.create(initialSeoConfig);
        return created.toObject();
      }
    } catch (err) {
      console.warn("Mongo getSeoConfig fallback to local memory:", err);
    }
  }

  if (!memoryStore.seoConfig) {
    memoryStore.seoConfig = { ...initialSeoConfig };
    saveLocalStore();
  }
  return memoryStore.seoConfig;
}

export async function updateSeoConfig(
  updates: Partial<ISeoConfig>
): Promise<ISeoConfig> {
  await connectToDatabase();
  let result: ISeoConfig = {
    ...initialSeoConfig,
    ...(memoryStore.seoConfig || {}),
    ...updates,
  };

  if (isMongoConnected()) {
    try {
      let doc = await SeoConfigModel.findOne();
      if (!doc) {
        doc = await SeoConfigModel.create({ ...initialSeoConfig, ...updates });
      } else {
        if (updates.siteTitle !== undefined) doc.siteTitle = updates.siteTitle;
        if (updates.titleTemplate !== undefined) doc.titleTemplate = updates.titleTemplate;
        if (updates.metaDescription !== undefined) doc.metaDescription = updates.metaDescription;
        if (updates.keywords !== undefined) doc.keywords = updates.keywords;
        if (updates.canonicalUrl !== undefined) doc.canonicalUrl = updates.canonicalUrl;
        if (updates.ogTitle !== undefined) doc.ogTitle = updates.ogTitle;
        if (updates.ogDescription !== undefined) doc.ogDescription = updates.ogDescription;
        if (updates.ogImage !== undefined) doc.ogImage = updates.ogImage;
        if (updates.ogType !== undefined) doc.ogType = updates.ogType;
        if (updates.twitterCard !== undefined) doc.twitterCard = updates.twitterCard;
        if (updates.twitterHandle !== undefined) doc.twitterHandle = updates.twitterHandle;
        if (updates.robotsIndex !== undefined) doc.robotsIndex = updates.robotsIndex;
        if (updates.robotsFollow !== undefined) doc.robotsFollow = updates.robotsFollow;
        if (updates.googleSiteVerification !== undefined)
          doc.googleSiteVerification = updates.googleSiteVerification;
        if (updates.focusKeywords !== undefined) doc.focusKeywords = updates.focusKeywords;

        await doc.save();
      }
      result = doc.toObject();
    } catch (err) {
      console.warn("Mongo updateSeoConfig error, saved to memory:", err);
    }
  }

  memoryStore.seoConfig = result;
  saveLocalStore();
  return result;
}

// ---------------- USERS & CUSTOMERS ----------------
export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized) return null;

  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const raw = await UserModel.findOne({ email: normalized }).lean();
      if (raw) {
        return {
          ...raw,
          _id: raw._id.toString(),
          createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
        } as unknown as User;
      }
    } catch {
      // fallback to memory
    }
  }

  const found = (memoryStore.users || []).find(
    (u) => (u.email || "").trim().toLowerCase() === normalized
  );
  return found || null;
}

export async function findUserWithPassword(
  email: string
): Promise<(User & { password?: string }) | null> {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized) return null;

  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const raw = await UserModel.findOne({ email: normalized }).select("+password").lean();
      if (raw) {
        return {
          ...raw,
          _id: raw._id.toString(),
          createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
        } as unknown as User & { password?: string };
      }
    } catch {
      // fallback to memory
    }
  }

  const found = (memoryStore.users || []).find(
    (u) => (u.email || "").trim().toLowerCase() === normalized
  );
  return (found as (User & { password?: string })) || null;
}

export async function createCustomerUser(data: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: "customer" | "admin";
}): Promise<User> {
  const normalizedEmail = data.email.trim().toLowerCase();
  await connectToDatabase();

  const newUser: User & { password?: string } = {
    _id: "usr-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: data.name.trim(),
    email: normalizedEmail,
    role: data.role || "customer",
    phone: data.phone?.trim() || "",
    password: data.password,
    wishlist: [],
    addresses: [],
    createdAt: new Date().toISOString(),
  };

  if (isMongoConnected()) {
    try {
      const created = await UserModel.create({
        name: newUser.name,
        email: newUser.email,
        password: data.password,
        role: newUser.role,
        phone: newUser.phone,
        wishlist: [],
        addresses: [],
      });
      newUser._id = created._id.toString();
    } catch (e) {
      console.warn("MongoDB user create note:", e);
    }
  }

  if (!memoryStore.users) memoryStore.users = [];
  memoryStore.users.push(newUser);
  saveLocalStore();

  const { password: _, ...safeUser } = newUser;
  return safeUser as User;
}

export async function getUserById(id: string): Promise<User | null> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const raw = await UserModel.findById(id).lean();
      if (raw) {
        return {
          ...raw,
          _id: raw._id.toString(),
          createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
        } as unknown as User;
      }
    } catch {
      // fallback
    }
  }

  return (memoryStore.users || []).find((u) => u._id === id) || null;
}

// ==========================================
// STOREFRONT FOOTER & CONTENT CONFIGURATION
// ==========================================

export async function getFooterConfig(): Promise<IFooterConfig> {
  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      const doc = await FooterConfigModel.findOne().lean();
      if (doc) {
        return {
          columns: Array.isArray(doc.columns) && doc.columns.length > 0
            ? doc.columns.map((col: any) => ({
                id: col.id || `col-${Math.random().toString(36).substring(2, 7)}`,
                title: col.title || "Column",
                links: Array.isArray(col.links)
                  ? col.links.map((link: any) => ({
                      id: link.id || `link-${Math.random().toString(36).substring(2, 7)}`,
                      label: link.label || "Link",
                      href: link.href || "/",
                      isExternal: Boolean(link.isExternal),
                    }))
                  : [],
              }))
            : initialFooterConfig.columns,
          newsletterTitle: doc.newsletterTitle || initialFooterConfig.newsletterTitle,
          newsletterSubtitle: doc.newsletterSubtitle || initialFooterConfig.newsletterSubtitle,
          newsletterButtonText: doc.newsletterButtonText || initialFooterConfig.newsletterButtonText,
          brandWordmark: doc.brandWordmark || initialFooterConfig.brandWordmark,
          missionStatement: doc.missionStatement || initialFooterConfig.missionStatement,
          copyrightText: doc.copyrightText || initialFooterConfig.copyrightText,
        };
      } else {
        const created = await FooterConfigModel.create(initialFooterConfig);
        return created.toObject();
      }
    } catch (err) {
      console.warn("Mongo getFooterConfig fallback to local memory:", err);
    }
  }

  if (!memoryStore.footerConfig || !Array.isArray(memoryStore.footerConfig.columns)) {
    memoryStore.footerConfig = { ...initialFooterConfig };
    saveLocalStore();
  }
  return memoryStore.footerConfig;
}

export async function updateFooterConfig(
  updates: Partial<IFooterConfig>
): Promise<IFooterConfig> {
  await connectToDatabase();
  let result: IFooterConfig = {
    ...initialFooterConfig,
    ...(memoryStore.footerConfig || {}),
    ...updates,
  };

  if (isMongoConnected()) {
    try {
      let doc = await FooterConfigModel.findOne();
      if (!doc) {
        doc = await FooterConfigModel.create({ ...initialFooterConfig, ...updates });
      } else {
        if (updates.columns !== undefined) doc.columns = updates.columns as any;
        if (updates.newsletterTitle !== undefined) doc.newsletterTitle = updates.newsletterTitle;
        if (updates.newsletterSubtitle !== undefined) doc.newsletterSubtitle = updates.newsletterSubtitle;
        if (updates.newsletterButtonText !== undefined) doc.newsletterButtonText = updates.newsletterButtonText;
        if (updates.brandWordmark !== undefined) doc.brandWordmark = updates.brandWordmark;
        if (updates.missionStatement !== undefined) doc.missionStatement = updates.missionStatement;
        if (updates.copyrightText !== undefined) doc.copyrightText = updates.copyrightText;
        await doc.save();
      }
      result = doc.toObject();
    } catch (err) {
      console.warn("Mongo updateFooterConfig fallback to local memory:", err);
    }
  }

  memoryStore.footerConfig = result;
  saveLocalStore();
  return result;
}


