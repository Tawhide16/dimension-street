"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

interface BrandStorySectionProps {
  badge?: string;
  title?: string;
  description?: string;
  pillar1Title?: string;
  pillar1Desc?: string;
  pillar2Title?: string;
  pillar2Desc?: string;
  pillar3Title?: string;
  pillar3Desc?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
}

export default function BrandStorySection({
  badge = "OUR STORY",
  title = "Community First. \nQuality Always.",
  description = "We started with one idea: build the pieces we couldn't find. No seasonal noise, no shortcuts — just essentials made properly, for people who wear them every day.",
  pillar1Title = "PREMIUM FABRICS",
  pillar1Desc = "Heavyweight cotton, garment washed.",
  pillar2Title = "CONSIDERED FIT",
  pillar2Desc = "Boxy, dropped shoulder, true to size.",
  pillar3Title = "MADE WITH PURPOSE",
  pillar3Desc = "Small runs, no seasonal waste.",
  buttonText = "LEARN MORE ABOUT US",
  buttonLink = "/about",
  image = "/images/community_our_story.jpg",
}: BrandStorySectionProps) {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-8">
      <div className="w-full bg-[#f4f2ee] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-0 lg:min-h-[540px]">
          {/* Top on Mobile (order-1), Right Column on Desktop (lg:order-2): Photograph */}
          <div className="order-1 lg:order-2 relative w-full h-[260px] sm:h-[380px] lg:h-auto min-h-[240px] lg:min-h-full bg-neutral-200">
            <Image
              src={image}
              alt="Dimension Streetwear Community - Our Story"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Bottom on Mobile (order-2), Left Column on Desktop (lg:order-1): Story, Copy, 3 Pillars & CTA */}
          <div className="order-2 lg:order-1 flex flex-col justify-center px-5 sm:px-10 md:px-12 lg:px-12 xl:px-16 py-6 sm:py-10 lg:py-14">
            {/* Top Label */}
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-neutral-800 mb-2 block">
              {badge}
            </span>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl md:text-[42px] lg:text-[46px] font-black tracking-tight text-neutral-900 leading-[1.15] mb-2.5 sm:mb-4 whitespace-pre-line">
              {title}
            </h2>

            {/* Explanatory Paragraph */}
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal mb-4 sm:mb-6 max-w-lg">
              {description}
            </p>

            {/* 3 Pillars Grid - Compact Spacing on Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-5 sm:mb-8 pt-1">
              {/* 1. PREMIUM FABRICS */}
              <div className="flex flex-col items-start">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 mb-1.5 sm:mb-2 stroke-[1.5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253"
                  />
                </svg>
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 mb-0.5">
                  {pillar1Title}
                </h4>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  {pillar1Desc}
                </p>
              </div>

              {/* 2. CONSIDERED FIT */}
              <div className="flex flex-col items-start">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 mb-1.5 sm:mb-2 stroke-[1.5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 4v16M18 4v16"
                  />
                </svg>
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 mb-0.5">
                  {pillar2Title}
                </h4>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  {pillar2Desc}
                </p>
              </div>

              {/* 3. MADE WITH PURPOSE */}
              <div className="flex flex-col items-start">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 mb-1.5 sm:mb-2 stroke-[1.5]" />
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 mb-0.5">
                  {pillar3Title}
                </h4>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  {pillar3Desc}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div>
              <Link
                href={buttonLink}
                className="btn-slide-white inline-block px-7 sm:px-8 py-3 sm:py-3.5 text-xs font-mono font-bold uppercase tracking-wider shadow-sm border border-black cursor-pointer"
              >
                {buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
