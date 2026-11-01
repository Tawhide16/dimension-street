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

export const DEFAULT_BESTSELLERS: BestSellerProductItem[] = [
  {
    id: "bs-1",
    brand: "Singh",
    name: "Community club Singh T-shirt - Black",
    price: 8400,
    slug: "dimension-isometric-heavyweight-tee",
    image: "/uploads/upload_1793522531375_download__15_.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "bs-2",
    brand: "Singh",
    name: "The Singh Tote bag",
    price: 3600,
    slug: "heavy-canvas-cube-logo-tote",
    image: "/uploads/upload_1793522611102_6df68508c60dee8a0ca3fa20749a2e77.jpg",
    sizes: ["ONE SIZE"],
  },
  {
    id: "bs-3",
    brand: "Kaur",
    name: "The Kaur Tote bag",
    price: 3600,
    slug: "heavy-canvas-cube-logo-tote",
    image: "/uploads/upload_1793522619943_b0f7dc9eebb32e01de3e4b519c5d5ce9.jpg",
    sizes: ["ONE SIZE"],
  },
  {
    id: "bs-4",
    brand: "Singh",
    name: "Baaj T-shirt - Stonewashed Black",
    price: 8400,
    slug: "dimension-isometric-heavyweight-tee",
    image: "/uploads/upload_1793522540692_download__13_.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
];

interface BestSellingSectionProps {
  title?: string;
  subtitle?: string;
  cards?: BestSellerProductItem[];
}

export default function BestSellingSection({
  title = "BEST SELLING PRODUCTS",
  subtitle,
  cards,
}: BestSellingSectionProps = {}) {
  const { addItem, openCart } = useCart();
  const [addedItemSku, setAddedItemSku] = useState<string | null>(null);

  const displayProducts = cards && cards.length > 0 ? cards : DEFAULT_BESTSELLERS;

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
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 cms-heading-scale">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-neutral-500 font-mono mt-1">{subtitle}</p>
        )}
      </div>

      {/* 4 Column Product Grid - Exact same gap as New Arrivals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {displayProducts.map((product) => {
          const productHref = product.slug.startsWith("/") ? product.slug : `/product/${product.slug}`;
          const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ["ONE SIZE"];

          return (
            <div key={product.id} className="group flex flex-col relative">
              {/* Image Container with Exact Same Aspect Ratio and Border as New Arrivals */}
              <div className="relative aspect-3/4 w-full bg-neutral-100 overflow-hidden rounded-xs border border-neutral-200/60">
                <Link href={productHref} className="relative block w-full h-full">
                  <Image
                    src={product.image || "/images/bestseller_singh_black_tee.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    className="object-cover object-center"
                  />
                </Link>

                {/* Sizes Row: Clean Fade-in without floating or slide-up */}
                <div className="absolute inset-x-0 bottom-0 bg-white border-t border-neutral-200 flex items-stretch divide-x divide-neutral-200 transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-10 h-11 sm:h-12">
                  {availableSizes.map((size) => {
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
                  href={productHref}
                  className="text-xs sm:text-sm font-semibold text-neutral-900 hover:underline line-clamp-1"
                >
                  {product.name}
                </Link>

                <span className="text-xs sm:text-sm font-bold text-neutral-900 pt-0.5">
                  Tk {Number(product.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
