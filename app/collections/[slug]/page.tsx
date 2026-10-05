import React from "react";
import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { getCollections, getProducts } from "@/lib/dataService";

export const revalidate = 0;

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collections = await getCollections();
  const currentCollection = collections.find((c) => c.slug === slug);

  // Fetch products matching this collection or tag
  const allProducts = await getProducts({});
  const collectionProducts = allProducts.filter(
    (p) =>
      p.collectionName?.toLowerCase() === slug.toLowerCase() ||
      p.category?.toLowerCase() === slug.toLowerCase() ||
      p.tags.some((t) => t.toLowerCase().includes(slug.toLowerCase()))
  );

  const title = currentCollection?.title || slug.replace("-", " ").toUpperCase();
  const description =
    currentCollection?.description || "Curated streetwear pieces from the Dimension archive.";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        {/* Banner */}
        <div className="relative w-full h-72 sm:h-96 bg-neutral-900 flex items-center justify-center text-white overflow-hidden">
          {currentCollection?.bannerImage && (
            <Image
              src={currentCollection.bannerImage}
              alt={title}
              fill
              priority
              className="object-cover object-center opacity-40 filter grayscale-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="relative z-10 text-center px-4 max-w-3xl">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-2">
              COLLECTION ARCHIVE
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight whitespace-nowrap">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-light mt-2 max-w-xl mx-auto font-description">
              {description}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
            <span className="text-xs font-mono font-bold uppercase text-neutral-600">
              Showing {collectionProducts.length} Pieces
            </span>
            <Link
              href="/collections"
              className="text-xs font-mono font-bold uppercase underline text-neutral-600 hover:text-black"
            >
              All Collections
            </Link>
          </div>

          {collectionProducts.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 border border-neutral-200 rounded">
              <p className="text-xs font-mono uppercase text-neutral-500 mb-4">
                No items currently allocated for this collection drop.
              </p>
              <Link
                href="/shop"
                className="px-6 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {collectionProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
