import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICollection extends Document {
  title: string;
  slug: string;
  description?: string;
  bannerImage: string;
  itemCount: number;
  featured: boolean;
}

const CollectionSchema = new Schema<ICollection>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    bannerImage: { type: String, required: true },
    itemCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CollectionModel: Model<ICollection> =
  mongoose.models.Collection || mongoose.model<ICollection>("Collection", CollectionSchema);
