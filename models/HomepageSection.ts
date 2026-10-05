import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHomepageSection extends Document {
  type: string;
  title: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const HomepageSectionSchema = new Schema<IHomepageSection>(
  {
    type: { type: String, required: true },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    hideOnDesktop: { type: Boolean, default: false },
    hideOnMobile: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const HomepageSectionModel: Model<IHomepageSection> =
  mongoose.models.HomepageSection ||
  mongoose.model<IHomepageSection>("HomepageSection", HomepageSectionSchema);
