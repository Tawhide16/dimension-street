import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "customer" | "admin" | "superadmin";
  phone?: string;
  avatar?: string;
  addresses?: Array<{
    fullName: string;
    email: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  }>;
  wishlist?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { type: String, enum: ["customer", "admin", "superadmin"], default: "customer" },
    phone: { type: String },
    avatar: { type: String },
    addresses: [AddressSchema],
    wishlist: [{ type: String }],
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
