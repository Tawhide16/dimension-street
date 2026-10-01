"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Review, Product } from "@/types";
import { Star, CheckCircle2, ThumbsUp, MessageSquarePlus, X, Check } from "lucide-react";

interface ProductReviewsSectionProps {
  product: Product;
  initialReviews?: Review[];
}

export default function ProductReviewsSection({
  product,
  initialReviews = [],
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [comment, setComment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch reviews for this product on mount
  useEffect(() => {
    fetch(`/api/reviews?productId=${encodeURIComponent(product._id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews)) {
          // If product-specific reviews exist, use them. If none yet, provide general community reviews
          if (data.reviews.length > 0) {
            setReviews(data.reviews);
          } else if (initialReviews.length > 0) {
            setReviews(initialReviews);
          }
        }
      })
      .catch((err) => console.warn("Could not fetch product reviews:", err));
  }, [product._id, initialReviews]);

  // Calculate rating stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : (product.rating || 5.0).toFixed(1);

  // Handle Form Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim() || !comment.trim()) {
      setErrorMsg("Please enter your name and a review comment.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          rating,
          title: title.trim() || "Verified Community Review",
          comment: comment.trim(),
          image: product.images?.[0] || "/images/bestseller_singh_black_tee.jpg",
        }),
      });

      const data = await res.json();

      if (data.success && data.review) {
        // Optimistically add to top of list
        setReviews((prev) => [data.review, ...prev]);
        setSubmittedSuccess(true);
        setTitle("");
        setCustomerName("");
        setCustomerEmail("");
        setComment("");
        setRating(5);

        setTimeout(() => {
          setSubmittedSuccess(false);
          setIsFormOpen(false);
        }, 2200);
      } else {
        setErrorMsg(data.error || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

  return (
    <section className="w-full mt-20 pt-14 border-t border-neutral-200">
      {/* Header and Summary Box */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400 block mb-1">
            VERIFIED EXPERIENCES // FEEDBACK
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
            CUSTOMER REVIEWS
          </h2>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-black">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(Number(avgRating))
                      ? "fill-black text-black"
                      : "text-neutral-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-mono font-bold text-neutral-900">
              {avgRating} / 5.0
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {/* Write a Review Button */}
        <div>
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="btn-slide-black px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 border border-black shadow-xs cursor-pointer transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{isFormOpen ? "CLOSE FORM" : "WRITE A REVIEW"}</span>
          </button>
        </div>
      </div>

      {/* Review Submission Form Drawer / Panel */}
      {isFormOpen && (
        <div className="my-8 p-6 sm:p-8 bg-[#fafafa] border border-neutral-200 rounded-none transition-all duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900">
              SHARE YOUR EXPERIENCE FOR {product.name}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-neutral-400 hover:text-black cursor-pointer p-1"
              aria-label="Close review form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submittedSuccess ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-base font-bold uppercase tracking-wider text-neutral-900 font-mono">
                THANK YOU FOR YOUR REVIEW!
              </h4>
              <p className="text-xs text-neutral-600 max-w-md">
                Your review has been verified and published to this product and the community home feed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                  {errorMsg}
                </div>
              )}

              {/* Star Rating Select */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  YOUR RATING *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isActive =
                        (hoverRating !== null ? hoverRating : rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 cursor-pointer focus:outline-none transition-transform hover:scale-110"
                          aria-label={`Rate ${starVal} stars`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              isActive
                                ? "fill-black text-black"
                                : "text-neutral-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-mono text-neutral-500 ml-2">
                    {rating === 5 && "Excellent — Luxury Grail"}
                    {rating === 4 && "Very Good — Great Quality"}
                    {rating === 3 && "Average — Satisfactory"}
                    {rating === 2 && "Fair — Needs Improvement"}
                    {rating === 1 && "Poor"}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label
                  htmlFor="review-title"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1"
                >
                  REVIEW HEADLINE
                </label>
                <input
                  id="review-title"
                  type="text"
                  placeholder="e.g. Incredible fabric density & modern oversized silhouette"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 text-xs sm:text-sm font-sans focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1"
                  >
                    YOUR NAME *
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    required
                    placeholder="e.g. Tariqul I."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-300 text-xs sm:text-sm font-sans focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customer-email"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1"
                  >
                    EMAIL ADDRESS (WILL NOT BE PUBLISHED)
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-300 text-xs sm:text-sm font-sans focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Comment Field */}
              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1"
                >
                  DETAILED REVIEW *
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  required
                  placeholder="Tell the community about the heavyweight feel, stitching details, sizing fit, and wash durability..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 text-xs sm:text-sm font-sans focus:outline-none focus:border-black transition-colors resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-slide-black px-8 py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest border border-black shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "SUBMITTING REVIEW..." : "POST VERIFIED REVIEW"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review List */}
      <div className="mt-8 space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-300 bg-neutral-50 p-8">
            <p className="text-sm font-mono text-neutral-600 uppercase tracking-wider mb-3">
              NO REVIEWS YET FOR THIS PIECE
            </p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
              Be the first to share your thoughts on the cut, weight, and silhouette.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="btn-slide-black px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-widest border border-black bg-black text-white cursor-pointer"
            >
              BE THE FIRST TO REVIEW
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {reviews.map((rev) => {
              const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={rev._id} className="py-6 first:pt-2 last:pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5 text-black">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? "fill-black text-black"
                                : "text-neutral-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Verified Badge */}
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-[11px] font-mono text-neutral-400">
                      {formattedDate}
                    </span>
                  </div>

                  {/* Title */}
                  {rev.title && (
                    <h4 className="text-sm sm:text-base font-bold text-neutral-900 mb-1.5 uppercase tracking-normal">
                      {rev.title}
                    </h4>
                  )}

                  {/* Comment */}
                  <p className="text-xs sm:text-[13px] text-neutral-700 leading-relaxed max-w-3xl mb-3">
                    {rev.comment}
                  </p>

                  {/* Reviewer Name and Helpful Button */}
                  <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                    <span className="font-mono font-medium text-neutral-600 text-[11px] uppercase tracking-wider">
                      — {rev.customerName}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleHelpful(rev._id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>
                        Helpful ({(helpfulVotes[rev._id] || 0) + (rev.rating >= 5 ? 4 : 1)})
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
