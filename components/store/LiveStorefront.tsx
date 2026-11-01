"use client";

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
import { useLiveCms } from "@/components/cms/LiveCmsContext";
import { ArrowUpRight, Edit3 } from "lucide-react";
import { HomepageSection, Category, Product, Review } from "@/types";

interface LiveStorefrontProps {
  initialSections: HomepageSection[];
  categories: Category[];
  newArrivals: Product[];
  bestSellers: Product[];
  reviews: Review[];
}

function getSectionVisibility(section?: { isActive?: boolean; hideOnDesktop?: boolean; hideOnMobile?: boolean }) {
  if (!section || section.isActive === false) return "hidden";
  if (section.hideOnDesktop && section.hideOnMobile) return "hidden";
  if (section.hideOnDesktop) return "hidden-on-desktop";
  if (section.hideOnMobile) return "hidden-on-mobile";
  return "";
}

export default function LiveStorefront({
  initialSections,
  categories,
  newArrivals,
  bestSellers,
  reviews,
}: LiveStorefrontProps) {
  const {
    sections: liveSections,
    themeConfig,
    footerConfig,
    isAdmin,
    isEditorOpen,
    setIsEditorOpen,
    setActiveTab,
    setSelectedSectionId,
  } = useLiveCms();

  // Use live sections from CMS state (or fallback to server-rendered initialSections)
  const sections = liveSections && liveSections.length > 0 ? liveSections : initialSections;

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
  const categoriesData = (categoriesSection?.data || {}) as Record<string, any>;
  const categoriesVisibility = getSectionVisibility(categoriesSection);

  const brandStorySection = sections.find((s) => s.type === "brand_story");
  const brandStoryData = (brandStorySection?.data || {}) as Record<string, string>;
  const brandStoryVisibility = getSectionVisibility(brandStorySection);

  const bestSellersSection = sections.find((s) => s.type === "best_sellers");
  const bestSellersData = (bestSellersSection?.data || {}) as Record<string, any>;
  const bestSellersVisibility = getSectionVisibility(bestSellersSection);

  const statementSection = sections.find((s) => s.type === "statement_banner");
  const statementData = (statementSection?.data || {}) as Record<string, string>;
  const statementVisibility = getSectionVisibility(statementSection);

  const communitySection = sections.find((s) => s.type === "community_gallery");
  const communityVisibility = getSectionVisibility(communitySection);

  const handleQuickEdit = (sectionId: string) => {
    if (!isAdmin) return;
    setIsEditorOpen(true);
    setActiveTab("sections");
    setSelectedSectionId(sectionId);
  };

  return (
    <div
      data-cms-storefront="true"
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: themeConfig?.backgroundColor || "#ffffff",
        fontFamily: themeConfig?.fontFamily ? `"${themeConfig.fontFamily}", var(--font-sans), sans-serif` : undefined,
      }}
      suppressHydrationWarning
    >
      {/* Top Banner */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header />

      <main className="flex-1 -mt-[84px]">
        {/* 1. Hero Banner */}
        {heroVisibility !== "hidden" && (
          <div
            className={`relative ${isAdmin ? "group/section cursor-pointer" : ""} ${heroVisibility || ""}`}
            onClick={isAdmin ? () => handleQuickEdit("hero") : undefined}
          >
            {isAdmin && isEditorOpen && (
              <div className="absolute top-24 right-4 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/80 text-white text-xs font-mono rounded-full shadow-lg backdrop-blur-xs">
                  <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Click to Edit Hero</span>
                </span>
              </div>
            )}
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
              logoImage={heroData.logoImage}
              logoLink={heroData.logoLink || "/"}
              logoAlt={heroData.logoAlt || "Dimension Street Logo"}
            />
          </div>
        )}

        {/* 2. New Arrivals Grid */}
        {newArrivalsVisibility !== "hidden" && (
          <div className={newArrivalsVisibility || undefined}>
            <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 pb-3 border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 cms-heading-scale">
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-md mx-auto md:max-w-none">
                {newArrivals.slice(0, newArrivalsLimit).map((product) => (
                  <ProductCard key={product._id} product={product} showBadges={false} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 3. Limited Archive Countdown Banner */}
        {promoVisibility !== "hidden" && (
          <div
            className={`relative ${isAdmin ? "group/section cursor-pointer" : ""} ${promoVisibility || ""}`}
            onClick={isAdmin ? () => handleQuickEdit("promo_banner") : undefined}
          >
            {isAdmin && isEditorOpen && (
              <div className="absolute top-4 right-4 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/80 text-white text-xs font-mono rounded-full shadow-lg backdrop-blur-xs">
                  <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Click to Edit Promo</span>
                </span>
              </div>
            )}
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
          <div
            className={`relative ${isAdmin ? "group/section cursor-pointer" : ""} ${categoriesVisibility || ""}`}
            onClick={isAdmin ? () => handleQuickEdit("shop_by_category") : undefined}
          >
            {isAdmin && isEditorOpen && (
              <div className="absolute top-4 right-4 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/80 text-white text-xs font-mono rounded-full shadow-lg backdrop-blur-xs">
                  <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Click to Edit Categories & Cards</span>
                </span>
              </div>
            )}
            <CategoryGrid
              categories={categories}
              title={categoriesSection?.title || "MUST HAVES FOR THE SEASON"}
              subtitle={categoriesSection?.subtitle}
              cards={categoriesData.cards}
            />
          </div>
        )}

        {/* 5. Brand Story Split Section */}
        {brandStoryVisibility !== "hidden" && (
          <div
            className={`relative ${isAdmin ? "group/section cursor-pointer" : ""} ${brandStoryVisibility || ""}`}
            onClick={isAdmin ? () => handleQuickEdit("brand_story") : undefined}
          >
            {isAdmin && isEditorOpen && (
              <div className="absolute top-4 right-4 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/80 text-white text-xs font-mono rounded-full shadow-lg backdrop-blur-xs">
                  <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Click to Edit Brand Story</span>
                </span>
              </div>
            )}
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
          <div
            className={`relative ${isAdmin ? "group/section cursor-pointer" : ""} ${bestSellersVisibility || ""}`}
            onClick={isAdmin ? () => handleQuickEdit("best_sellers") : undefined}
          >
            {isAdmin && isEditorOpen && (
              <div className="absolute top-4 right-4 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/80 text-white text-xs font-mono rounded-full shadow-lg backdrop-blur-xs">
                  <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Click to Edit Best Selling Cards</span>
                </span>
              </div>
            )}
            <BestSellingSection
              title={bestSellersSection?.title || "BEST SELLING PRODUCTS"}
              subtitle={bestSellersSection?.subtitle}
              cards={bestSellersData.cards}
            />
          </div>
        )}

        {/* 7. Statement Editorial Banner */}
        {statementVisibility !== "hidden" && (
          <div
            className={`relative ${isAdmin ? "group/section cursor-pointer" : ""} ${statementVisibility || ""}`}
            onClick={isAdmin ? () => handleQuickEdit("statement_banner") : undefined}
          >
            {isAdmin && isEditorOpen && (
              <div className="absolute top-4 right-4 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/80 text-white text-xs font-mono rounded-full shadow-lg backdrop-blur-xs">
                  <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Click to Edit Statement</span>
                </span>
              </div>
            )}
            <section className="py-12 sm:py-14 bg-black text-white text-center border-y border-neutral-900 px-4">
              <div className="max-w-4xl mx-auto space-y-4">
                <span className="text-xs font-mono tracking-[0.3em] uppercase text-neutral-500">
                  {statementSection?.subtitle || "ORIGINAL CLOTHING ARCHIVE // DHAKA"}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight cms-heading-scale">
                  {statementSection?.title || "WE DON'T FOLLOW TRENDS. WE FORGE THE CONSTANTS."}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-light leading-relaxed font-description cms-body-scale">
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

      {/* Dynamic Footer powered by Live CMS draft */}
      <Footer config={footerConfig} />
    </div>
  );
}
