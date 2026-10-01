"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import { Check } from "lucide-react";

export interface BestSellerProductItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  slug: string;
  image: string;
  sizes: string[];
}

const DEFAULT_BESTSELLERS: BestSellerProductItem[] = [
  {
    id: "bs-1",
    brand: "Singh",
    name: "Community club Singh T-shirt - Black",
    price: 8400,
    slug: "dimension-isometric-heavyweight-tee",
    image: "/images/bestseller_singh_black_tee.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "bs-2",
    brand: "Singh",
    name: "The Singh Tote bag",
    price: 3600,
    slug: "heavy-canvas-cube-logo-tote",
    image: "/images/bestseller_singh_tote.jpg",
    sizes: ["ONE SIZE"],
  },
  {
    id: "bs-3",
    brand: "Kaur",
    name: "The Kaur Tote bag",
    price: 3600,
    slug: "heavy-canvas-cube-logo-tote",
    image: "/images/bestseller_kaur_tote.jpg",
    sizes: ["ONE SIZE"],
  },
  {
    id: "bs-4",
    brand: "Singh",
    name: "Baaj T-shirt - Stonewashed Black",
    price: 8400,
    slug: "dimension-isometric-heavyweight-tee",
    image: "/images/bestseller_baaj_tee.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
];

export default function BestSellingSection() {
  const { addItem, openCart } = useCart();
  const [addedItemSku, setAddedItemSku] = useState<string | null>(null);

  const handleSelectSize = (
    e: React.MouseEvent,
    product: BestSellerProductItem,
    size: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const sku = `${product.id}-${size}`.toUpperCase();

    addItem({
      productId: product.id,
      name: `${product.name} (${size})`,
      slug: product.slug,
      image: product.image,
      color: "Standard",
      size: size,
      sku: sku,
      price: product.price,
    });

    openCart();

    setAddedItemSku(sku);
    setTimeout(() => setAddedItemSku(null), 1800);
  };

  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10">
      {/* Clean Minimalist Header matching reference */}
      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 mb-5">
        BEST SELLING PRODUCTS
      </h2>

      {/* 4 Column Product Grid - Exact same gap as New Arrivals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {DEFAULT_BESTSELLERS.map((product) => (
          <div key={product.id} className="group flex flex-col relative">
            {/* Image Container with Exact Same Aspect Ratio and Border as New Arrivals */}
            <div className="relative aspect-3/4 w-full bg-neutral-100 overflow-hidden rounded-xs border border-neutral-200/60">
              <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </Link>

              {/* Sizes Row: Bigger, Bolder Variant Buttons with Smooth Slide-in on Hover */}
              <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-xs border-t border-neutral-200 flex items-stretch divide-x divide-neutral-200 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 z-10 h-11 sm:h-12 shadow-sm">
                {product.sizes.map((size) => {
                  const sku = `${product.id}-${size}`.toUpperCase();
                  const isJustAdded = addedItemSku === sku;

                  return (
                    <button
                      key={size}
                      onClick={(e) => handleSelectSize(e, product, size)}
                      title={`Add size ${size} to bag`}
                      className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-[13px] font-mono font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center cursor-pointer ${
                        isJustAdded
                          ? "bg-black text-white"
                          : "text-neutral-900 hover:bg-black hover:text-white active:scale-95"
                      }`}
                    >
                      {isJustAdded ? <Check className="w-4 h-4 text-white" /> : size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Meta below Image */}
            <div className="pt-3 pb-2 flex flex-col space-y-1 text-left">
              <span className="text-[11px] sm:text-xs text-neutral-500 font-medium">
                {product.brand}
              </span>

              <Link
                href={`/product/${product.slug}`}
                className="text-xs sm:text-sm font-semibold text-neutral-900 hover:underline line-clamp-1"
              >
                {product.name}
              </Link>

              <span className="text-xs sm:text-sm font-bold text-neutral-900 pt-0.5">
                Tk {product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
