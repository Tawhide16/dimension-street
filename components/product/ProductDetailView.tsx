"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant, Review } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { useCart } from "@/lib/cartContext";
import ProductCard from "../store/ProductCard";
import ProductReviewsSection from "./ProductReviewsSection";
import {
  Heart,
  ShoppingBag,
  Check,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Ruler,
  AlertCircle,
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquarePlus,
  X,
} from "lucide-react";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  initialReviews?: Review[];
}

export default function ProductDetailView({
  product,
  relatedProducts,
  initialReviews = [],
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

  // Specific Product Reviews state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  // Keep reviews synced with API for real-time fresh updates
  useEffect(() => {
    fetch(`/api/reviews?productId=${encodeURIComponent(product._id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.warn("Failed to fetch product reviews:", err));
  }, [product._id]);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : (product.rating || 5.0).toFixed(1);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");

    if (!reviewerName.trim() || !reviewComment.trim()) {
      setReviewError("Please enter your name and review comment.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          customerName: reviewerName.trim(),
          customerEmail: reviewerEmail.trim(),
          rating: reviewRating,
          title: reviewTitle.trim() || "Verified Buyer Review",
          comment: reviewComment.trim(),
          image: product.images?.[0] || "",
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setReviewSuccess(true);
        setReviewTitle("");
        setReviewerName("");
        setReviewerEmail("");
        setReviewComment("");
        setReviewRating(5);
        setTimeout(() => {
          setReviewSuccess(false);
          setIsFormOpen(false);
        }, 2200);
      } else {
        setReviewError(data.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

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
            {/* Description Dropdown with Product Reviews Under It */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("description")}
                aria-expanded={openAccordion === "description"}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900 group cursor-pointer transition-colors hover:text-black select-none"
              >
                <span>PRODUCT DESCRIPTION</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ease-in-out ${
                    openAccordion === "description" ? "rotate-180 text-black" : "rotate-0"
                  }`}
                />
              </button>

              <div
                className={`accordion-wrapper ${
                  openAccordion === "description" ? "is-open" : ""
                }`}
              >
                <div className="accordion-inner-content">
                  <div className="pb-6 pt-1 text-neutral-700 font-sans text-xs sm:text-[13px] leading-relaxed space-y-4">
                    <p>{product.description}</p>

                    {/* Highlights */}
                    <div className="grid grid-cols-2 gap-2 pt-2 pb-1 font-mono text-[11px] text-neutral-600">
                      {product.details?.fit && (
                        <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                          <span className="font-bold text-neutral-900 uppercase block mb-0.5">FIT PROFILE</span>
                          <span className="line-clamp-2">{product.details.fit}</span>
                        </div>
                      )}
                      {product.details?.material && (
                        <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                          <span className="font-bold text-neutral-900 uppercase block mb-0.5">MATERIAL</span>
                          <span className="line-clamp-2">{product.details.material}</span>
                        </div>
                      )}
                    </div>

                    {/* Verified Customer Reviews for this specific product directly under description */}
                    <div className="mt-5 pt-5 border-t border-neutral-200 font-sans">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-neutral-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs uppercase tracking-wider text-neutral-900">
                              CUSTOMER REVIEWS ({reviews.length})
                            </span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.round(Number(avgRating))
                                      ? "fill-black text-black"
                                      : "text-neutral-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-mono font-bold text-xs text-neutral-900">
                              {avgRating} / 5.0
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                            Verified customer experiences for {product.name}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsFormOpen(!isFormOpen)}
                          className="self-start sm:self-auto px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
                        >
                          {isFormOpen ? "CLOSE FORM" : "+ WRITE A REVIEW"}
                        </button>
                      </div>

                      {/* In-line Review Form Drawer */}
                      {isFormOpen && (
                        <div className="mb-5 p-4 bg-neutral-50 border border-neutral-200 rounded-none animate-in fade-in duration-200 font-mono">
                          {reviewSuccess ? (
                            <div className="py-5 text-center flex flex-col items-center justify-center space-y-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                              <span className="text-xs font-bold uppercase text-neutral-900">
                                Review Submitted Successfully!
                              </span>
                              <span className="text-[11px] text-neutral-500 font-sans">
                                Your review is now live on this product.
                              </span>
                            </div>
                          ) : (
                            <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                              {reviewError && (
                                <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-[11px]">
                                  {reviewError}
                                </div>
                              )}
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                                  YOUR RATING *
                                </span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => setReviewRating(val)}
                                      onMouseEnter={() => setHoverRating(val)}
                                      onMouseLeave={() => setHoverRating(null)}
                                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                                      aria-label={`Rate ${val} stars`}
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          (hoverRating !== null ? hoverRating : reviewRating) >= val
                                            ? "fill-black text-black"
                                            : "text-neutral-300"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                  <span className="text-[11px] text-neutral-500 ml-2">
                                    {reviewRating} of 5 Stars
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans">
                                <div>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Your Name *"
                                    value={reviewerName}
                                    onChange={(e) => setReviewerName(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 text-xs focus:outline-none focus:border-black"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="email"
                                    placeholder="Email Address (Optional)"
                                    value={reviewerEmail}
                                    onChange={(e) => setReviewerEmail(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 text-xs focus:outline-none focus:border-black"
                                  />
                                </div>
                              </div>

                              <div className="font-sans">
                                <input
                                  type="text"
                                  placeholder="Review Headline (e.g. Heavyweight quality & perfect oversized cut)"
                                  value={reviewTitle}
                                  onChange={(e) => setReviewTitle(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 text-xs focus:outline-none focus:border-black"
                                />
                              </div>

                              <div className="font-sans">
                                <textarea
                                  rows={3}
                                  required
                                  placeholder="Write your feedback regarding fabric density, stitching, drape, and sizing..."
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 text-xs focus:outline-none focus:border-black resize-y"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="w-full py-2.5 bg-black text-white text-[11px] font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
                              >
                                {submittingReview ? "SUBMITTING REVIEW..." : "POST VERIFIED REVIEW"}
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                      {/* Reviews List */}
                      {reviews.length === 0 ? (
                        <div className="py-6 text-center text-neutral-500 text-xs font-mono border border-dashed border-neutral-300 bg-neutral-50 p-4">
                          <p className="uppercase tracking-wider font-bold mb-1">NO REVIEWS YET FOR THIS PIECE</p>
                          <p className="text-[11px] text-neutral-400 font-sans mb-3">
                            Be the first to share your experience with the community.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsFormOpen(true)}
                            className="px-3 py-1.5 bg-black text-white text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                          >
                            WRITE FIRST REVIEW
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1.5 divide-y divide-neutral-100">
                          {reviews.map((rev) => (
                            <div key={rev._id} className="pt-3.5 first:pt-0">
                              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < rev.rating ? "fill-black text-black" : "text-neutral-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-bold text-neutral-900">{rev.customerName}</span>
                                  {rev.verifiedPurchase && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 uppercase font-semibold">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <span suppressHydrationWarning className="text-[10px] text-neutral-400">
                                  {formatDate(rev.createdAt)}
                                </span>
                              </div>

                              {rev.title && (
                                <h5 className="text-xs sm:text-[13px] font-bold text-neutral-900 mb-1 font-sans">
                                  {rev.title}
                                </h5>
                              )}
                              <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                                {rev.comment}
                              </p>

                              <div className="flex items-center justify-end pt-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleHelpful(rev._id)}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 hover:text-black transition-colors cursor-pointer"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>Helpful ({(helpfulVotes[rev._id] || 0) + (rev.rating >= 5 ? 4 : 1)})</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Customer Reviews Dropdown Accordion */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("reviews")}
                aria-expanded={openAccordion === "reviews"}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900 group cursor-pointer transition-colors hover:text-black select-none"
              >
                <div className="flex items-center gap-2">
                  <span>CUSTOMER REVIEWS ({reviews.length})</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3 h-3 fill-black text-black" />
                    <span className="text-[11px] text-neutral-900 font-bold">{avgRating}</span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ease-in-out ${
                    openAccordion === "reviews" ? "rotate-180 text-black" : "rotate-0"
                  }`}
                />
              </button>

              <div
                className={`accordion-wrapper ${
                  openAccordion === "reviews" ? "is-open" : ""
                }`}
              >
                <div className="accordion-inner-content">
                  <div className="pb-6 pt-1 text-neutral-700 font-sans text-xs leading-relaxed space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                      <div>
                        <span className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-900 block">
                          VERIFIED PRODUCT RATINGS
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {totalReviews} verified community {totalReviews === 1 ? "review" : "reviews"} for {product.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        {isFormOpen ? "CLOSE" : "+ WRITE REVIEW"}
                      </button>
                    </div>

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <div className="py-6 text-center text-neutral-500 text-xs font-mono border border-dashed border-neutral-300 bg-neutral-50 p-4">
                        <p className="uppercase tracking-wider font-bold mb-1">NO REVIEWS YET</p>
                        <p className="text-[11px] text-neutral-400 font-sans">
                          Be the first to share your thoughts on the cut, weight, and silhouette.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 divide-y divide-neutral-100">
                        {reviews.map((rev) => (
                          <div key={rev._id} className="pt-3.5 first:pt-0">
                            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-1">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < rev.rating ? "fill-black text-black" : "text-neutral-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-neutral-900">{rev.customerName}</span>
                                {rev.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 uppercase font-semibold">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <span suppressHydrationWarning className="text-[10px] text-neutral-400">
                                {formatDate(rev.createdAt)}
                              </span>
                            </div>

                            {rev.title && (
                              <h5 className="text-xs sm:text-[13px] font-bold text-neutral-900 mb-1 font-sans">
                                {rev.title}
                              </h5>
                            )}
                            <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                              {rev.comment}
                            </p>

                            <div className="flex items-center justify-end pt-1.5">
                              <button
                                type="button"
                                onClick={() => handleHelpful(rev._id)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 hover:text-black transition-colors cursor-pointer"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Helpful ({(helpfulVotes[rev._id] || 0) + (rev.rating >= 5 ? 4 : 1)})</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Size & Fit */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("size-fit")}
                aria-expanded={openAccordion === "size-fit"}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900 group cursor-pointer transition-colors hover:text-black select-none"
              >
                <span>SIZE & FIT GUIDE</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ease-in-out ${
                    openAccordion === "size-fit" ? "rotate-180 text-black" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`accordion-wrapper ${
                  openAccordion === "size-fit" ? "is-open" : ""
                }`}
              >
                <div className="accordion-inner-content">
                  <div className="pb-5 text-neutral-600 font-sans text-xs leading-relaxed space-y-2">
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
                </div>
              </div>
            </div>

            {/* Material & Fabric Specs */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("material")}
                aria-expanded={openAccordion === "material"}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900 group cursor-pointer transition-colors hover:text-black select-none"
              >
                <span>MATERIAL & FABRIC SPECS</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ease-in-out ${
                    openAccordion === "material" ? "rotate-180 text-black" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`accordion-wrapper ${
                  openAccordion === "material" ? "is-open" : ""
                }`}
              >
                <div className="accordion-inner-content">
                  <div className="pb-5 text-neutral-600 font-sans text-xs leading-relaxed">
                    <p>{product.details?.material || "100% Combed Heavyweight Organic Cotton."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Returns */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("shipping")}
                aria-expanded={openAccordion === "shipping"}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900 group cursor-pointer transition-colors hover:text-black select-none"
              >
                <span>SHIPPING & RETURNS</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ease-in-out ${
                    openAccordion === "shipping" ? "rotate-180 text-black" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`accordion-wrapper ${
                  openAccordion === "shipping" ? "is-open" : ""
                }`}
              >
                <div className="accordion-inner-content">
                  <div className="pb-5 text-neutral-600 font-sans text-xs leading-relaxed">
                    <p>{product.details?.shipping || "Standard delivery 1-3 business days. Free shipping over $150."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Care Instructions */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("care")}
                aria-expanded={openAccordion === "care"}
                className="w-full py-3.5 flex justify-between items-center text-left font-bold uppercase tracking-wider text-neutral-900 group cursor-pointer transition-colors hover:text-black select-none"
              >
                <span>CARE INSTRUCTIONS</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ease-in-out ${
                    openAccordion === "care" ? "rotate-180 text-black" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`accordion-wrapper ${
                  openAccordion === "care" ? "is-open" : ""
                }`}
              >
                <div className="accordion-inner-content">
                  <div className="pb-5 text-neutral-600 font-sans text-xs leading-relaxed">
                    <p>{product.details?.care || "Cold wash inside out. Line dry in shade."}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviewsSection product={product} initialReviews={reviews} />

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
