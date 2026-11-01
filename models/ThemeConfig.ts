import mongoose, { Schema, Document, Model } from "mongoose";
import { IThemeConfig, initialThemeConfig } from "@/types/theme";

export * from "@/types/theme";

export interface IThemeConfigDocument extends IThemeConfig, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ThemeConfigSchema = new Schema<IThemeConfigDocument>(
  {
    primaryColor: { type: String, default: initialThemeConfig.primaryColor },
    accentColor: { type: String, default: initialThemeConfig.accentColor },
    backgroundColor: { type: String, default: initialThemeConfig.backgroundColor },
    buttonRadius: { type: String, default: initialThemeConfig.buttonRadius },
    fontFamily: { type: String, default: initialThemeConfig.fontFamily },
    desktopHeadingSize: { type: Number, default: initialThemeConfig.desktopHeadingSize },
    mobileHeadingSize: { type: Number, default: initialThemeConfig.mobileHeadingSize },
    desktopBodySize: { type: Number, default: initialThemeConfig.desktopBodySize },
    mobileBodySize: { type: Number, default: initialThemeConfig.mobileBodySize },
  },
  { timestamps: true }
);

export const ThemeConfigModel: Model<IThemeConfigDocument> =
  mongoose.models.ThemeConfig ||
  mongoose.model<IThemeConfigDocument>("ThemeConfig", ThemeConfigSchema);

