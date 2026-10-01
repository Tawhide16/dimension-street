export interface ProductVariant {
  sku: string;
  color: string;
  colorHex?: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  variants: ProductVariant[];
  category: string;
  collectionName?: string;
  tags: string[];
  sku: string;
  totalStock: number;
  status: "active" | "draft" | "archived";
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  rating: number;
  reviewCount: number;
  details?: {
    fit?: string;
    material?: string;
    care?: string;
    shipping?: string;
  };
  seo?: ProductSEO;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  itemCount?: number;
  featured?: boolean;
}

export interface CollectionItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  bannerImage: string;
  itemCount?: number;
  featured?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned"
  | "Refunded";

export type PaymentMethod = "cod" | "card" | "bkash" | "nagad";

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    userId?: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: "Pending" | "Approved" | "Rejected" | "Featured";
  verifiedPurchase: boolean;
  image?: string;
  productSlug?: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "superadmin";
  phone?: string;
  avatar?: string;
  addresses?: ShippingAddress[];
  wishlist?: string[];
  createdAt: string;
}

export interface HomepageSection {
  _id: string;
  type: "hero" | "new_arrivals" | "promo_banner" | "shop_by_category" | "brand_story" | "best_sellers" | "statement_banner" | "community_gallery";
  title: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface AdminAnalytics {
  revenue: number;
  revenueBdt: number;
  totalOrders: number;
  pendingDispatch: number;
  actualCustomers: number;
  verifiedBuyers: number;
  activeCatalogCount: number;
  outOfStockCount: number;
  fulfillmentRate: number;
  averageOrderValue: number;
  recentOrders: Order[];
  topSelling: {
    productId: string;
    name: string;
    image: string;
    salesCount: number;
    revenue: number;
  }[];
  revenueTrend: {
    date: string;
    amount: number;
    orders: number;
  }[];
}

export interface CommunityReel {
  _id: string;
  title: string;
  videoUrl: string;
  posterUrl?: string;
  product: {
    id?: string;
    name: string;
    price: number;
    slug: string;
    thumbnail: string;
  };
  likes?: number;
  isActive: boolean;
  createdAt: string;
}
