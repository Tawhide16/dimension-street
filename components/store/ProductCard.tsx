"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cartContext";
import { Heart, Plus, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  aspectRatio?: "portrait" | "square";
  showBadges?: boolean;
}

export default function ProductCard({
  product,
  aspectRatio = "portrait",
  showBadges = true,
}: ProductCardProps) {
  const { addItem, isInWishlist, toggleWishlist } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage = product.images[0] || "/images/placeholder.jpg";
  const hoverImage = product.images[1] || primaryImage;
  const inWishlist = isInWishlist(product._id);

  const defaultVariant = product.variants[0] || {
    sku: product.sku,
    color: "Standard",
    size: "M",
    price: product.price,
    stock: product.totalStock,
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: primaryImage,
      color: defaultVariant.color,
      size: defaultVariant.size,
      sku: defaultVariant.sku,
      price: product.price,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  // Unique colors available
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => v.colorHex || "#000"))
  ).slice(0, 4);

  return (
    <div
      className="group flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div
        className={`relative w-full bg-neutral-100 overflow-hidden rounded-xs border border-neutral-200/60 ${
          aspectRatio === "portrait" ? "aspect-3/4" : "aspect-square"
        }`}
      >
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          <Image
            src={isHovered && hoverImage ? hoverImage : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
            inWishlist
              ? "bg-red-50 text-red-600 shadow-sm"
              : "bg-white/80 backdrop-blur-xs text-neutral-600 hover:text-black hover:bg-white"
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-600" : ""}`} />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute inset-x-2 bottom-2 z-10 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            disabled={product.totalStock === 0}
            className={`w-full py-2.5 px-4 text-[11px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md ${
              product.totalStock === 0
                ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                : justAdded
                ? "bg-emerald-600 text-white"
                : "bg-white/95 text-black hover:bg-black hover:text-white backdrop-blur-xs"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ADDED TO BAG</span>
              </>
            ) : product.totalStock === 0 ? (
              <span>OUT OF STOCK</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>QUICK ADD</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="pt-3 pb-2 flex flex-col space-y-1">
        {/* Colors swatches if multiple */}
        {uniqueColors.length > 1 && (
          <div className="flex items-center gap-1.5 mb-1">
            {uniqueColors.map((hex, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block shadow-2xs"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        )}

        {/* Category tag */}
        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
          {product.category}
        </span>

        {/* Product Title */}
        <Link
          href={`/product/${product.slug}`}
          className="text-xs sm:text-sm font-bold uppercase tracking-wide text-neutral-900 hover:text-black line-clamp-1 transition-colors"
        >
          {product.name}
        </Link>

        {/* Price & Compare price */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-xs sm:text-sm font-mono font-black text-black">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs font-mono text-neutral-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
