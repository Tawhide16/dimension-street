"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Review } from "@/types";
import { Star, Camera } from "lucide-react";
import MeetOurCommunity from "@/components/store/MeetOurCommunity";

interface CommunityFeedProps {
  reviews?: Review[];
}

const REVIEW_SLIDES = [
  // Slide 1 matching the user's reference image exactly
  [
    {
      author: "SOFIA B.",
      quote:
        "The hoodie is the heaviest I have owned and the fit has stayed identical across three restocks.",
      image: "/images/review_green_hoodie.jpg",
      productName: "Singh Heavyweight Zip Hoodie - Forest Green",
    },
    {
      author: "RUBEN V.",
      quote:
        "Ordered before 16:00 and the parcel was tracked the same evening. Trousers fit exactly as the size guide said.",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
      productName: "Singh Community Tee - Navy",
    },
    {
      author: "SAMIUL R.",
      quote:
        "Love the fit and the fabric weight. Definitely coming back for the next drop.",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
      productName: "Kaur Collegiate Sweatshirt - Burgundy",
    },
  ],
  // Slide 2
  [
    {
      author: "ARYAN K.",
      quote:
        "The 480 GSM density feels like a luxury grail. The sculptural crossover hood holds its form completely.",
      image: "/images/bestseller_singh_black_tee.jpg",
      productName: "Singh Community Club Tee - Black",
    },
    {
      author: "EMILY T.",
      quote:
        "Material quality is truly exceptional. Drop shoulders fall naturally without bunching.",
      image: "/images/bestseller_singh_tote.jpg",
      productName: "The Singh Canvas Tote",
    },
    {
      author: "TANVIR H.",
      quote:
        "Fastest delivery I've experienced in Dhaka. Packaging was clean, minimal, and premium.",
      image: "/images/bestseller_baaj_tee.jpg",
      productName: "Baaj Stonewashed Tee - Black",
    },
  ],
  // Slide 3
  [
    {
      author: "LIAM M.",
      quote:
        "Heavy canvas tote holds a 16-inch laptop with zero sagging. Hardware is rock solid.",
      image: "/images/bestseller_kaur_tote.jpg",
      productName: "The Kaur Canvas Tote",
    },
    {
      author: "PRIYA S.",
      quote:
        "Tactile cotton feel is incredible. Doesn't shrink or fade after multiple cold washes.",
      image: "/images/review_green_hoodie.jpg",
      productName: "Singh Zip Hoodie",
    },
    {
      author: "MARCUS D.",
      quote:
        "From the collar ribbing to twin-needle seams, every detail feels engineered with purpose.",
      image: "/images/bestseller_singh_black_tee.jpg",
      productName: "Singh Community Club Tee",
    },
  ],
  // Slide 4
  [
    {
      author: "ZARA N.",
      quote:
        "The true-to-size oversized cut is modern without being overly baggy. Highly recommended.",
      image: "/images/bestseller_baaj_tee.jpg",
      productName: "Baaj Graphic Tee",
    },
    {
      author: "KABIR A.",
      quote:
        "Customer concierge was very responsive on WhatsApp. Sizing guidance was spot on.",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
      productName: "Singh Signature Tee",
    },
    {
      author: "CHLOE W.",
      quote:
        "Most durable heavyweight streetwear staples I own. Definitely buying from the next collection.",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
      productName: "Kaur Collegiate Crewneck",
    },
  ],
];

const communityPhotos = [
  {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    tag: "@tariqul.archive",
    location: "Dhaka",
    item: "Isometric Heavyweight Tee (L)",
  },
  {
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    tag: "@maya_streets",
    location: "Tokyo",
    item: "Architectural Hoodie 480GSM (M)",
  },
  {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    tag: "@dimension_kicks",
    location: "London",
    item: "The Matrix Tech Pants (32)",
  },
  {
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
    tag: "@samir.fit",
    location: "New York",
    item: "Matte Tactical Bomber (L)",
  },
];

export default function CommunityFeed({ reviews }: CommunityFeedProps) {
  const [activeReviewSlide, setActiveReviewSlide] = useState(0);

  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Meet Our Community Reels Section matching reference image */}
        <div className="mb-10">
          <MeetOurCommunity />
        </div>

        {/* What Our Community Says Section matching reference */}
        <div className="border-t border-neutral-200 pt-8 sm:pt-10">
          {/* Header with Title and 4 Pagination Dots */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900">
              WHAT OUR COMMUNITY SAYS
            </h2>
            
            {/* 4 Pagination Indicator Dots matching reference */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((dotIndex) => (
                <button
                  key={dotIndex}
                  onClick={() => setActiveReviewSlide(dotIndex)}
                  aria-label={`Show reviews slide ${dotIndex + 1}`}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeReviewSlide === dotIndex
                      ? "bg-black scale-110"
                      : "bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 3 Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {REVIEW_SLIDES[activeReviewSlide].map((item, index) => (
              <div
                key={index}
                className="border border-neutral-200 bg-white grid grid-cols-12 overflow-hidden shadow-xs"
              >
                {/* Left Side: Rating, Quote, Author */}
                <div className="col-span-7 sm:col-span-7 p-5 sm:p-6 flex flex-col justify-between min-h-[170px] sm:min-h-[190px]">
                  <div>
                    {/* 5 Solid Black Stars */}
                    <div className="flex items-center gap-0.5 text-black mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-black text-black" />
                      ))}
                    </div>

                    {/* Review Quote */}
                    <p className="text-xs sm:text-[13px] text-neutral-800 leading-relaxed font-normal">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Reviewer Name */}
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-600 mt-4 block">
                    &mdash; {item.author}
                  </span>
                </div>

                {/* Right Side: Product Packshot on light grey background */}
                <div className="col-span-5 sm:col-span-5 bg-[#f4f4f2] relative min-h-[140px] sm:min-h-full border-l border-neutral-200/70 flex items-center justify-center p-3">
                  <Image
                    src={item.image}
                    alt={item.productName || item.author}
                    fill
                    sizes="(max-width: 768px) 40vw, 15vw"
                    className="object-contain p-2 transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
