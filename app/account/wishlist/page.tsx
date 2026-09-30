"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { useCart } from "@/lib/cartContext";
import { Product } from "@/types";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setAllProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const savedProducts = allProducts.filter((p) => wishlist.includes(p._id));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-neutral-200">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
              SAVED PIECES
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">
              MY WISHLIST ({savedProducts.length})
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-xs font-mono font-bold uppercase underline text-neutral-600 hover:text-black"
          >
            Explore More
          </Link>
        </div>

        {savedProducts.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 border border-neutral-200 rounded-xs">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-mono font-bold uppercase text-neutral-800">
              Your wishlist is empty
            </h3>
            <p className="text-xs text-neutral-500 font-mono mt-1 mb-6 max-w-xs mx-auto">
              Tap the heart icon on any product in our catalog to save items here for later.
            </p>
            <Link
              href="/shop"
              className="px-6 py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
