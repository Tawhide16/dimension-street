import mongoose, { Schema, Document, Model } from "mongoose";
import {
  IFooterLink,
  IFooterColumn,
  IFooterConfig,
  initialFooterConfig,
} from "@/types/footer";

export * from "@/types/footer";

export interface IFooterConfigDocument extends IFooterConfig, Document {
  createdAt: Date;
  updatedAt: Date;
}

const FooterLinkSchema = new Schema<IFooterLink>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    href: { type: String, required: true },
    isExternal: { type: Boolean, default: false },
  },
  { _id: false }
);

const FooterColumnSchema = new Schema<IFooterColumn>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    links: { type: [FooterLinkSchema], default: [] },
  },
  { _id: false }
);

const FooterConfigSchema = new Schema<IFooterConfigDocument>(
  {
    columns: { type: [FooterColumnSchema], default: initialFooterConfig.columns },
    newsletterTitle: { type: String, default: initialFooterConfig.newsletterTitle },
    newsletterSubtitle: { type: String, default: initialFooterConfig.newsletterSubtitle },
    newsletterButtonText: { type: String, default: initialFooterConfig.newsletterButtonText },
    brandWordmark: { type: String, default: initialFooterConfig.brandWordmark },
    missionStatement: { type: String, default: initialFooterConfig.missionStatement },
    copyrightText: { type: String, default: initialFooterConfig.copyrightText },
  },
  { timestamps: true }
);

export const FooterConfigModel: Model<IFooterConfigDocument> =
  mongoose.models.FooterConfig ||
  mongoose.model<IFooterConfigDocument>("FooterConfig", FooterConfigSchema);
