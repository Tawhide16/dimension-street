import React from "react";
import LiveStorefront from "@/components/store/LiveStorefront";
import { LiveCmsProvider } from "@/components/cms/LiveCmsContext";
import ShopifyPreviewFrame from "@/components/cms/ShopifyPreviewFrame";
import LiveCmsDrawer from "@/components/cms/LiveCmsDrawer";
import AdminFloatingTrigger from "@/components/cms/AdminFloatingTrigger";
import {
  getProducts,
  getCategories,
  getReviews,
  getHomepageSections,
  getThemeConfig,
  getFooterConfig,
  getNavbarConfig,
  getCollections,
} from "@/lib/dataService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [
    sections,
    categories,
    newArrivals,
    bestSellers,
    reviews,
    themeConfig,
    footerConfig,
    navbarConfig,
    collections,
  ] = await Promise.all([
    getHomepageSections(),
    getCategories(),
    getProducts({ newArrival: true }),
    getProducts({ bestSeller: true }),
    getReviews(),
    getThemeConfig(),
    getFooterConfig(),
    getNavbarConfig(),
    getCollections(),
  ]);

  return (
    <LiveCmsProvider
      initialSections={sections}
      initialTheme={themeConfig}
      initialFooter={footerConfig}
      initialNavigation={navbarConfig}
      initialCollections={collections}
    >
      <ShopifyPreviewFrame>
        <LiveStorefront
          initialSections={sections}
          categories={categories}
          newArrivals={newArrivals}
          bestSellers={bestSellers}
          reviews={reviews}
        />
      </ShopifyPreviewFrame>

      {/* Slide-out Visual Customizer Drawer (Dock left or right) */}
      <LiveCmsDrawer />

      {/* Floating Admin Trigger & Quick Password Unlock */}
      <AdminFloatingTrigger />
    </LiveCmsProvider>
  );
}
