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

      {/* 4 Column Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {DEFAULT_BESTSELLERS.map((product) => (
          <div key={product.id} className="group flex flex-col">
            {/* Image Container with Hover Size Bar */}
            <div className="relative aspect-square w-full bg-[#f4f4f4] overflow-hidden">
              <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-102"
                />
              </Link>

              {/* Sizes Row: slides/fades in on card hover */}
              <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-xs border-t border-neutral-200 flex items-stretch divide-x divide-neutral-200 transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 z-10">
                {product.sizes.map((size) => {
                  const sku = `${product.id}-${size}`.toUpperCase();
                  const isJustAdded = addedItemSku === sku;

                  return (
                    <button
                      key={size}
                      onClick={(e) => handleSelectSize(e, product, size)}
                      title={`Add size ${size} to bag`}
                      className={`flex-1 py-2 text-[10px] sm:text-[11px] font-mono font-medium uppercase tracking-wider text-center transition-colors flex items-center justify-center ${
                        isJustAdded
                          ? "bg-black text-white"
                          : "text-neutral-800 hover:bg-black hover:text-white"
                      }`}
                    >
                      {isJustAdded ? <Check className="w-3 h-3 text-white" /> : size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Meta below Image matching reference */}
            <div className="pt-3 flex flex-col items-start text-left">
              <span className="text-[11px] sm:text-xs text-neutral-500 font-normal">
                {product.brand}
              </span>

              <Link
                href={`/product/${product.slug}`}
                className="text-xs sm:text-sm font-semibold text-neutral-900 mt-0.5 hover:underline line-clamp-1"
              >
                {product.name}
              </Link>

              <span className="text-xs sm:text-sm font-bold text-neutral-900 mt-1">
                Tk {product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
