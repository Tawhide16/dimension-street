import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISeoConfig {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: "summary" | "summary_large_image";
  twitterHandle: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleSiteVerification: string;
  focusKeywords: string;
}

export interface ISeoConfigDocument extends ISeoConfig, Document {
  createdAt: Date;
  updatedAt: Date;
}

const SeoConfigSchema = new Schema<ISeoConfigDocument>(
  {
    siteTitle: {
      type: String,
      default: "DIMENSION STREET — Premium Heavyweight Streetwear",
    },
    titleTemplate: {
      type: String,
      default: "%s | DIMENSION STREET",
    },
    metaDescription: {
      type: String,
      default:
        "Architectural silhouettes crafted from custom milled 320–480 GSM organic cotton knits. Designed in Dhaka, worn worldwide.",
    },
    keywords: {
      type: String,
      default:
        "Dimension Street, streetwear, heavyweight hoodie, oversized tee, tactical pants, Dhaka streetwear, 320 GSM, bangladesh streetwear",
    },
    canonicalUrl: {
      type: String,
      default: "https://dimensionstreet.com",
    },
    ogTitle: {
      type: String,
      default: "DIMENSION STREET — Heavyweight Essentials",
    },
    ogDescription: {
      type: String,
      default: "Premium architectural streetwear designed for every dimension.",
    },
    ogImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    },
    ogType: {
      type: String,
      default: "website",
    },
    twitterCard: {
      type: String,
      default: "summary_large_image",
    },
    twitterHandle: {
      type: String,
      default: "@dimensionstreet",
    },
    robotsIndex: {
      type: Boolean,
      default: true,
    },
    robotsFollow: {
      type: Boolean,
      default: true,
    },
    googleSiteVerification: {
      type: String,
      default: "",
    },
    focusKeywords: {
      type: String,
      default: "streetwear, heavyweight hoodie, dhaka",
    },
  },
  { timestamps: true }
);

export const SeoConfigModel: Model<ISeoConfigDocument> =
  mongoose.models.SeoConfig ||
  mongoose.model<ISeoConfigDocument>("SeoConfig", SeoConfigSchema);
