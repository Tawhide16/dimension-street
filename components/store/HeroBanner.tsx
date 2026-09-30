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
  ctaText = "SHOP COLLECTION",
  ctaLink = "/shop",
  secondaryCtaText,
  secondaryCtaLink,
  backgroundImage = "/images/hero-banner.jpg",
}: HeroBannerProps) {
  // Check if title is default placeholder text
  const isDefaultPlaceholder = !title || title === "HERO BANNER" || title === "Primary Homepage Billboard";

  return (
    <section className="relative w-full aspect-[2.34/1] min-h-[280px] sm:min-h-[380px] md:min-h-[460px] lg:min-h-[540px] max-h-[780px] overflow-hidden bg-[#e8e4c9]">
      <Link href={ctaLink} className="group block relative w-full h-full cursor-pointer select-none">
        {/* Full-width Panoramic Banner Image */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Denim Campaign Banner - Are You Ready?"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        </div>

        {/* If custom title is provided in CMS (and not placeholder), render text overlay */}
        {!isDefaultPlaceholder && (
          <div className="relative z-10 w-full h-full flex flex-col justify-end px-6 sm:px-12 lg:px-16 pb-8 sm:pb-12 bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight drop-shadow-md">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-neutral-200 drop-shadow-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Subtle Bottom-Right Floating Pill CTA Button */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-8 z-10">
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-black/85 hover:bg-black text-white text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-black">
            <span>{ctaText || "SHOP NOW"}</span>
            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
