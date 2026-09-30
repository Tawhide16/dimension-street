import React from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import HeroBanner from "@/components/store/HeroBanner";
import PromoCountdownBanner from "@/components/store/PromoCountdownBanner";
import CategoryGrid from "@/components/store/CategoryGrid";
import BrandStorySection from "@/components/store/BrandStorySection";
import CommunityFeed from "@/components/store/CommunityFeed";
import ProductCard from "@/components/store/ProductCard";
import BestSellingSection from "@/components/store/BestSellingSection";
import {
  getProducts,
  getCategories,
  getReviews,
  getHomepageSections,
} from "@/lib/dataService";
import { ArrowRight, ArrowUpRight, Flame } from "lucide-react";
import { ensureSeasonImages } from "@/lib/copySeasonImages";

export const dynamic = "force-dynamic";
export const revalidate = 0; // dynamic on request

export default async function HomePage() {
  ensureSeasonImages();
  const [sections, categories, newArrivals, bestSellers, reviews] = await Promise.all([
    getHomepageSections(),
    getCategories(),
    getProducts({ newArrival: true }),
    getProducts({ bestSeller: true }),
    getReviews(),
  ]);

  const heroSection = sections.find((s) => s.type === "hero");
  const heroData = (heroSection?.data || {}) as Record<string, string>;

  return (
    <div className="min-h-screen flex flex-col bg-white" suppressHydrationWarning>
      {/* Top Banner */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header />

      <main className="flex-1 -mt-[84px]">
        {/* 1. Hero Banner */}
        <HeroBanner
          title={heroSection?.title || "HERO BANNER"}
          subtitle={heroSection?.subtitle || "Primary Homepage Billboard"}
          ctaText={heroData.ctaText && heroData.ctaText !== "SHOP COLLECTION" && heroData.ctaText !== "SHOP NOW" ? heroData.ctaText : "BESTSELLERS"}
          ctaLink={heroData.ctaLink || "/shop"}
          secondaryCtaText={heroData.secondaryCtaText || "SHOP PINK"}
          secondaryCtaLink={heroData.secondaryCtaLink || "/shop"}
          backgroundImage={heroData.backgroundImage || "/images/hero-banner.jpg"}
        />

        {/* 2. New Arrivals Grid */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 pb-3 border-b border-neutral-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
                NEW ARRIVALS
              </h2>
            </div>
            <Link
              href="/collections/new-arrivals"
              className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-600 hover:text-black flex items-center gap-1 mt-2 sm:mt-0 transition-colors"
            >
              <span>VIEW ALL NEW</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} showBadges={false} />
            ))}
          </div>
        </section>

        {/* 3. Limited Archive Countdown Banner */}
        <PromoCountdownBanner />

        {/* 4. Shop By Category Cards */}
        <CategoryGrid categories={categories} />

        {/* 5. Brand Story Split Section */}
        <BrandStorySection />

        {/* 6. Best Selling Products */}
        <BestSellingSection />

        {/* 7. Statement Editorial Banner */}
        <section className="py-12 sm:py-14 bg-black text-white text-center border-y border-neutral-900 px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-neutral-500">
              ORIGINAL CLOTHING ARCHIVE // DHAKA
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              WE DON&apos;T FOLLOW TRENDS. <br />
              <span className="text-neutral-400">WE FORGE THE CONSTANTS.</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
              Every seam, weight, and silhouette is engineered with deliberate purpose. Built to endure season after season.
            </p>
          </div>
        </section>

        {/* 8. Community Photos & Verified Reviews */}
        <CommunityFeed reviews={reviews} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
