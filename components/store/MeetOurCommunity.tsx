"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import { ShoppingCart, Check } from "lucide-react";

interface CommunityCardItem {
  id: string;
  photoUrl: string;
  productName: string;
  priceFormatted: string;
  numericPrice: number;
  thumbnail: string;
  slug: string;
  isMiddleFeatured?: boolean;
}

const COMMUNITY_CARDS: CommunityCardItem[] = [
  {
    id: "comm-1",
    photoUrl: "/images/community_photo_1.jpg",
    productName: "Community club Kaur hoodie - Navi",
    priceFormatted: "Tk 6,500.00",
    numericPrice: 6500,
    thumbnail: "/images/community_thumb_1.jpg",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
  {
    id: "comm-2",
    photoUrl: "/images/community_photo_2.jpg",
    productName: "Black stone washed Singh T-shirt",
    priceFormatted: "Tk 8,500.00",
    numericPrice: 8500,
    thumbnail: "/images/community_thumb_2.jpg",
    slug: "dimension-isometric-heavyweight-tee",
    isMiddleFeatured: false,
  },
  {
    id: "comm-3",
    photoUrl: "/images/community_photo_3.jpg",
    productName: "Black stone washed Singh T-shirt",
    priceFormatted: "Tk 8,500.00",
    numericPrice: 8500,
    thumbnail: "/images/community_thumb_3.jpg",
    slug: "dimension-isometric-heavyweight-tee",
    isMiddleFeatured: true, // MIDDLE CARD: BIGGER & TALLER
  },
  {
    id: "comm-4",
    photoUrl: "/images/community_photo_4.jpg",
    productName: "Community club Singh sweater - Green",
    priceFormatted: "Tk 11,300.00",
    numericPrice: 11300,
    thumbnail: "/images/community_thumb_4.jpg",
    slug: "architectural-pullover-hoodie-480gsm",
    isMiddleFeatured: false,
  },
  {
    id: "comm-5",
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
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

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
    <div className="w-full">
      {/* Title Centered matching reference image */}
      <h2 className="text-xl sm:text-2xl md:text-[25px] font-bold uppercase tracking-[0.2em] text-neutral-900 text-center mb-8 sm:mb-10 select-none">
        MEET OUR COMMUNITY
      </h2>

      {/* 5 Cards Row Container (Aligned to bottom so Middle Card stands taller at the top) */}
      <div className="flex items-end justify-center gap-2 sm:gap-2.5 lg:gap-3 overflow-x-auto pb-4 pt-10 sm:pt-12 px-1 scrollbar-none snap-x snap-mandatory">
        {COMMUNITY_CARDS.map((card) => {
          const isFeatured = card.isMiddleFeatured;

          return (
            <div
              key={card.id}
              className={`flex-shrink-0 flex flex-col bg-white overflow-hidden transition-all duration-300 snap-center ${
                isFeatured
                  ? "w-[240px] sm:w-[260px] md:w-[220px] lg:w-[230px] xl:w-[245px] -mt-8 sm:-mt-10 z-10 shadow-lg"
                  : "w-[200px] sm:w-[220px] md:w-[190px] lg:w-[198px] xl:w-[210px] shadow-xs"
              }`}
            >
              {/* Photo Container */}
              <div
                className={`relative w-full overflow-hidden bg-neutral-900 ${
                  isFeatured
                    ? "h-[350px] sm:h-[390px] md:h-[410px] lg:h-[440px]"
                    : "h-[300px] sm:h-[330px] md:h-[350px] lg:h-[375px]"
                }`}
              >
                <Image
                  src={card.photoUrl}
                  alt={card.productName}
                  fill
                  sizes="(max-width: 768px) 240px, 260px"
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                  priority={isFeatured}
                />
              </div>

              {/* Bottom Linked Product Bar matching reference image */}
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
  );
}
