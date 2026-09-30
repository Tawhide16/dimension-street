"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { useCart } from "@/lib/cartContext";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Trash2, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, isFreeShipping } = useCart();

  const shippingCost = isFreeShipping || items.length === 0 ? 0 : 15;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        <h1 className="text-3xl font-black font-mono uppercase tracking-tight mb-8">
          Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 border border-neutral-200 rounded">
            <p className="text-xs font-mono uppercase text-neutral-500 mb-4">
              Your bag is currently empty.
            </p>
            <Link
              href="/shop"
              className="px-6 py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest"
            >
              Discover New Drops
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 divide-y divide-neutral-200">
              {items.map((item) => (
                <div key={item.sku} className="py-6 flex gap-6 items-center">
                  <div className="relative w-24 h-28 bg-neutral-100 rounded overflow-hidden flex-shrink-0 border border-neutral-200">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold uppercase">{item.name}</h3>
                    <p className="text-xs font-mono text-neutral-500 mt-1">
                      {item.color} / {item.size} • SKU: {item.sku}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-neutral-300 rounded font-mono text-xs">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="px-2.5 py-1"
                        >
                          -
                        </button>
                        <span className="px-3 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="px-2.5 py-1"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.sku)}
                        className="text-neutral-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-mono font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 bg-neutral-50 p-6 border border-neutral-200 rounded font-mono text-xs space-y-4 h-fit">
              <h3 className="font-bold text-sm uppercase tracking-wider">Summary</h3>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-black pt-3 border-t border-neutral-300">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Link
                href="/checkout"
                className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
