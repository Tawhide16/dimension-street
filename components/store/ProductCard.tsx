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
  const [addedSize, setAddedSize] = useState<string | null>(null);
  const [activeColorVariant, setActiveColorVariant] = useState<(typeof product.variants)[0] | null>(null);

  const primaryImage = product.images[0] || "/images/placeholder.jpg";
  const hoverImage = product.images[1] || primaryImage;
  const inWishlist = isInWishlist(product._id);

  // Extract and organize unique size variants
  const rawVariants = product.variants && product.variants.length > 0 ? product.variants : [];

  // Group unique sizes prioritizing in-stock variants
  const sizeMap = new Map<string, (typeof rawVariants)[0]>();
  for (const v of rawVariants) {
    if (!v.size) continue;
    const existing = sizeMap.get(v.size);
    if (!existing || (existing.stock <= 0 && v.stock > 0)) {
      sizeMap.set(v.size, v);
    }
  }

  const sizeOrder: Record<string, number> = {
    XS: 1,
    S: 2,
    M: 3,
    L: 4,
    XL: 5,
    "2XL": 6,
    XXL: 6,
    "3XL": 7,
    XXXL: 7,
    OS: 8,
    "ONE SIZE": 8,
  };

  const availableSizes = Array.from(sizeMap.values()).sort((a, b) => {
    const orderA = sizeOrder[a.size.toUpperCase()] ?? 99;
    const orderB = sizeOrder[b.size.toUpperCase()] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.size.localeCompare(b.size);
  });

  const hasVariants = availableSizes.length > 0;
  const isSingleGenericSize =
    availableSizes.length === 1 &&
    ["OS", "ONE SIZE", "STANDARD", "DEFAULT"].includes(
      (availableSizes[0].size || "").trim().toUpperCase()
    );

  const handleVariantAdd = (
    e: React.MouseEvent,
    variant: {
      sku: string;
      color?: string;
      size: string;
      price: number;
      stock: number;
      image?: string;
    }
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // If a color swatch is actively selected, find the matching color+size variant
    let targetVariant = variant;
    if (activeColorVariant && activeColorVariant.color) {
      const colorSizeMatch = rawVariants.find(
        (v) =>
          v.color === activeColorVariant.color &&
          v.size === variant.size &&
          v.stock > 0
      );
      if (colorSizeMatch) {
        targetVariant = colorSizeMatch;
      }
    }

    if (targetVariant.stock <= 0) return;

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: targetVariant.image || activeColorVariant?.image || primaryImage,
      color: targetVariant.color || "Standard",
      size: targetVariant.size,
      sku: targetVariant.sku || `${product.sku}-${targetVariant.size}`,
      price: targetVariant.price || product.price,
    });

    setAddedSize(targetVariant.size);
    setTimeout(() => setAddedSize(null), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  // Unique distinct color variants
  const colorVariants = React.useMemo(() => {
    const map = new Map<string, (typeof rawVariants)[0]>();
    for (const v of rawVariants) {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, v);
      }
    }
    return Array.from(map.values()).slice(0, 6);
  }, [rawVariants]);

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
        <Link
          href={
            activeColorVariant?.linkedProductSlug
              ? `/product/${activeColorVariant.linkedProductSlug}`
              : activeColorVariant
              ? `/product/${product.slug}?color=${encodeURIComponent(activeColorVariant.color)}`
              : `/product/${product.slug}`
          }
          className="relative block w-full h-full"
        >
          <Image
            src={activeColorVariant?.image || (isHovered && hoverImage ? hoverImage : primaryImage)}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-all duration-300"
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

        {/* Variant Size / Quick Add Overlay */}
        <div className="absolute inset-x-2 bottom-2 z-10 transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0">
          {product.totalStock === 0 || (hasVariants && availableSizes.every((v) => v.stock <= 0)) ? (
            <div className="w-full py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-center bg-neutral-200/90 text-neutral-500 border border-neutral-300 backdrop-blur-xs">
              OUT OF STOCK
            </div>
          ) : hasVariants && !isSingleGenericSize ? (
            <div className="w-full bg-neutral-950/95 text-white backdrop-blur-md p-2 border border-neutral-800 shadow-xl rounded-xs flex flex-col gap-1.5 transition-all">
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold px-0.5">
                <span>SELECT SIZE</span>
                {addedSize && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                    <span>ADDED ({addedSize})</span>
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {availableSizes.map((variant) => {
                  const isOutOfStock = variant.stock <= 0;
                  const isAdded = addedSize === variant.size;
                  return (
                    <button
                      key={variant.sku || variant.size}
                      onClick={(e) => handleVariantAdd(e, variant)}
                      disabled={isOutOfStock}
                      type="button"
                      className={`flex-1 min-w-8 h-7.5 px-2 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer border rounded-2xs ${
                        isAdded
                          ? "bg-emerald-600 text-white border-emerald-500 scale-102 shadow-xs"
                          : isOutOfStock
                          ? "bg-neutral-900 text-neutral-600 border-neutral-800 line-through cursor-not-allowed opacity-50"
                          : "bg-white text-black border-white hover:bg-neutral-200 active:scale-95"
                      }`}
                      title={
                        isOutOfStock
                          ? `Size ${variant.size} — Out of stock`
                          : `Add size ${variant.size} to bag`
                      }
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        variant.size
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <button
              onClick={(e) =>
                handleVariantAdd(
                  e,
                  availableSizes[0] || {
                    sku: product.sku || product._id,
                    color: "Standard",
                    size: "One Size",
                    price: product.price,
                    stock: product.totalStock,
                  }
                )
              }
              type="button"
              className={`w-full py-2.5 px-4 text-[11px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md rounded-xs ${
                addedSize
                  ? "bg-emerald-600 text-white border border-emerald-600"
                  : "btn-slide-white border border-black/20"
              }`}
            >
              {addedSize ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>QUICK ADD</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="pt-3 pb-2 flex flex-col space-y-1">
        {/* Interactive Colors swatches */}
        {colorVariants.length > 1 && (
          <div
            className="flex items-center gap-1.5 mb-1 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {colorVariants.map((v) => {
              const isSelected = activeColorVariant?.color === v.color;
              const linkUrl = v.linkedProductSlug
                ? `/product/${v.linkedProductSlug}?color=${encodeURIComponent(v.color)}`
                : `/product/${product.slug}?color=${encodeURIComponent(v.color)}`;
              return (
                <Link
                  key={v.color}
                  href={linkUrl}
                  onMouseEnter={() => setActiveColorVariant(v)}
                  onClick={() => setActiveColorVariant(v)}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-black ring-offset-1 scale-115 border-black shadow-xs"
                      : "border-neutral-300 hover:scale-115"
                  }`}
                  style={{ backgroundColor: v.colorHex || "#111111" }}
                  title={`${v.color} (Click to view)`}
                />
              );
            })}
          </div>
        )}

        {/* Category tag */}
        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
          {product.category}
        </span>

        {/* Product Title */}
        <Link
          href={
            activeColorVariant?.linkedProductSlug
              ? `/product/${activeColorVariant.linkedProductSlug}?color=${encodeURIComponent(activeColorVariant.color)}`
              : `/product/${product.slug}`
          }
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
