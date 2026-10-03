import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  productId: string;
  productSlug?: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: "Pending" | "Approved" | "Rejected" | "Featured";
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: String, required: true, index: true },
    productSlug: { type: String, index: true },
    productName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Featured"],
      default: "Pending",
      index: true,
    },
    verifiedPurchase: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ReviewModel: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
