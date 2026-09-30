import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHomepageSection extends Document {
  type: string;
  title: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const HomepageSectionSchema = new Schema<IHomepageSection>(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const HomepageSectionModel: Model<IHomepageSection> =
  mongoose.models.HomepageSection ||
  mongoose.model<IHomepageSection>("HomepageSection", HomepageSectionSchema);
