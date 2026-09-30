import React from "react";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ShopCatalogView from "@/components/store/ShopCatalogView";
import { getProducts, getCategories, getCollections } from "@/lib/dataService";

export const revalidate = 0;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; collection?: string }>;
}) {
  const params = await searchParams;
  const [products, categories, collections] = await Promise.all([
    getProducts({}),
    getCategories(),
    getCollections(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <ShopCatalogView
          initialProducts={products}
          categories={categories}
          collections={collections}
          initialCategory={params.category}
          initialCollection={params.collection}
        />
      </main>
      <Footer />
    </div>
  );
}
