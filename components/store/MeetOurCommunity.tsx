"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import { CommunityReel } from "@/types";
import {
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";

interface CommunityCardItem {
  id: string;
  videoUrl?: string;
  photoUrl: string;
  productName: string;
  priceFormatted: string;
  numericPrice: number;
  thumbnail: string;
  slug: string;
  isMiddleFeatured?: boolean;
}

const DEFAULT_CARDS: CommunityCardItem[] = [
  {
    id: "reel-1",
    videoUrl: "",
    photoUrl: "/images/community_photo_1.jpg",
    productName: "Community club Kaur hoodie - Navi",
    priceFormatted: "Tk 6,500.00",
    numericPrice: 6500,
    thumbnail: "/images/community_thumb_1.jpg",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
  {
    id: "reel-2",
    videoUrl: "",
    photoUrl: "/images/community_photo_2.jpg",
    productName: "Black stone washed Singh T-shirt",
    priceFormatted: "Tk 8,500.00",
    numericPrice: 8500,
    thumbnail: "/images/community_thumb_2.jpg",
    slug: "dimension-isometric-heavyweight-tee",
    isMiddleFeatured: false,
  },
  {
    id: "reel-3",
    videoUrl: "",
    photoUrl: "/images/community_photo_3.jpg",
    productName: "Black stone washed Singh T-shirt",
    priceFormatted: "Tk 8,500.00",
    numericPrice: 8500,
    thumbnail: "/images/community_thumb_3.jpg",
    slug: "dimension-isometric-heavyweight-tee",
    isMiddleFeatured: true, // Central Taller Card matching user's image
  },
  {
    id: "reel-4",
    videoUrl: "",
    photoUrl: "/images/community_photo_4.jpg",
    productName: "Community club Singh sweater - Green",
    priceFormatted: "Tk 11,300.00",
    numericPrice: 11300,
    thumbnail: "/images/community_thumb_4.jpg",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
  {
    id: "reel-5",
    videoUrl: "",
    photoUrl: "/images/community_photo_5.jpg",
    productName: "Community club Singh hoodie - Grey stonewash",
    priceFormatted: "Tk 13,600.00",
    numericPrice: 13600,
    thumbnail: "/images/community_thumb_5.jpg",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
];

export default function MeetOurCommunity() {
  const { addItem, openCart } = useCart();
  const [cards, setCards] = useState<CommunityCardItem[]>(DEFAULT_CARDS);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(true);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag-to-scroll states
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // 1. Fetch live community reels uploaded from Admin Dashboard
  useEffect(() => {
    fetch("/api/community/reels")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reels) && data.reels.length > 0) {
          const activeReels = data.reels.filter((r: CommunityReel) => r.isActive !== false);
          if (activeReels.length > 0) {
            const mapped: CommunityCardItem[] = activeReels.map((reel: CommunityReel, index: number) => ({
              id: reel._id,
              videoUrl: reel.videoUrl || "",
              photoUrl: reel.posterUrl || `/images/community_photo_${(index % 5) + 1}.jpg`,
              productName: reel.product?.name || reel.title || "Community Item",
              priceFormatted: `Tk ${(reel.product?.price || 6500).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`,
              numericPrice: reel.product?.price || 6500,
              thumbnail:
                reel.product?.thumbnail || `/images/community_thumb_${(index % 5) + 1}.jpg`,
              slug: reel.product?.slug || "architectural-pullover-hoodie-480gsm",
              // Center card is featured and taller
              isMiddleFeatured: index === 2 || (activeReels.length >= 3 && index === Math.floor(activeReels.length / 2)),
            }));
            setCards(mapped);
          }
        }
      })
      .catch((err) => {
        console.warn("Using default community cards:", err);
      });
  }, []);

  // Center the middle card on initial load to match the 2nd image
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const el = scrollRef.current;
        const centerOffset = (el.scrollWidth - el.clientWidth) / 2;
        if (centerOffset > 0) {
          el.scrollLeft = centerOffset;
        }
        checkScroll();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [cards]);

  // Check scroll position to update arrow states
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [cards]);

  // Smooth scroll left and right buttons
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 380;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Cart Add Handler
  const handleAddToCart = (e: React.MouseEvent, item: CommunityCardItem) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: item.id,
      name: item.productName,
      slug: item.slug,
      image: item.thumbnail,
      color: "Standard",
      size: "M",
      sku: `${item.id}-M`.toUpperCase(),
      price: item.numericPrice,
    });

    openCart();
    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const toggleSound = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMutedStates((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  return (
    <section className="w-full relative py-6 select-none overflow-hidden">
      {/* Title Centered matching reference image */}
      <div className="w-full text-center mb-6 sm:mb-8 px-4">
        <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold uppercase tracking-[0.2em] text-neutral-900">
          MEET OUR COMMUNITY
        </h2>
      </div>

      {/* Relative Carousel Wrapper with Floating Navigation Arrows */}
      <div className="relative w-full group/carousel">
        {/* Floating Left Arrow Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll community videos left"
          className={`absolute left-3 sm:left-6 top-[45%] -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 hover:bg-black hover:text-white text-black shadow-2xl border border-neutral-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            canScrollLeft
              ? "opacity-90 hover:opacity-100"
              : "opacity-30 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Floating Right Arrow Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Scroll community videos right"
          className={`absolute right-3 sm:right-6 top-[45%] -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 hover:bg-black hover:text-white text-black shadow-2xl border border-neutral-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            canScrollRight
              ? "opacity-90 hover:opacity-100"
              : "opacity-30 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Horizontal Smooth Scroll Container matching the 2nd image */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex items-end gap-3 sm:gap-3.5 md:gap-4 overflow-x-auto scroll-smooth scrollbar-none px-6 sm:px-12 md:px-16 pt-10 sm:pt-14 pb-4 cursor-grab active:cursor-grabbing snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cards.map((card) => {
            const isFeatured = card.isMiddleFeatured;
            const isMuted = mutedStates[card.id] ?? true;

            return (
              <div
                key={card.id}
                className={`flex-shrink-0 w-[78vw] sm:w-[50vw] md:w-[38vw] lg:w-[340px] xl:w-[370px] 2xl:w-[395px] flex flex-col bg-white overflow-hidden transition-all duration-300 snap-center shadow-xs hover:shadow-md ${
                  isFeatured ? "lg:-mt-10 lg:shadow-xl z-10" : ""
                }`}
              >
                {/* Media Container: Supports Video Upload or Photo */}
                <div
                  className={`relative w-full overflow-hidden bg-neutral-900 group/media ${
                    isFeatured
                      ? "h-[400px] sm:h-[450px] md:h-[490px] lg:h-[530px] xl:h-[570px]"
                      : "h-[340px] sm:h-[390px] md:h-[430px] lg:h-[470px] xl:h-[500px]"
                  }`}
                >
                  {card.videoUrl ? (
                    <div className="relative w-full h-full">
                      <video
                        src={card.videoUrl}
                        poster={card.photoUrl}
                        muted={isMuted}
                        loop
                        playsInline
                        autoPlay
                        className="w-full h-full object-cover object-center"
                      />
                      {/* Audio Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleSound(e, card.id)}
                        title={isMuted ? "Unmute video" : "Mute video"}
                        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-75 hover:opacity-100 cursor-pointer"
                      >
                        {isMuted ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <Image
                      src={card.photoUrl}
                      alt={card.productName}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 395px"
                      className="object-cover object-center transition-transform duration-500 hover:scale-105"
                      priority={isFeatured}
                    />
                  )}
                </div>

                {/* Bottom Product Info Bar matching reference image */}
                <div className="border border-neutral-200 border-t-0 p-2 sm:p-2.5 flex items-center justify-between gap-2 bg-white">
                  {/* Left: Product Thumbnail */}
                  <Link
                    href={`/product/${card.slug}`}
                    className="relative w-8 h-8 sm:w-9 sm:h-9 bg-neutral-50 flex-shrink-0 border border-neutral-200 overflow-hidden block"
                    title={card.productName}
                  >
                    <Image
                      src={card.thumbnail}
                      alt={card.productName}
                      fill
                      sizes="40px"
                      className="object-contain p-0.5"
                    />
                  </Link>

                  {/* Middle: Product Title & Price */}
                  <div className="flex-1 min-w-0 text-left">
                    <Link
                      href={`/product/${card.slug}`}
                      className="text-[10px] sm:text-[11px] font-medium text-neutral-800 leading-tight line-clamp-2 block hover:underline"
                      title={card.productName}
                    >
                      {card.productName}
                    </Link>
                    <span className="text-[10px] sm:text-[11px] font-bold text-neutral-900 block mt-0.5">
                      {card.priceFormatted}
                    </span>
                  </div>

                  {/* Right: Black Circular Cart Button */}
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, card)}
                    title="Add to cart"
                    aria-label={`Add ${card.productName} to cart`}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-xs cursor-pointer ${
                      justAddedId === card.id
                        ? "bg-emerald-600 text-white"
                        : "bg-black text-white hover:scale-110 active:scale-95"
                    }`}
                  >
                    {justAddedId === card.id ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <ShoppingCart className="w-3 h-3 text-white" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
