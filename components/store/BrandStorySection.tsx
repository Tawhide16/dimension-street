"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function BrandStorySection() {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-8">
      <div className="w-full bg-[#f4f2ee] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[500px] lg:min-h-[540px]">
          {/* Left Column: Story, Copy, 3 Pillars & CTA */}
          <div className="flex flex-col justify-center px-6 sm:px-10 md:px-12 lg:px-12 xl:px-16 py-10 sm:py-14">
          {/* Top Label */}
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-neutral-800 mb-3 block">
            OUR STORY
          </span>

          {/* Main Headline matching reference */}
          <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[46px] font-black tracking-tight text-neutral-900 leading-[1.12] mb-5">
            Community First. <br />
            Quality Always.
          </h2>

          {/* Explanatory Paragraph */}
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal mb-8 max-w-lg">
            We started with one idea: build the pieces we couldn&apos;t find. No seasonal noise, no
            shortcuts &mdash; just essentials made properly, for people who wear them every day.
          </p>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 mb-8 pt-2">
            {/* 1. PREMIUM FABRICS */}
            <div className="flex flex-col items-start">
              {/* Leaf Icon matching screenshot */}
              <svg
                className="w-5 h-5 text-neutral-900 mb-2.5 stroke-[1.5]"
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
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                PREMIUM FABRICS
              </h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Heavyweight cotton, garment washed.
              </p>
            </div>

            {/* 2. CONSIDERED FIT */}
            <div className="flex flex-col items-start">
              {/* Ruler/Diagonal Comb Icon matching screenshot */}
              <svg
                className="w-5 h-5 text-neutral-900 mb-2.5 stroke-[1.5]"
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
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                CONSIDERED FIT
              </h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Boxy, dropped shoulder, true to size.
              </p>
            </div>

            {/* 3. MADE WITH PURPOSE */}
            <div className="flex flex-col items-start">
              {/* Heart Outline Icon matching screenshot */}
              <Heart className="w-5 h-5 text-neutral-900 mb-2.5 stroke-[1.5]" />
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                MADE WITH PURPOSE
              </h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Small runs, no seasonal waste.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div>
            <Link
              href="/about"
              className="inline-block px-7 py-3 border border-neutral-900 bg-white text-neutral-900 text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-all shadow-xs"
            >
              LEARN MORE ABOUT US
            </Link>
          </div>
        </div>

        {/* Right Column: Full-Bleed Community Photograph */}
        <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-full w-full bg-neutral-200">
          <Image
            src="/images/community_our_story.jpg"
            alt="Dimension Streetwear Community - Our Story"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover object-center"
          />
        </div>
      </div>
    </div>
  </section>
);
}
