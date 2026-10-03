import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductVariant {
  sku: string;
  color: string;
  colorHex?: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  variants: IProductVariant[];
  category: string;
  collectionName?: string;
  tags: string[];
  sku: string;
  totalStock: number;
  status: "active" | "draft" | "archived";
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  rating: number;
  reviewCount: number;
  details?: {
    fit?: string;
    material?: string;
    care?: string;
    shipping?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  vendor?: string;
  productType?: string;
  inventoryTracked?: boolean;
  barcode?: string;
  packageType?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  weight?: {
    value?: number;
    unit?: string;
  };
  countryOfOrigin?: string;
  hsCode?: string;
  chargeTax?: boolean;
  themeTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  sku: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String },
}, { _id: false });

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "Premium heavyweight streetwear garment." },
    shortDescription: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    costPrice: { type: Number },
    variants: [ProductVariantSchema],
    category: { type: String, required: true, index: true },
    collectionName: { type: String, index: true },
    tags: [{ type: String }],
    sku: { type: String, required: true, index: true },
    totalStock: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    details: {
      fit: { type: String },
      material: { type: String },
      care: { type: String },
      shipping: { type: String },
    },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },
    vendor: { type: String },
    productType: { type: String },
    inventoryTracked: { type: Boolean, default: true },
    barcode: { type: String },
    packageType: { type: String },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: "in" },
    },
    weight: {
      value: { type: Number },
      unit: { type: String, default: "lb" },
    },
    countryOfOrigin: { type: String },
    hsCode: { type: String },
    chargeTax: { type: Boolean, default: true },
    themeTemplate: { type: String, default: "Default product" },
  },
  { timestamps: true }
);

export const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
