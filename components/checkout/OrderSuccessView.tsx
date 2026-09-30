"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { CheckCircle, Package, ArrowRight, Printer, MapPin, Truck } from "lucide-react";
import Image from "next/image";

interface OrderSuccessViewProps {
  order: Order;
}

export default function OrderSuccessView({ order }: OrderSuccessViewProps) {
  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#000000", "#555555", "#10B981", "#E5E5E5"],
      });
    } catch {
      // ignore
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 font-mono">
      {/* Success Badge */}
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="text-xs tracking-[0.25em] uppercase text-emerald-700 font-bold block">
          ORDER CONFIRMED
        </span>

        <h1 className="text-3xl sm:text-4xl font-black uppercase text-neutral-900 font-sans tracking-tight">
          THANK YOU FOR YOUR ORDER
        </h1>

        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          We&apos;ve sent a confirmation email to <strong className="text-black">{order.customer.email}</strong> with your tracking information.
        </p>

        <div className="inline-flex items-center gap-3 bg-neutral-100 px-4 py-2 rounded-xs border border-neutral-200 text-xs">
          <span>Order Number: <strong className="text-black">{order.orderNumber}</strong></span>
          <span className="text-neutral-400">•</span>
          <span>Date: <strong>{formatDate(order.createdAt)}</strong></span>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="bg-white border border-neutral-200 rounded-xs overflow-hidden shadow-sm">
        {/* Status Bar */}
        <div className="bg-neutral-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Fulfillment Status: <strong className="text-emerald-400 uppercase">{order.orderStatus}</strong></span>
          </div>
          {order.trackingNumber && (
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-300" />
              <span>Tracking: <strong>{order.trackingNumber}</strong></span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="p-6 divide-y divide-neutral-100">
          <h2 className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-4">
            Items in your shipment
          </h2>

          {order.items.map((item) => (
            <div key={item.sku} className="py-4 flex items-center gap-4">
              <div className="relative w-16 h-20 bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-neutral-900 uppercase font-sans truncate">
                  {item.name}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Color: {item.color} | Size: {item.size}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  SKU: {item.sku} × {item.quantity}
                </p>
              </div>

              <div className="text-xs font-bold text-black text-right">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Address and Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-neutral-50 border-t border-neutral-200 text-xs">
          <div>
            <h3 className="font-bold uppercase text-neutral-900 tracking-wider flex items-center gap-1.5 mb-2">
              <MapPin className="w-4 h-4 text-neutral-700" />
              Delivery Address
            </h3>
            <div className="text-neutral-600 leading-relaxed font-sans text-xs">
              <p className="font-bold text-black">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="font-mono mt-1 text-neutral-500">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200">
              <span className="font-bold uppercase text-neutral-700 block mb-1">Payment Method:</span>
              <span className="uppercase text-neutral-900 font-bold bg-white px-2.5 py-1 border border-neutral-300 rounded inline-block text-[11px]">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-neutral-200 md:pl-6 pt-4 md:pt-0">
            <h3 className="font-bold uppercase text-neutral-900 tracking-wider mb-2">
              Receipt Breakdown
            </h3>
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.couponCode || "PROMO"})</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-black pt-3 border-t border-neutral-300">
              <span>Total Paid</span>
              <div className="text-right">
                <div>{formatPrice(order.total)}</div>
                <div className="text-[11px] text-neutral-500 font-normal">
                  ≈ ৳{(order.total * 120).toLocaleString()} BDT
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 border border-neutral-300 text-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 flex items-center justify-center gap-2 rounded-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Receipt</span>
        </button>

        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 flex items-center justify-center gap-2 rounded-xs"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
