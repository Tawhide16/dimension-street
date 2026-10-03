"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import { CommunityReel } from "@/types";
import { ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";

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

const DEFAULT_COMMUNITY_CARDS: CommunityCardItem[] = [
  {
    id: "card-1",
    photoUrl: "/images/community_card_1.jpg",
    productName: "Community club Singh sweater - Green",
    priceFormatted: "Tk 11,200.00",
    numericPrice: 11200,
    thumbnail: "/images/community_thumb_c1.png",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
  {
    id: "card-2",
    photoUrl: "/images/community_card_2.jpg",
    productName: "Community club Singh hoodie - Grey stonewash",
    priceFormatted: "Tk 13,500.00",
    numericPrice: 13500,
    thumbnail: "/images/community_thumb_c2.png",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
  {
    id: "card-3",
    photoUrl: "/images/community_card_3.jpg",
    productName: "Community club Singh hoodie - Brown",
    priceFormatted: "Tk 13,500.00",
    numericPrice: 13500,
    thumbnail: "/images/community_thumb_c3.png",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: true, // CENTER TALLER CARD
  },
  {
    id: "card-4",
    photoUrl: "/images/community_card_4.jpg",
    productName: "Community club Singh hoodie - Blue",
    priceFormatted: "Tk 13,500.00",
    numericPrice: 13500,
    thumbnail: "/images/community_thumb_c4.png",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
  {
    id: "card-5",
    photoUrl: "/images/community_card_5.jpg",
    productName: "Community club Kaur hoodie - Navi",
    priceFormatted: "Tk 13,500.00",
    numericPrice: 13500,
    thumbnail: "/images/community_thumb_c5.png",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
];

export default function MeetOurCommunity() {
  const { addItem, openCart } = useCart();
  const [cards, setCards] = useState<CommunityCardItem[]>(DEFAULT_COMMUNITY_CARDS);
  const [activeCenterId, setActiveCenterId] = useState<string>("card-3");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const tickingRef = useRef(false);

  // Mouse drag-to-scroll
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Load custom reels from API if uploaded in dashboard
  useEffect(() => {
    fetch("/api/community/reels")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reels) && data.reels.length > 0) {
          const activeReels = data.reels.filter((r: CommunityReel) => r.isActive !== false);
          if (activeReels.length >= 3) {
            const mapped: CommunityCardItem[] = activeReels.map((reel: CommunityReel, index: number) => ({
              id: reel._id,
              videoUrl: reel.videoUrl || "",
              photoUrl: reel.posterUrl || `/images/community_card_${(index % 5) + 1}.jpg`,
              productName: reel.product?.name || reel.title || "Community Item",
              priceFormatted: `Tk ${(reel.product?.price || 13500).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`,
              numericPrice: reel.product?.price || 13500,
              thumbnail: reel.product?.thumbnail || `/images/community_thumb_c${(index % 5) + 1}.png`,
              slug: reel.product?.slug || "architectural-pullover-hoodie-480gsm",
              isMiddleFeatured: index === Math.floor(activeReels.length / 2),
            }));
            setCards(mapped);
            const midIndex = Math.floor(mapped.length / 2);
            if (mapped[midIndex]) {
              setActiveCenterId(mapped[midIndex].id);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Center card detection based on scroll position
  const updateCenterCard = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    const cardElements = container.querySelectorAll<HTMLElement>("[data-card-id]");
    let closestId = "";
    let minDistance = Infinity;

    cardElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestId = el.getAttribute("data-card-id") || "";
      }
    });

    if (closestId) {
      setActiveCenterId((prev) => (prev !== closestId ? closestId : prev));
    }
  };

  // Center on middle card on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const el = scrollRef.current;
        const centerOffset = (el.scrollWidth - el.clientWidth) / 2;
        if (centerOffset > 0) {
          el.scrollLeft = centerOffset;
        }
        checkScroll();
        updateCenterCard();
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [cards]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = () => {
    checkScroll();
    if (!tickingRef.current) {
      window.requestAnimationFrame(() => {
        updateCenterCard();
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [cards]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardEl = container.querySelector<HTMLElement>("[data-card-id]");
    const cardWidth = cardEl ? cardEl.offsetWidth + 8 : 340;
    container.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  // Drag handlers
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

  return (
    <section className="w-full relative py-2 sm:py-4 select-none overflow-hidden bg-white px-0 lg:hidden">
      {/* Horizontal Carousel Wrapper - 100% Full Width */}
      <div className="relative w-full group/carousel">
        {/* Left Floating Arrow (Visible when scrollable) */}
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className={`absolute left-2 sm:left-4 top-[48%] -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-black hover:text-white text-black shadow-lg border border-neutral-200 flex items-center justify-center transition-all cursor-pointer ${
            canScrollLeft ? "opacity-90 hover:opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Right Floating Arrow (Visible when scrollable) */}
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className={`absolute right-2 sm:right-4 top-[48%] -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-black hover:text-white text-black shadow-lg border border-neutral-200 flex items-center justify-center transition-all cursor-pointer ${
            canScrollRight ? "opacity-90 hover:opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Cards Row - 100% Edge-to-Edge Full Width (Same to same as reference) */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex items-end gap-1 sm:gap-1.5 overflow-x-auto scroll-smooth scrollbar-none px-0 pt-8 sm:pt-12 pb-2 cursor-grab active:cursor-grabbing snap-x snap-mandatory w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cards.map((card) => {
            const isFeatured = card.id === activeCenterId;

            return (
              <div
                key={card.id}
                data-card-id={card.id}
                className={`flex-shrink-0 w-[74vw] sm:w-[45vw] md:w-[32vw] community-card-5col flex flex-col bg-white overflow-hidden snap-center transition-all duration-400 ease-out origin-bottom ${
                  isFeatured
                    ? "z-20 -translate-y-4 sm:-translate-y-6 lg:-translate-y-7 shadow-2xl"
                    : "z-10 shadow-2xs hover:opacity-100"
                }`}
              >
                {/* Media Image / Video Container (Sharp Square Edges matching screenshot) */}
                <div
                  className={`relative w-full overflow-hidden bg-neutral-900 transition-all duration-400 ${
                    isFeatured
                      ? "h-[420px] sm:h-[480px] md:h-[530px] lg:h-[590px] xl:h-[650px]"
                      : "h-[360px] sm:h-[420px] md:h-[470px] lg:h-[520px] xl:h-[570px]"
                  }`}
                >
                  {card.videoUrl ? (
                    <video
                      src={card.videoUrl}
                      poster={card.photoUrl}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <Image
                      src={card.photoUrl}
                      alt={card.productName}
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 310px"
                      className="object-cover object-center"
                      priority={isFeatured}
                      unoptimized
                    />
                  )}
                </div>

                {/* Attached Product Box directly under media (Matching screenshot 1:1) */}
                <div className="border border-neutral-200 bg-white p-2 sm:p-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
                  {/* Left: Product Thumbnail */}
                  <Link
                    href={`/product/${card.slug}`}
                    className="relative w-9 h-9 sm:w-10 sm:h-10 bg-white shrink-0 flex items-center justify-center overflow-hidden border border-neutral-100"
                    title={card.productName}
                  >
                    <Image
                      src={card.thumbnail}
                      alt={card.productName}
                      fill
                      sizes="48px"
                      className="object-contain"
                      unoptimized
                    />
                  </Link>

                  {/* Middle: Product Name & Price */}
                  <div className="flex-1 min-w-0 px-1 text-center flex flex-col items-center justify-center">
                    <Link
                      href={`/product/${card.slug}`}
                      className="text-[10px] sm:text-[11px] font-medium text-neutral-900 leading-tight line-clamp-2 block hover:underline"
                      title={card.productName}
                    >
                      {card.productName}
                    </Link>
                    <span className="text-[10px] sm:text-[11px] font-bold text-black block mt-0.5 tracking-tight">
                      {card.priceFormatted}
                    </span>
                  </div>

                  {/* Right: Small Circular Black Cart Button */}
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, card)}
                    title="Add to cart"
                    aria-label={`Add ${card.productName} to cart`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      justAddedId === card.id
                        ? "bg-emerald-600 text-white"
                        : "bg-black text-white hover:bg-neutral-800 active:scale-95"
                    }`}
                  >
                    {justAddedId === card.id ? (
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    ) : (
                      <ShoppingCart className="w-3.5 h-3.5 text-white stroke-[2]" />
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

