"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
}

export default function HeroBanner({
  title = "HERO BANNER",
  subtitle = "Primary Homepage Billboard",
  ctaText = "BESTSELLERS",
  ctaLink = "/shop",
  secondaryCtaText = "SHOP PINK",
  secondaryCtaLink = "/shop",
  backgroundImage = "/images/hero-banner.jpg",
}: HeroBannerProps) {
  const displayTitle = title || "HERO BANNER";
  const displaySubtitle = subtitle || "Primary Homepage Billboard";
  const displayCta = ctaText || "BESTSELLERS";
  const displaySecondaryCta = secondaryCtaText || "SHOP PINK";

  return (
    <section className="relative w-full aspect-[2.34/1] min-h-[300px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[560px] max-h-[780px] overflow-hidden bg-black select-none">
      {/* Full-width Panoramic Banner Image (Untouched) */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Campaign Hero Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Subtle Gradient Scrim on Bottom-Left for Readability */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-12 lg:px-16 pb-8 sm:pb-12 md:pb-14 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none">
        {/* Text Content & Buttons Layout - Matching User's Reference */}
        <div className="max-w-xl space-y-2 sm:space-y-3 pointer-events-auto">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white tracking-tight leading-none drop-shadow-md">
            {displayTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base font-normal text-white/90 drop-shadow-sm">
            {displaySubtitle}
          </p>

          {/* Buttons: Side-by-Side Bestsellers & Shop Pink */}
          <div className="flex items-center gap-3 sm:gap-4 pt-2 sm:pt-3">
            {/* Button 1: Solid White Rectangular Box */}
            <Link
              href={ctaLink || "/shop"}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black text-xs sm:text-[13px] font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
            >
              {displayCta}
            </Link>

            {/* Button 2: Transparent Box with Crisp White Border */}
            <Link
              href={secondaryCtaLink || "/shop"}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-black/40 hover:bg-white hover:text-black border border-white text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider backdrop-blur-xs transition-colors shadow-sm cursor-pointer"
            >
              {displaySecondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
