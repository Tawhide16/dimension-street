"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUp, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setJoined(true);
    setEmail("");
    setTimeout(() => setJoined(false), 3000);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-black text-white pt-16 pb-12 overflow-hidden border-t border-neutral-900">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Top Section: 5 Links Columns + 1 Newsletter Column */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-6 pb-16">
          {/* 1. SHOP */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tees" className="hover:text-white transition-colors">
                  T-shirts
                </Link>
              </li>
              <li>
                <Link href="/shop?category=hoodies" className="hover:text-white transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link href="/shop?category=sweaters" className="hover:text-white transition-colors">
                  Sweaters
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=last-sizes" className="hover:text-white transition-colors">
                  Last sizes
                </Link>
              </li>
              <li>
                <Link href="/collections/archive" className="hover:text-white transition-colors">
                  Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. BRAND */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              BRAND
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/about#behind-the-scenes" className="hover:text-white transition-colors">
                  Behind the scenes
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. ACCOUNT */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              ACCOUNT
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/collections/kaur" className="hover:text-white transition-colors">
                  Kaur Clo
                </Link>
              </li>
              <li>
                <Link href="/donations" className="hover:text-white transition-colors">
                  Donations
                </Link>
              </li>
              <li>
                <a
                  href="https://trustpilot.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 text-neutral-300"
                >
                  <span className="text-amber-400">★</span> 4.8 Trustpilot
                </a>
              </li>
            </ul>
          </div>

          {/* 4. SUPPORT */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              SUPPORT
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns / Exchanges
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* 5. COMMUNITY */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              COMMUNITY
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* 6. NEWSLETTER (RIGHT COLUMN) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-3 lg:border-l lg:border-neutral-800 lg:pl-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 leading-snug">
              JOIN THE COMMUNITY FOR EXCLUSIVE WELLNESS INSIGHTS
            </h4>

            {joined ? (
              <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-full flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                <Check className="w-4 h-4" />
                <span>WELCOME TO THE COMMUNITY</span>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-2.5">
                <input
                  type="email"
                  required
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full bg-white text-black px-5 py-3 text-xs placeholder:text-neutral-400 placeholder:uppercase font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-slide-white w-full rounded-full font-bold uppercase tracking-wider text-xs py-3 cursor-pointer text-center block shadow-sm border border-white hover:border-black"
                >
                  JOIN NOW
                </button>
              </form>
            )}

            <p className="text-[10px] text-neutral-400 mt-2.5 leading-tight">
              *By joining, you&apos;ll receive our wellness insights and can unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Massive White Wordmark */}
        <div className="py-6 sm:py-10 text-center select-none overflow-hidden">
          <h1 className="text-[13vw] sm:text-[14vw] font-black tracking-tight text-white leading-none uppercase">
            DIMENSION
          </h1>
        </div>

        {/* Boxed Mission Statement */}
        <div className="max-w-2xl mx-auto my-6 border border-white/30 px-6 sm:px-10 py-4 text-center">
          <p className="text-xs sm:text-[13px] text-neutral-200 font-normal leading-relaxed">
            Premium everyday clothing in heavyweight natural fabrics. A fictional label built as a
            conversion-focused ecommerce concept.
          </p>
        </div>

        {/* Copyright notice */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[11px] text-neutral-400">
            &copy; 2026 DIMENSION&reg; &mdash; fictional label for a conversion-focused ecommerce concept
          </p>
        </div>
      </div>

      {/* Floating Back to Top Button matching bottom-right of reference */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-6 right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black border border-white/30 text-white flex items-center justify-center hover:bg-neutral-900 hover:border-white transition-all shadow-lg z-40 cursor-pointer"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </footer>
  );
}
