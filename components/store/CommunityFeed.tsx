"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Review } from "@/types";
import { Star, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import MeetOurCommunity from "@/components/store/MeetOurCommunity";

interface CommunityFeedProps {
  reviews?: Review[];
}

export interface ReviewFeedItem {
  id?: string;
  author: string;
  quote: string;
  image: string;
  productName: string;
  rating?: number;
  productSlug?: string;
}

const REVIEW_SLIDES: ReviewFeedItem[][] = [
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

export default function CommunityFeed({ reviews }: CommunityFeedProps) {
  const [liveReviews, setLiveReviews] = useState<Review[]>(reviews || []);
  const [activeReviewSlide, setActiveReviewSlide] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Fetch freshest reviews on mount so newly added product reviews appear immediately
  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setLiveReviews(data.reviews);
        }
      })
      .catch((err) => console.warn("Failed to load community reviews:", err));
  }, []);

  // Merge live reviews with default community reviews into a single flat list
  const allReviewsList = useMemo(() => {
    const liveItems = liveReviews.map((r) => ({
      id: r._id,
      author: r.customerName || "COMMUNITY MEMBER",
      quote: r.comment || r.title || "Exceptional heavyweight quality and modern cut.",
      rating: r.rating || 5,
      image: r.image || "/images/bestseller_singh_black_tee.jpg",
      productName: r.productName || "Dimension Streetwear",
      productSlug: r.productSlug || "dimension-isometric-heavyweight-tee",
    }));

    const staticItems = REVIEW_SLIDES.flat();
    const combined = [...liveItems];

    staticItems.forEach((st) => {
      if (!combined.some((c) => c.quote === st.quote)) {
        combined.push({
          id: `static-${combined.length}`,
          author: st.author,
          quote: st.quote,
          rating: 5,
          image: st.image,
          productName: st.productName,
          productSlug: "dimension-isometric-heavyweight-tee",
        });
      }
    });

    return combined;
  }, [liveReviews]);

  // Group reviews into chunks of 3 for desktop grid slides
  const allSlides = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < allReviewsList.length; i += 3) {
      chunks.push(allReviewsList.slice(i, i + 3));
    }
    return chunks.length > 0 ? chunks.slice(0, 5) : [REVIEW_SLIDES[0]];
  }, [allReviewsList]);

  const currentSlide = allSlides[Math.min(activeReviewSlide, allSlides.length - 1)] || [];

  // Track horizontal scroll position on mobile carousel
  const handleMobileScroll = () => {
    if (!mobileScrollRef.current) return;
    const { scrollLeft, clientWidth } = mobileScrollRef.current;
    if (clientWidth === 0) return;
    const cardStep = clientWidth * 0.84 + 14;
    const newIdx = Math.round(scrollLeft / cardStep);
    setMobileActiveIndex(Math.max(0, Math.min(newIdx, allReviewsList.length - 1)));
  };

  // Scroll mobile carousel left or right
  const scrollMobile = (direction: "left" | "right") => {
    if (!mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const scrollAmount = container.clientWidth * 0.84 + 14;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Scroll mobile carousel directly to specific index
  const scrollMobileToIndex = (idx: number) => {
    if (!mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const scrollAmount = container.clientWidth * 0.84 + 14;
    container.scrollTo({
      left: idx * scrollAmount,
      behavior: "smooth",
    });
    setMobileActiveIndex(idx);
  };

  return (
    <section className="py-10 sm:py-14 bg-white">
      {/* Meet Our Community Section - Mobile/Tablet only, hidden on desktop */}
      <div className="w-full mb-12 sm:mb-16 lg:hidden">
        <MeetOurCommunity />
      </div>

      {/* What Our Community Says Section with standard padding */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="border-t border-neutral-200 pt-8 sm:pt-10">
          {/* Header with Title and Pagination Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900">
                WHAT OUR COMMUNITY SAYS
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mt-0.5 block">
                VERIFIED REVIEWS FROM THE STREETS & ARCHIVE
              </span>
            </div>

            {/* Desktop Pagination Indicator Dots (Hidden on Mobile) */}
            {allSlides.length > 1 && (
              <div className="hidden md:flex items-center gap-2">
                {allSlides.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    onClick={() => setActiveReviewSlide(dotIndex)}
                    aria-label={`Show reviews slide ${dotIndex + 1}`}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeReviewSlide === dotIndex
                        ? "bg-black scale-125"
                        : "bg-neutral-300 hover:bg-neutral-400"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Mobile Carousel Navigation Arrows in Header */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollMobile("left")}
                disabled={mobileActiveIndex === 0}
                aria-label="Previous review"
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollMobile("right")}
                disabled={mobileActiveIndex >= allReviewsList.length - 1}
                aria-label="Next review"
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1. Mobile Version: Swipeable Touch Carousel (visible on < md screens) */}
          <div className="block md:hidden">
            <div
              ref={mobileScrollRef}
              onScroll={handleMobileScroll}
              className="flex gap-3.5 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory -mx-4 px-4 pb-3 pt-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {allReviewsList.map((item, index) => (
                <div
                  key={item.id || index}
                  className="w-[84vw] max-w-[340px] shrink-0 snap-center border border-neutral-200 bg-white grid grid-cols-12 overflow-hidden shadow-xs hover:border-neutral-400 transition-all rounded-xs"
                >
                  {/* Left Side: Rating, Quote, Author */}
                  <div className="col-span-7 p-4 sm:p-5 flex flex-col justify-between min-h-[175px]">
                    <div>
                      {/* Dynamic Solid Black Stars */}
                      <div className="flex items-center gap-0.5 text-black mb-2.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < (item.rating || 5)
                                ? "fill-black text-black"
                                : "text-neutral-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Quote */}
                      <p className="text-xs text-neutral-800 leading-relaxed font-normal line-clamp-4">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </div>

                    {/* Reviewer Name */}
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-600 mt-3 block">
                      &mdash; {item.author}
                    </span>
                  </div>

                  {/* Right Side: Product Packshot */}
                  <Link
                    href={item.productSlug ? `/product/${item.productSlug}` : "/shop"}
                    className="col-span-5 bg-[#f4f4f2] relative min-h-[140px] border-l border-neutral-200/70 flex items-center justify-center p-2.5 group/thumb"
                    title={item.productName || item.author}
                  >
                    <Image
                      src={item.image}
                      alt={item.productName || item.author}
                      fill
                      sizes="40vw"
                      className="object-contain p-2 transition-transform duration-500 group-hover/thumb:scale-105"
                    />
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile Carousel Indicators / Dots & Progress */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                Review {mobileActiveIndex + 1} of {allReviewsList.length}
              </span>

              {/* Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {allReviewsList.slice(0, 10).map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => scrollMobileToIndex(dotIdx)}
                    aria-label={`Go to review ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      mobileActiveIndex === dotIdx
                        ? "w-4 bg-black"
                        : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                  />
                ))}
                {allReviewsList.length > 10 && (
                  <span className="text-[9px] font-mono text-neutral-400">+</span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Desktop Version: 3-column Grid with Slide Pagination (visible on >= md screens) */}
          <div className="hidden md:grid md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {currentSlide.map((item, index) => (
              <div
                key={item.id || index}
                className="border border-neutral-200 bg-white grid grid-cols-12 overflow-hidden shadow-xs hover:border-neutral-400 transition-colors"
              >
                {/* Left Side: Rating, Quote, Author */}
                <div className="col-span-7 sm:col-span-7 p-5 sm:p-6 flex flex-col justify-between min-h-[170px] sm:min-h-[190px]">
                  <div>
                    {/* Dynamic Solid Black Stars */}
                    <div className="flex items-center gap-0.5 text-black mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (item.rating || 5)
                              ? "fill-black text-black"
                              : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Quote */}
                    <p className="text-xs sm:text-[13px] text-neutral-800 leading-relaxed font-normal line-clamp-4">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Reviewer Name */}
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-600 mt-4 block">
                    &mdash; {item.author}
                  </span>
                </div>

                {/* Right Side: Product Packshot on light grey background with Link */}
                <Link
                  href={item.productSlug ? `/product/${item.productSlug}` : "/shop"}
                  className="col-span-5 sm:col-span-5 bg-[#f4f4f2] relative min-h-[140px] sm:min-h-full border-l border-neutral-200/70 flex items-center justify-center p-3 group/thumb"
                  title={item.productName || item.author}
                >
                  <Image
                    src={item.image}
                    alt={item.productName || item.author}
                    fill
                    sizes="(max-width: 768px) 40vw, 15vw"
                    className="object-contain p-2 transition-transform duration-500 group-hover/thumb:scale-105"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
