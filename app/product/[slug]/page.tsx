import React from "react";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductDetailView from "@/components/product/ProductDetailView";
import { getProductBySlug, getProducts, getReviews } from "@/lib/dataService";
import type { Metadata } from "next";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | DIMENSION STREET",
    };
  }

  return {
    title: `${product.name} — DIMENSION STREET`,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | DIMENSION STREET`,
      description: product.shortDescription || product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get related products in same category
  const allRelated = await getProducts({ category: product.category });

  // Also ensure any explicitly linked variant sister products are included
  const linkedSlugs = (product.variants || [])
    .map((v) => v.linkedProductSlug)
    .filter((s): s is string => Boolean(s && s !== product.slug && !allRelated.some((p) => p.slug === s)));

  if (linkedSlugs.length > 0) {
    const extraProds = await Promise.all(linkedSlugs.map((s) => getProductBySlug(s)));
    for (const ep of extraProds) {
      if (ep && !allRelated.some((p) => p._id === ep._id)) {
        allRelated.push(ep);
      }
    }
  }

  const related = allRelated.filter((p) => p._id !== product._id).slice(0, 4);
  const initialReviews = await getReviews(product._id);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <ProductDetailView
          key={product.slug}
          product={product}
          relatedProducts={related}
          allCategoryProducts={allRelated}
          initialReviews={initialReviews}
        />
      </main>
      <Footer />
    </div>
  );
}
