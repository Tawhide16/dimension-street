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

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSectionVisibility(section?: { isActive?: boolean; hideOnDesktop?: boolean; hideOnMobile?: boolean }) {
  if (!section || section.isActive === false) return "hidden";
  if (section.hideOnDesktop && section.hideOnMobile) return "hidden";
  if (section.hideOnDesktop) return "hidden-on-desktop";
  if (section.hideOnMobile) return "hidden-on-mobile";
  return "";
}

export default async function HomePage() {
  const [sections, categories, newArrivals, bestSellers, reviews] = await Promise.all([
    getHomepageSections(),
    getCategories(),
    getProducts({ newArrival: true }),
    getProducts({ bestSeller: true }),
    getReviews(),
  ]);

  const heroSection = sections.find((s) => s.type === "hero");
  const heroData = (heroSection?.data || {}) as Record<string, string>;
  const heroVisibility = getSectionVisibility(heroSection);

  const newArrivalsSection = sections.find((s) => s.type === "new_arrivals");
  const newArrivalsData = (newArrivalsSection?.data || {}) as Record<string, unknown>;
  const newArrivalsLimit = Number(newArrivalsData.limit) || 4;
  const newArrivalsVisibility = getSectionVisibility(newArrivalsSection);

  const promoSection = sections.find((s) => s.type === "promo_banner");
  const promoData = (promoSection?.data || {}) as Record<string, unknown>;
  const promoVisibility = getSectionVisibility(promoSection);

  const categoriesSection = sections.find((s) => s.type === "shop_by_category");
  const categoriesVisibility = getSectionVisibility(categoriesSection);

  const brandStorySection = sections.find((s) => s.type === "brand_story");
  const brandStoryData = (brandStorySection?.data || {}) as Record<string, string>;
  const brandStoryVisibility = getSectionVisibility(brandStorySection);

  const bestSellersSection = sections.find((s) => s.type === "best_sellers");
  const bestSellersVisibility = getSectionVisibility(bestSellersSection);

  const statementSection = sections.find((s) => s.type === "statement_banner");
  const statementData = (statementSection?.data || {}) as Record<string, string>;
  const statementVisibility = getSectionVisibility(statementSection);

  const communitySection = sections.find((s) => s.type === "community_gallery");
  const communityVisibility = getSectionVisibility(communitySection);

  return (
    <div className="min-h-screen flex flex-col bg-white" suppressHydrationWarning>
      {/* Top Banner */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header />

      <main className="flex-1 -mt-[84px]">
        {/* 1. Hero Banner */}
        {heroVisibility !== "hidden" && (
          <div className={heroVisibility || undefined}>
            <HeroBanner
              title={heroSection?.title || "HERO BANNER"}
              subtitle={heroSection?.subtitle || "Primary Homepage Billboard"}
              ctaText={
                heroData.ctaText &&
                heroData.ctaText !== "SHOP COLLECTION" &&
                heroData.ctaText !== "SHOP NOW"
                  ? heroData.ctaText
                  : "BESTSELLERS"
              }
              ctaLink={heroData.ctaLink || "/shop"}
              secondaryCtaText={heroData.secondaryCtaText || "SHOP PINK"}
              secondaryCtaLink={heroData.secondaryCtaLink || "/shop"}
              backgroundImage={heroData.backgroundImage || "/images/hero-banner.jpg"}
              mobileBackgroundImage={heroData.mobileBackgroundImage}
            />
          </div>
        )}

        {/* 2. New Arrivals Grid */}
        {newArrivalsVisibility !== "hidden" && (
          <div className={newArrivalsVisibility || undefined}>
            <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 pb-3 border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
                    {newArrivalsSection?.title || "NEW ARRIVALS"}
                  </h2>
                  {newArrivalsSection?.subtitle && (
                    <p className="text-xs text-neutral-500 font-mono mt-1">
                      {newArrivalsSection.subtitle}
                    </p>
                  )}
                </div>
                <Link
                  href={(newArrivalsData.viewAllLink as string) || "/collections/new-arrivals"}
                  className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-600 hover:text-black flex items-center gap-1 mt-2 sm:mt-0 transition-colors"
                >
                  <span>{(newArrivalsData.viewAllText as string) || "VIEW ALL NEW"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {newArrivals.slice(0, newArrivalsLimit).map((product) => (
                  <ProductCard key={product._id} product={product} showBadges={false} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 3. Limited Archive Countdown Banner */}
        {promoVisibility !== "hidden" && (
          <div className={promoVisibility || undefined}>
            <PromoCountdownBanner
              title={promoSection?.title || "Offer Closing Soon..."}
              buttonText={(promoData.buttonText as string) || "VIEW COLLECTION"}
              buttonLink={(promoData.buttonLink as string) || "/shop?sort=discount"}
              bgImage={(promoData.bgImage as string) || "/images/offer_closing_banner.jpg"}
              topMarqueeText={promoData.topMarqueeText as string | undefined}
              bottomMarqueeText={promoData.bottomMarqueeText as string | undefined}
              countdownHours={Number(promoData.countdownHours) || 36}
            />
          </div>
        )}

        {/* 4. Shop By Category Cards */}
        {categoriesVisibility !== "hidden" && (
          <div className={categoriesVisibility || undefined}>
            <CategoryGrid
              categories={categories}
              title={categoriesSection?.title || "MUST HAVES FOR THE SEASON"}
              subtitle={categoriesSection?.subtitle}
            />
          </div>
        )}

        {/* 5. Brand Story Split Section */}
        {brandStoryVisibility !== "hidden" && (
          <div className={brandStoryVisibility || undefined}>
            <BrandStorySection
              badge={brandStoryData.badge || "OUR STORY"}
              title={brandStorySection?.title || "Community First. \nQuality Always."}
              description={
                brandStoryData.description ||
                brandStorySection?.subtitle ||
                "We started with one idea: build the pieces we couldn't find. No seasonal noise, no shortcuts — just essentials made properly, for people who wear them every day."
              }
              pillar1Title={brandStoryData.pillar1Title || "PREMIUM FABRICS"}
              pillar1Desc={brandStoryData.pillar1Desc || "Heavyweight cotton, garment washed."}
              pillar2Title={brandStoryData.pillar2Title || "CONSIDERED FIT"}
              pillar2Desc={brandStoryData.pillar2Desc || "Boxy, dropped shoulder, true to size."}
              pillar3Title={brandStoryData.pillar3Title || "MADE WITH PURPOSE"}
              pillar3Desc={brandStoryData.pillar3Desc || "Small runs, no seasonal waste."}
              buttonText={brandStoryData.buttonText || "LEARN MORE ABOUT US"}
              buttonLink={brandStoryData.buttonLink || "/about"}
              image={brandStoryData.image || "/images/community_our_story.jpg"}
            />
          </div>
        )}

        {/* 6. Best Selling Products */}
        {bestSellersVisibility !== "hidden" && (
          <div className={bestSellersVisibility || undefined}>
            <BestSellingSection
              title={bestSellersSection?.title || "BEST SELLING PRODUCTS"}
              subtitle={bestSellersSection?.subtitle}
            />
          </div>
        )}

        {/* 7. Statement Editorial Banner */}
        {statementVisibility !== "hidden" && (
          <div className={statementVisibility || undefined}>
            <section className="py-12 sm:py-14 bg-black text-white text-center border-y border-neutral-900 px-4">
              <div className="max-w-4xl mx-auto space-y-4">
                <span className="text-xs font-mono tracking-[0.3em] uppercase text-neutral-500">
                  {statementSection?.subtitle || "ORIGINAL CLOTHING ARCHIVE // DHAKA"}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                  {statementSection?.title || "WE DON'T FOLLOW TRENDS. WE FORGE THE CONSTANTS."}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-light leading-relaxed font-description">
                  {statementData.description ||
                    "Every seam, weight, and silhouette is engineered with deliberate purpose. Built to endure season after season."}
                </p>
              </div>
            </section>
          </div>
        )}

        {/* 8. Community Photos & Verified Reviews */}
        {communityVisibility !== "hidden" && (
          <div className={communityVisibility || undefined}>
            <CommunityFeed reviews={reviews} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
