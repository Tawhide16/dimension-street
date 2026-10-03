"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import { formatPrice } from "@/lib/utils";
import { X, Trash2, ArrowRight, ShieldCheck, Truck, Tag, Plus, Minus } from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    freeShippingThreshold,
    freeShippingProgress,
    isFreeShipping,
    couponCode,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setIsApplying(true);
    setCouponFeedback(null);
    const res = await applyCoupon(inputCoupon);
    setIsApplying(false);
    setCouponFeedback({ text: res.message, error: !res.success });
    if (res.success) setInputCoupon("");
  };

  const finalShipping = isFreeShipping || items.length === 0 ? 0 : 15;
  const estimatedTotal = Math.max(0, subtotal - discountAmount + finalShipping);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
    >
      {/* Backdrop with smooth fade transition */}
      <div
        className={`absolute inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel with smooth slide-in/slide-out transform transition */}
        <div
          className={`w-screen max-w-md bg-white text-neutral-900 shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-widest uppercase font-mono text-neutral-900">
                Your Bag
              </h2>
              <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-mono font-bold">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-neutral-400 hover:text-black transition-colors rounded-full hover:bg-neutral-100 cursor-pointer"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5 text-neutral-800" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-neutral-100 px-5 py-3 border-b border-neutral-200">
            <div className="flex items-center justify-between text-xs font-mono font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-neutral-800">
                <Truck className="w-3.5 h-3.5 text-neutral-700" />
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-bold">
                    You unlocked FREE Express Shipping!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-black font-bold">{formatPrice(freeShippingThreshold - subtotal)}</strong> for Free Express Delivery
                  </span>
                )}
              </span>
              <span className="text-[11px] text-neutral-600 font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? "bg-emerald-600" : "bg-black"
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                  <Tag className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                  Your bag is empty
                </h3>
                <p className="text-xs text-neutral-600 max-w-xs mt-1 mb-6">
                  Discover our heavyweight tees, technical cargos, and limited edition outerwear.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="px-6 py-3 bg-black text-white text-xs font-mono font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors"
                >
                  Shop New Drops
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.sku} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-neutral-100 flex-shrink-0 overflow-hidden rounded-xs border border-neutral-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-xs font-bold uppercase tracking-wide text-neutral-900 hover:text-black hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.sku)}
                          className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-600 font-mono">
                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 font-medium">
                          {item.color}
                        </span>
                        <span>/</span>
                        <span className="font-bold text-neutral-900">{item.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-neutral-300 rounded-sm">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <span className="text-xs font-mono font-bold text-neutral-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/80 space-y-4">
              {/* Promo code input */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs font-mono">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Promo Applied: <strong>{couponCode}</strong> (-{formatPrice(discountAmount)})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-900 underline hover:text-emerald-950 text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. WELCOME10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-sm uppercase font-mono placeholder:normal-case focus:outline-none focus:border-black text-neutral-900 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !inputCoupon.trim()}
                      className="px-4 py-2 bg-neutral-900 text-white text-xs font-mono font-bold uppercase rounded-sm hover:bg-black disabled:opacity-50"
                    >
                      {isApplying ? "..." : "Apply"}
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <p
                    className={`text-[11px] font-mono mt-1 ${
                      couponFeedback.error ? "text-red-500" : "text-emerald-600 font-semibold"
                    }`}
                  >
                    {couponFeedback.text}
                  </p>
                )}
              </div>

              {/* Subtotal & Calculations */}
              <div className="space-y-1.5 text-xs font-mono text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{finalShipping === 0 ? "FREE" : formatPrice(finalShipping)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <span>{formatPrice(estimatedTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA with Slide Fill Hover */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-slide-black w-full py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                  Secure Checkout
                </span>
                <span>•</span>
                <span>COD & bKash Supported</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
