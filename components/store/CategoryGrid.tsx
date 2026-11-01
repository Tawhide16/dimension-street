"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types";

export interface CategoryCardItem {
  title: string;
  link?: string;
  href?: string;
  image: string;
  alt?: string;
}

interface CategoryGridProps {
  categories?: Category[];
  title?: string;
  subtitle?: string;
  cards?: CategoryCardItem[];
}

export const DEFAULT_CATEGORY_CARDS: CategoryCardItem[] = [
  {
    title: "TOPS",
    link: "/collections/heavyweight",
    image: "/uploads/upload_1793522323833____________gpt.jpg",
    alt: "Tops - Must Haves for the Season",
  },
  {
    title: "KNITWEAR",
    link: "/collections/new-arrivals",
    image: "/uploads/upload_1793522349799_iam1__.jpg",
    alt: "Knitwear - Must Haves for the Season",
  },
  {
    title: "CLASIC",
    link: "/collections/heavyweight",
    image: "/uploads/upload_1793522404251_spring_outfits_for_men.jpg",
    alt: "Shoes - Must Haves for the Season",
  },
  {
    title: "SHORTS",
    link: "/collections/heavyweight",
    image: "/uploads/upload_1793522419326_imgupscaler-enhanced__5_.jpg",
    alt: "Shorts - Must Haves for the Season",
  },
];

export default function CategoryGrid({
  categories,
  title = "MUST HAVES FOR THE SEASON",
  subtitle,
  cards,
}: CategoryGridProps) {
  const displayCards = cards && cards.length > 0 ? cards : DEFAULT_CATEGORY_CARDS;

  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10">
      {/* Clean Minimalist Header matching reference */}
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl md:text-[24px] font-bold uppercase tracking-tight text-neutral-900 cms-heading-scale">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-neutral-500 font-mono mt-1">{subtitle}</p>
        )}
      </div>

      {/* 4 Column Full-Bleed Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
        {displayCards.map((item, idx) => {
          const targetUrl = item.link || item.href || "/shop";
          return (
            <Link
              key={`${item.title}-${idx}`}
              href={targetUrl}
              className="group relative aspect-3/4 sm:aspect-4/5 md:aspect-3/4 overflow-hidden bg-neutral-200 block shadow-xs"
            >
              {/* Background Lifestyle Photo */}
              <Image
                src={item.image || "/images/season_tops.jpg"}
                alt={item.alt || item.title || "Category Card"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Subtle Overlay for Legibility */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-300" />

              {/* Centered Category Text */}
              <div className="absolute inset-0 flex items-center justify-center p-3">
                <span className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-wider text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] group-hover:scale-105 transition-all duration-300 select-none">
                  {item.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
