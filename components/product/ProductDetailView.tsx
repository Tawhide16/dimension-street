"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cartContext";
import ProductCard from "../store/ProductCard";
import {
  Heart,
  ShoppingBag,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Ruler,
  AlertCircle,
} from "lucide-react";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const { addItem, isInWishlist, toggleWishlist } = useCart();

  // Active variant state
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants[0]?.color || "Standard"
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants[0]?.size || "M"
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddedBanner, setShowAddedBanner] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  // Determine active variant based on selection
  const activeVariant: ProductVariant =
    product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    ) ||
    product.variants.find((v) => v.color === selectedColor) ||
    product.variants[0];

  // List of distinct colors
  const availableColors = Array.from(
    new Map(product.variants.map((v) => [v.color, v])).values()
  );

  // Available sizes for currently selected color
  const availableSizes = product.variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.size);

  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = (activeVariant?.stock || 0) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setIsAdding(true);

    addItem(
      {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images[activeImageIndex] || product.images[0],
        color: activeVariant.color,
        size: activeVariant.size,
        sku: activeVariant.sku,
        price: activeVariant.price || product.price,
      },
      quantity
    );

    setIsAdding(false);
    setShowAddedBanner(true);
    setTimeout(() => setShowAddedBanner(false), 3000);
  };

  const toggleAccordion = (name: string) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-mono uppercase text-neutral-500 mb-8">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-black">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-black font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Grid: Gallery + Sticky Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* LEFT COLUMN: Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
          {/* Main Large Image */}
          <div className="flex-1 relative aspect-3/4 bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200">
            <Image
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
                inWishlist
                  ? "bg-red-50 text-red-600"
                  : "bg-white/90 text-neutral-700 hover:text-black hover:bg-white"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-600" : ""}`} />
            </button>
          </div>

          {/* Thumbnails Sidebar / Row */}
          {product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto w-full md:w-20 flex-shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square w-16 md:w-full rounded-xs overflow-hidden border transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? "border-black ring-1 ring-black"
                      : "border-neutral-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Information & Purchase Controls */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
          {/* Header & Meta */}
          <div className="border-b border-neutral-200 pb-5">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1.5">
              <span>DIMENSION STREET // ARCHIVE</span>
              <span className="text-neutral-400">SKU: {activeVariant?.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-mono font-black text-black">
                {formatPrice(activeVariant?.price || product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-base font-mono text-neutral-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-200">
                    SAVE {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Short Tagline */}
            {product.shortDescription && (
              <p className="mt-3 text-xs text-neutral-600 leading-relaxed font-normal">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-2.5">
              <span className="uppercase text-neutral-500 tracking-wider">
                COLOR: <strong className="text-black">{selectedColor}</strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((v) => (
                <button
                  key={v.color}
                  onClick={() => setSelectedColor(v.color)}
                  className={`px-3 py-2 text-xs font-mono rounded-xs border flex items-center gap-2 transition-all ${
                    selectedColor === v.color
                      ? "border-black bg-neutral-900 text-white font-bold"
                      : "border-neutral-300 bg-white text-neutral-800 hover:border-black"
                  }`}
                >
                  {v.colorHex && (
                    <span
                      className="w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: v.colorHex }}
                    />
                  )}
                  <span>{v.color}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-2.5">
              <span className="uppercase text-neutral-500 tracking-wider">
                SIZE: <strong className="text-black">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => toggleAccordion("size-fit")}
                className="inline-flex items-center gap-1 text-[11px] underline uppercase tracking-wider text-neutral-600 hover:text-black"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["S", "M", "L", "XL"].map((sz) => {
                const isAvailable = availableSizes.includes(sz);
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-3 text-xs font-mono font-bold uppercase rounded-xs border transition-all text-center ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : isAvailable
                        ? "bg-white text-neutral-900 border-neutral-300 hover:border-black"
                        : "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed line-through"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Availability indicator */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                Out of Stock in this Variant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock ({activeVariant.stock} available in Dhaka Hub)
              </span>
            )}
          </div>

          {/* Quantity and Add to Bag */}
          <div className="flex gap-3 pt-2">
            {/* Quantity */}
            <div className="flex items-center border border-neutral-300 rounded-xs bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-3 text-neutral-600 hover:text-black font-mono"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-3 text-xs font-mono font-bold text-black min-w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(activeVariant?.stock || 10, quantity + 1))}
                className="px-3 py-3 text-neutral-600 hover:text-black font-mono"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Bag CTA */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`flex-1 py-3.5 px-6 text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                isOutOfStock
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? "SOLD OUT" : "ADD TO BAG"}</span>
            </button>
          </div>

          {/* Added feedback banner */}
          {showAddedBanner && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Added {quantity}x &ldquo;{product.name}&rdquo; ({selectedSize}) to bag!
              </span>
              <Link href="/checkout" className="underline font-bold hover:text-black">
                Checkout Now
              </Link>
            </div>
          )}

          {/* Value Props matching luxury references */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-neutral-200 text-center font-mono text-[10px] text-neutral-600">
            <div className="flex flex-col items-center gap-1 p-2">
              <Truck className="w-4 h-4 text-neutral-800" />
              <span>Express Dhaka Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 border-x border-neutral-200">
              <RotateCcw className="w-4 h-4 text-neutral-800" />
              <span>14-Day Free Exchange</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <ShieldCheck className="w-4 h-4 text-neutral-800" />
              <span>100% Authentic Quality</span>
            </div>
          </div>

          {/* Product Accordions */}
          <div className="divide-y divide-neutral-200 border-b border-neutral-200 font-mono text-xs">
            {/* Description */}
            <div>
              <button
                onClick={() => toggleAccordion("description")}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900"
              >
                <span>PRODUCT DESCRIPTION</span>
                {openAccordion === "description" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {openAccordion === "description" && (
                <div className="pb-4 text-neutral-600 font-sans text-xs leading-relaxed">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Size & Fit */}
            <div>
              <button
                onClick={() => toggleAccordion("size-fit")}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900"
              >
                <span>SIZE & FIT GUIDE</span>
                {openAccordion === "size-fit" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {openAccordion === "size-fit" && (
                <div className="pb-4 text-neutral-600 font-sans text-xs leading-relaxed space-y-2">
                  <p>{product.details?.fit || "Relaxed streetwear oversized cut."}</p>
                  <table className="w-full border border-neutral-200 text-center text-[11px] font-mono mt-2">
                    <thead className="bg-neutral-100 text-neutral-800">
                      <tr>
                        <th className="p-1.5 border">Size</th>
                        <th className="p-1.5 border">Chest (in)</th>
                        <th className="p-1.5 border">Length (in)</th>
                        <th className="p-1.5 border">Shoulder (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1.5 border font-bold">S</td>
                        <td className="p-1.5 border">42</td>
                        <td className="p-1.5 border">28</td>
                        <td className="p-1.5 border">20.5</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border font-bold">M</td>
                        <td className="p-1.5 border">44</td>
                        <td className="p-1.5 border">29</td>
                        <td className="p-1.5 border">21.5</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border font-bold">L</td>
                        <td className="p-1.5 border">46</td>
                        <td className="p-1.5 border">30</td>
                        <td className="p-1.5 border">22.5</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border font-bold">XL</td>
                        <td className="p-1.5 border">48</td>
                        <td className="p-1.5 border">31</td>
                        <td className="p-1.5 border">23.5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Material & Fabric Specs */}
            <div>
              <button
                onClick={() => toggleAccordion("material")}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900"
              >
                <span>MATERIAL & FABRIC SPECS</span>
                {openAccordion === "material" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {openAccordion === "material" && (
                <div className="pb-4 text-neutral-600 font-sans text-xs leading-relaxed">
                  <p>{product.details?.material || "100% Combed Heavyweight Organic Cotton."}</p>
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div>
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900"
              >
                <span>SHIPPING & RETURNS</span>
                {openAccordion === "shipping" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {openAccordion === "shipping" && (
                <div className="pb-4 text-neutral-600 font-sans text-xs leading-relaxed">
                  <p>{product.details?.shipping || "Standard delivery 1-3 business days. Free shipping over $150."}</p>
                </div>
              )}
            </div>

            {/* Care Instructions */}
            <div>
              <button
                onClick={() => toggleAccordion("care")}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900"
              >
                <span>CARE INSTRUCTIONS</span>
                {openAccordion === "care" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {openAccordion === "care" && (
                <div className="pb-4 text-neutral-600 font-sans text-xs leading-relaxed">
                  <p>{product.details?.care || "Cold wash inside out. Line dry in shade."}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products: YOU MAY ALSO LIKE */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                RECOMMENDED
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
                YOU MAY ALSO LIKE
              </h3>
            </div>
            <Link
              href="/shop"
              className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-600 hover:text-black"
            >
              Shop All Archive →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
