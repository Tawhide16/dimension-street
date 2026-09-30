"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types";

interface CategoryGridProps {
  categories?: Category[];
}

const SEASON_MUST_HAVES = [
  {
    title: "TOPS",
    href: "/shop?category=tees",
    image: "/images/season_tops.jpg",
    alt: "Tops - Must Haves for the Season",
  },
  {
    title: "KNITWEAR",
    href: "/shop?category=hoodies",
    image: "/images/season_knitwear.jpg",
    alt: "Knitwear - Must Haves for the Season",
  },
  {
    title: "SHOES",
    href: "/shop?category=shoes",
    image: "/images/season_shoes.jpg",
    alt: "Shoes - Must Haves for the Season",
  },
  {
    title: "SHORTS",
    href: "/shop?category=pants",
    image: "/images/season_shorts.jpg",
    alt: "Shorts - Must Haves for the Season",
  },
];

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10">
      {/* Clean Minimalist Header matching reference */}
      <h2 className="text-xl sm:text-2xl md:text-[24px] font-bold uppercase tracking-tight text-neutral-900 mb-5">
        MUST HAVES FOR THE SEASON
      </h2>

      {/* 4 Column Full-Bleed Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
        {SEASON_MUST_HAVES.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative aspect-3/4 sm:aspect-4/5 md:aspect-3/4 overflow-hidden bg-neutral-200 block shadow-xs"
          >
            {/* Background Lifestyle Photo */}
            <Image
              src={item.image}
              alt={item.alt}
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
        ))}
      </div>
    </section>
  );
}
