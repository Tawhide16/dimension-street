"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../shared/Logo";
import { useCart } from "@/lib/cartContext";
import { ShoppingCart, Heart, User, Search } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { itemCount, openCart, wishlist } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Small threshold to avoid micro-jitter
      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        if (currentScrollY <= 20) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
          // Scrolling down: slide up and hide smoothly
          setIsVisible(false);
          setMenuOpen(false);
        } else if (currentScrollY < lastScrollY.current) {
          // Scrolling up: slide down smoothly
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Smooth hover handlers
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHasInteracted(true);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 100);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-transparent border-b border-transparent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-20 sm:h-22 relative">
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <Logo size="lg" />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 relative">
            {/* Desktop Capsule: Only for Desktop (Exact same border radius & height as Menu pill, hover-only icon background) */}
            <div className="hidden md:flex items-center bg-[#1c1c1c] px-1.5 h-11 rounded-[22px] border border-white/10 shadow-sm gap-1 shrink-0">
              {/* 1. Cart Button */}
              <button
                type="button"
                onClick={openCart}
                className="group relative w-10 h-9 bg-transparent hover:bg-white/12 text-white rounded-[12px] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                aria-label="Shopping Cart"
                title="Cart"
              >
                <ShoppingCart className="w-[18px] h-[18px] text-white transition-transform group-hover:scale-105" />
                {/* Overlapping circular badge */}
                <span className="absolute -top-1 -right-1 bg-[#dfdfdf] text-[#1a1a1a] text-[10px] font-bold font-mono min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs border border-white/60">
                  {itemCount}
                </span>
              </button>

              {/* 2. Wishlist Button */}
              <Link
                href="/account/wishlist"
                className="group relative w-10 h-9 bg-transparent hover:bg-white/12 text-white rounded-[12px] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart className="w-[18px] h-[18px] text-white transition-transform group-hover:scale-105" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold font-mono min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* 3. User Account Button */}
              <Link
                href="/account"
                className="group relative w-10 h-9 bg-transparent hover:bg-white/12 text-white rounded-[12px] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                aria-label="Account"
                title="My Account"
              >
                <User className="w-[18px] h-[18px] text-white transition-transform group-hover:scale-105" />
              </Link>

              {/* 4. Search Button */}
              <Link
                href="/search"
                className="group relative w-10 h-9 bg-transparent hover:bg-white/12 text-white rounded-[12px] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                aria-label="Search"
                title="Search Store"
              >
                <Search className="w-[18px] h-[18px] text-white transition-transform group-hover:scale-105" />
              </Link>
            </div>

            {/* Mobile Only: Single Cart Button (md:hidden, rounded-full) */}
            <button
              type="button"
              onClick={openCart}
              className="md:hidden group relative w-11 h-11 bg-[#1c1c1c] hover:bg-black text-white rounded-full border border-white/10 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-[19px] h-[19px] text-white transition-transform group-hover:scale-105" />
              <span className="absolute -top-1 -right-1 bg-[#dfdfdf] text-[#1a1a1a] text-[10px] font-bold font-mono min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs border border-white/60">
                {itemCount}
              </span>
            </button>

            {/* 2. Menu Pill & Smooth Rolling Shutter Container (Exact same rounded-full border radius & h-11) */}
            <div
              className="relative w-[195px] sm:w-[205px] h-11 shrink-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Shutter Container: Fixed constant 22px border-radius eliminates circle distortion during expansion */}
              <div
                className={`absolute top-0 left-0 w-full bg-[#1c1c1c] text-white overflow-hidden rounded-[22px] transition-[height,box-shadow] duration-700 ease-[cubic-bezier(0.25,1,0.35,1)] border border-white/10 z-50 ${
                  menuOpen
                    ? "h-[365px] md:h-[220px] shadow-2xl"
                    : "h-11 shadow-xs cursor-pointer"
                }`}
              >
                {/* Top Header Row (Always 44px height, stationary like a shutter top) */}
                <div
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="h-11 px-5 flex items-center justify-between shrink-0 cursor-pointer select-none"
                >
                  <span className="text-[#9e9e9e] font-bold text-[15px] sm:text-base tracking-tight">
                    Menu
                  </span>

                  {/* Morphing dots: when hovered, they slide together to merge into 1 center dot, then split horizontally into 2 dots */}
                  <div className="relative w-5 h-5 flex items-center justify-center pointer-events-none">
                    {/* Dot 1 */}
                    <span
                      className={`absolute w-[5px] h-[5px] bg-white rounded-full ${
                        !hasInteracted
                          ? "-translate-y-1"
                          : menuOpen
                          ? "animate-dot-to-horiz-1"
                          : "animate-dot-to-vert-1"
                      }`}
                    />

                    {/* Dot 2 */}
                    <span
                      className={`absolute w-[5px] h-[5px] bg-white rounded-full ${
                        !hasInteracted
                          ? "translate-y-1"
                          : menuOpen
                          ? "animate-dot-to-horiz-2"
                          : "animate-dot-to-vert-2"
                      }`}
                    />
                  </div>
                </div>

                {/* Shutter Rolling Links: Home, Shop All, Contact, About (Desktop) + Cart, Wishlist, Account, Search (Mobile) */}
                <div
                  className={`px-5 pb-4 pt-1 overflow-y-auto max-h-[315px] md:max-h-[170px] custom-menu-scroll transition-all duration-500 ease-out ${
                    menuOpen
                      ? "opacity-100 translate-y-0 delay-100"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <nav className="flex flex-col items-center space-y-1.5 py-1 text-center">
                    {/* 1. Home */}
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className={`text-[15px] sm:text-[16px] tracking-wide transition-colors py-1 ${
                        pathname === "/" ? "text-white font-bold" : "text-neutral-200 hover:text-white font-medium"
                      }`}
                    >
                      Home
                    </Link>

                    {/* 2. Shop All */}
                    <Link
                      href="/shop"
                      onClick={() => setMenuOpen(false)}
                      className={`text-[15px] sm:text-[16px] tracking-wide transition-colors py-1 ${
                        pathname === "/shop" ? "text-white font-bold" : "text-neutral-200 hover:text-white font-medium"
                      }`}
                    >
                      Shop All
                    </Link>

                    {/* 3. Contact */}
                    <Link
                      href="/contact"
                      onClick={() => setMenuOpen(false)}
                      className={`text-[15px] sm:text-[16px] tracking-wide transition-colors py-1 ${
                        pathname === "/contact" ? "text-white font-bold" : "text-neutral-200 hover:text-white font-medium"
                      }`}
                    >
                      Contact
                    </Link>

                    {/* 4. About */}
                    <Link
                      href="/about"
                      onClick={() => setMenuOpen(false)}
                      className={`text-[15px] sm:text-[16px] tracking-wide transition-colors py-1 ${
                        pathname === "/about" ? "text-white font-bold" : "text-neutral-200 hover:text-white font-medium"
                      }`}
                    >
                      About
                    </Link>

                    {/* Mobile Only: Cart, Wishlist, Account, Search */}
                    <div className="md:hidden flex flex-col items-center space-y-1.5 pt-2 border-t border-white/10 w-full mt-1.5">
                      {/* Cart */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          openCart();
                        }}
                        className="flex items-center justify-center gap-2 text-[15px] tracking-wide text-neutral-200 hover:text-white font-medium py-1 transition-colors w-full cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4 text-white/80" />
                        <span>Cart {itemCount > 0 ? `(${itemCount})` : ""}</span>
                      </button>

                      {/* Wishlist */}
                      <Link
                        href="/account/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 text-[15px] tracking-wide text-neutral-200 hover:text-white font-medium py-1 transition-colors w-full"
                      >
                        <Heart className="w-4 h-4 text-white/80" />
                        <span>Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ""}</span>
                      </Link>

                      {/* Account */}
                      <Link
                        href="/account"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 text-[15px] tracking-wide text-neutral-200 hover:text-white font-medium py-1 transition-colors w-full"
                      >
                        <User className="w-4 h-4 text-white/80" />
                        <span>Account</span>
                      </Link>

                      {/* Search */}
                      <Link
                        href="/search"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 text-[15px] tracking-wide text-neutral-200 hover:text-white font-medium py-1 transition-colors w-full"
                      >
                        <Search className="w-4 h-4 text-white/80" />
                        <span>Search</span>
                      </Link>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
