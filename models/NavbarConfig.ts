import mongoose, { Schema, Document, Model } from "mongoose";

export interface INavItem {
  id: string;
  label: string;
  href: string;
  isActive: boolean;
  isExternal?: boolean;
  badge?: string;
  badgeColor?: string;
}

export interface INavbarConfig {
  logoType: "image" | "text";
  logoText: string;
  logoImageUrl: string;
  menuPillLabel: string;
  showCart: boolean;
  showWishlist: boolean;
  showAccount: boolean;
  showSearch: boolean;
  sticky: boolean;
  items: INavItem[];
  announcement: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
    bgColor?: string;
    textColor?: string;
  };
}

export interface INavbarConfigDocument extends INavbarConfig, Document {
  createdAt: Date;
  updatedAt: Date;
}

const NavItemSchema = new Schema<INavItem>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    href: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isExternal: { type: Boolean, default: false },
    badge: { type: String, default: "" },
    badgeColor: { type: String, default: "bg-rose-500" },
  },
  { _id: false }
);

const NavbarConfigSchema = new Schema<INavbarConfigDocument>(
  {
    logoType: { type: String, enum: ["image", "text"], default: "image" },
    logoText: { type: String, default: "DIMENSION STREET" },
    logoImageUrl: { type: String, default: "/images/logo.png" },
    menuPillLabel: { type: String, default: "Menu" },
    showCart: { type: Boolean, default: true },
    showWishlist: { type: Boolean, default: true },
    showAccount: { type: Boolean, default: true },
    showSearch: { type: Boolean, default: true },
    sticky: { type: Boolean, default: true },
    items: { type: [NavItemSchema], default: [] },
    announcement: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: "Dimension Street — Made in Bangladesh" },
      linkUrl: { type: String, default: "" },
      bgColor: { type: String, default: "#000000" },
      textColor: { type: String, default: "#ffffff" },
    },
  },
  { timestamps: true }
);

export const NavbarConfigModel: Model<INavbarConfigDocument> =
  mongoose.models.NavbarConfig ||
  mongoose.model<INavbarConfigDocument>("NavbarConfig", NavbarConfigSchema);
