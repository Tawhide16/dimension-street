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
import fs from "fs";
import path from "path";

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
}

function loadLocalStore(): LocalStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
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
  memoryStore.products = memoryStore.products.filter((p) => p._id !== id);
  saveLocalStore();

  await connectToDatabase();
  if (isMongoConnected()) {
    try {
      await ProductModel.deleteOne({ _id: id });
    } catch {
      // ignore
    }
  }
  return true;
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
  if (productId) {
    return memoryStore.reviews.filter((r) => r.productId === productId);
  }
  return memoryStore.reviews;
}

export async function createReview(data: Partial<Review>): Promise<Review> {
  const prod = memoryStore.products.find(
    (p) => p._id === data.productId || p.slug === data.productSlug
  );

  const newReview: Review = {
    _id: `rev-${Date.now()}`,
    productId: data.productId || prod?._id || "",
    productName: data.productName || prod?.name || "Dimension Streetwear Item",
    productSlug: data.productSlug || prod?.slug || "dimension-isometric-heavyweight-tee",
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
    const productReviews = memoryStore.reviews.filter((r) => r.productId === prod._id);
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    prod.reviewCount = productReviews.length;
    prod.rating = Number((totalRating / productReviews.length).toFixed(1));
  }

  saveLocalStore();
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
export async function getHomepageSections(): Promise<HomepageSection[]> {
  return [...memoryStore.homepageSections].sort((a, b) => a.order - b.order);
}

export async function updateHomepageSection(id: string, updates: Partial<HomepageSection>): Promise<HomepageSection | null> {
  const section = memoryStore.homepageSections.find((s) => s._id === id);
  if (section) {
    Object.assign(section, updates);
    saveLocalStore();
    return section;
  }
  return null;
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
