"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { formatPrice } from "@/lib/utils";
import { PaymentMethod } from "@/types";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Tag,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function CheckoutForm() {
  const router = useRouter();
  const {
    items,
    subtotal,
    isFreeShipping,
    couponCode,
    discountAmount,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    city: "Dhaka",
    state: "Dhaka Division",
    postalCode: "1212",
    country: "Bangladesh",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [bkashNumber, setBkashNumber] = useState("");
  const [bkashTrx, setBkashTrx] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.user) {
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || data.user.name || "",
            email: prev.email || data.user.email || "",
            phone: prev.phone || data.user.phone || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const shippingCost = isFreeShipping || items.length === 0 ? 0 : 15;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black uppercase font-mono mb-2">Your Bag is Empty</h2>
        <p className="text-xs text-neutral-500 mb-6">
          Add some heavyweight pieces to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3.5 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors inline-block"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const res = await applyCoupon(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoInput("");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const orderPayload = {
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          slug: i.slug,
          image: i.image,
          color: i.color,
          size: i.size,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod,
        couponCode: couponCode || undefined,
        notes: formData.notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Clear local cart
      clearCart();

      // Redirect to confirmation
      router.push(`/checkout/success?orderId=${data.order._id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred while placing order.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: Customer & Shipping Details */}
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Step 1: Customer Contact */}
            <div className="bg-white p-6 border border-neutral-200 rounded-xs shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-black font-mono uppercase tracking-wider text-neutral-900">
                  Customer Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Tariqul Islam"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tariqul@gmail.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    Phone Number (for Courier) *
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+880 1711 000000"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="bg-white p-6 border border-neutral-200 rounded-xs shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-black font-mono uppercase tracking-wider text-neutral-900">
                  Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    Street Address & House / Road *
                  </label>
                  <input
                    type="text"
                    required
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="House 42, Road 11, Banani"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    Apartment / Flat / Floor (Optional)
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="Apt 4B, Level 4"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Dhaka"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="1213"
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium bg-white"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Japan">Japan</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Please call when courier arrives."
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white p-6 border border-neutral-200 rounded-xs shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-black font-mono uppercase tracking-wider text-neutral-900">
                  Select Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-0.5 accent-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-neutral-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-700" />
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] font-mono bg-neutral-200 px-2 py-0.5 rounded text-neutral-800">
                        Popular in Bangladesh
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Inspect your package and pay cash directly to the courier upon delivery.
                    </p>
                  </div>
                </label>

                {/* bKash Payment */}
                <label
                  className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-all ${
                    paymentMethod === "bkash"
                      ? "border-black bg-pink-50/40 ring-1 ring-black"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bkash"
                    checked={paymentMethod === "bkash"}
                    onChange={() => setPaymentMethod("bkash")}
                    className="mt-0.5 accent-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-neutral-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-pink-600" />
                        bKash Merchant Pay
                      </span>
                      <span className="text-[10px] font-mono bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded">
                        Instant Checkout
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Send payment to Merchant Account <strong>01700-DIMENSION</strong> and enter Transaction ID.
                    </p>

                    {paymentMethod === "bkash" && (
                      <div className="mt-3 pt-3 border-t border-pink-200 grid grid-cols-2 gap-2">
                        <input
                          type="tel"
                          placeholder="Your bKash Number"
                          value={bkashNumber}
                          onChange={(e) => setBkashNumber(e.target.value)}
                          className="px-3 py-2 text-xs border border-pink-300 rounded bg-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="TrxID (e.g. 9K283JFD)"
                          value={bkashTrx}
                          onChange={(e) => setBkashTrx(e.target.value)}
                          className="px-3 py-2 text-xs border border-pink-300 rounded bg-white font-mono uppercase"
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* Card / Stripe */}
                <label
                  className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="mt-0.5 accent-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-neutral-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-neutral-800" />
                        Credit / Debit Card (Stripe Gateway)
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        256-bit SSL
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Visa, MasterCard, American Express. Encrypted end-to-end.
                    </p>

                    {paymentMethod === "card" && (
                      <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2">
                        <input
                          type="text"
                          placeholder="Card Number: 4242 •••• •••• 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white font-mono"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            value={cardExp}
                            onChange={(e) => setCardExp(e.target.value)}
                            className="px-3 py-2 text-xs border border-neutral-300 rounded bg-white font-mono"
                          />
                          <input
                            type="text"
                            placeholder="CVC"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="px-3 py-2 text-xs border border-neutral-300 rounded bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded">
                {submitError}
              </div>
            )}
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-50 p-6 border border-neutral-200 rounded-xs sticky top-24 space-y-6">
            <h3 className="text-sm font-black font-mono uppercase tracking-widest text-neutral-900 pb-3 border-b border-neutral-200">
              Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>

            {/* Items list */}
            <div className="divide-y divide-neutral-200 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.sku} className="py-3 flex items-center gap-3">
                  <div className="relative w-14 h-16 bg-neutral-200 rounded-xs overflow-hidden flex-shrink-0 border border-neutral-300">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {item.color} / {item.size}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-black flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <div className="pt-2 border-t border-neutral-200">
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono rounded-xs">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <strong>{couponCode}</strong> applied (-{formatPrice(discountAmount)})
                  </span>
                  <button onClick={removeCoupon} className="text-emerald-950 underline text-[11px]">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code (e.g. WELCOME10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-xs font-mono uppercase bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-mono font-bold uppercase rounded-xs"
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[10px] text-red-600 font-mono mt-1">{promoError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t border-neutral-200 text-xs font-mono text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-black">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-black pt-3 border-t border-neutral-300">
                <span>Total</span>
                <div className="text-right">
                  <div>{formatPrice(finalTotal)}</div>
                  <div className="text-[11px] text-neutral-500 font-normal">
                    ≈ ৳{(finalTotal * 120).toLocaleString()} BDT
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-4 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? "PROCESSING ORDER..." : "PLACE ORDER NOW"}</span>
            </button>

            {/* Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dimension Guaranteed • Authentic Streetwear</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
