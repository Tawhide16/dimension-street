"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "../shared/Logo";
import { useCart } from "@/lib/cartContext";
import { useNavigation } from "@/lib/useNavigation";
import { ShoppingCart, Heart, User, Search } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { itemCount, openCart, wishlist } = useCart();
  const { config } = useNavigation();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (config?.sticky === false) {
      setIsVisible(true);
      return;
    }

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
  }, [config?.sticky]);

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

  const activeItems = (config?.items || []).filter((it) => it.isActive !== false);

  return (
    <header
      className={`${
        config?.sticky !== false ? "sticky top-0" : "relative"
      } z-50 w-full bg-transparent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-20 relative">
          {/* Left: Brand Logo (Dynamic based on Navigation Config) */}
          <div className="flex items-center">
            {config?.logoType === "text" ? (
              <Link
                href="/"
                className="font-mono font-black text-xl sm:text-2xl tracking-tighter text-black uppercase hover:opacity-80 transition-opacity"
              >
                {config?.logoText || "DIMENSION STREET"}
              </Link>
            ) : config?.logoImageUrl && config.logoImageUrl !== "/images/logo.png" ? (
              <Link
                href="/"
                className="inline-flex items-center select-none transition-transform hover:scale-[1.03] active:scale-95"
                aria-label="Storefront Logo"
              >
                <div className="relative h-12 sm:h-16 lg:h-18 w-auto min-w-[90px] sm:min-w-[120px] max-w-[150px] sm:max-w-[220px] flex items-center">
                  <Image
                    src={config.logoImageUrl}
                    alt={config.logoText || "DIMENSION STREET"}
                    width={220}
                    height={72}
                    className="h-full w-auto object-contain"
                    unoptimized
                    priority
                  />
                </div>
              </Link>
            ) : (
              <Logo size="lg" />
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative mr-1 sm:mr-0">
            {/* Desktop Capsule: Only for Desktop (Exact same border radius & height as Menu pill) */}
            {(config?.showCart !== false ||
              config?.showWishlist !== false ||
              config?.showAccount !== false ||
              config?.showSearch !== false) && (
              <div className="hidden md:flex items-center bg-[#1c1c1c] px-1.5 h-11 rounded-[22px] border border-white/10 shadow-sm gap-1 shrink-0">
                {/* 1. Cart Button */}
                {config?.showCart !== false && (
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
                )}

                {/* 2. Wishlist Button */}
                {config?.showWishlist !== false && (
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
                )}

                {/* 3. User Account Button */}
                {config?.showAccount !== false && (
                  <Link
                    href="/account"
                    className="group relative w-10 h-9 bg-transparent hover:bg-white/12 text-white rounded-[12px] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                    aria-label="Account"
                    title={currentUser ? `Account (${currentUser.name})` : "My Account"}
                  >
                    <User className="w-[18px] h-[18px] text-white transition-transform group-hover:scale-105" />
                    {currentUser && (
                      <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full border border-black shadow-xs animate-pulse"
                        title={`Signed in as ${currentUser.name}`}
                      />
                    )}
                  </Link>
                )}

                {/* 4. Search Button */}
                {config?.showSearch !== false && (
                  <Link
                    href="/search"
                    className="group relative w-10 h-9 bg-transparent hover:bg-white/12 text-white rounded-[12px] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                    aria-label="Search"
                    title="Search Store"
                  >
                    <Search className="w-[18px] h-[18px] text-white transition-transform group-hover:scale-105" />
                  </Link>
                )}
              </div>
            )}

            {/* Mobile Only: Single Cart Button (md:hidden, rounded-full) */}
            {config?.showCart !== false && (
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
            )}

            {/* 2. Menu Pill & Smooth Rolling Shutter Container */}
            <div
              className="relative w-[130px] sm:w-[205px] h-11 shrink-0 mr-1 sm:mr-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Shutter Container */}
              <div
                className={`absolute top-0 right-0 ${
                  menuOpen ? "w-[210px] sm:w-full" : "w-full"
                } bg-[#1c1c1c] text-white overflow-hidden rounded-[22px] transition-[height,width,box-shadow] duration-700 ease-[cubic-bezier(0.25,1,0.35,1)] border border-white/10 z-50 ${
                  menuOpen
                    ? "h-[380px] md:h-[260px] shadow-2xl"
                    : "h-11 shadow-xs cursor-pointer"
                }`}
              >
                {/* Top Header Row (Stationary 44px pill row) */}
                <div
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="h-11 px-4 sm:px-5 flex items-center justify-between shrink-0 cursor-pointer select-none"
                >
                  <span className="text-[#9e9e9e] font-bold text-sm sm:text-base tracking-tight">
                    {config?.menuPillLabel || "Menu"}
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

                {/* Shutter Rolling Dynamic Links */}
                <div
                  className={`px-5 pb-4 pt-1 overflow-y-auto max-h-[330px] md:max-h-[210px] custom-menu-scroll transition-all duration-500 ease-out ${
                    menuOpen
                      ? "opacity-100 translate-y-0 delay-100"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <nav className="flex flex-col items-center space-y-1.5 py-1 text-center">
                    {activeItems.map((item) => {
                      const isCurrent = pathname === item.href;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          target={item.isExternal ? "_blank" : undefined}
                          rel={item.isExternal ? "noopener noreferrer" : undefined}
                          onClick={() => setMenuOpen(false)}
                          className={`group flex items-center justify-center gap-1.5 text-[15px] sm:text-[16px] tracking-wide transition-colors py-1 ${
                            isCurrent
                              ? "text-white font-bold"
                              : "text-neutral-200 hover:text-white font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded uppercase text-white shadow-xs ${
                                item.badgeColor || "bg-rose-500"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}

                    {/* Mobile Only: Cart, Wishlist, Account, Search */}
                    <div className="md:hidden flex flex-col items-center space-y-1.5 pt-2 border-t border-white/10 w-full mt-1.5">
                      {config?.showCart !== false && (
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
                      )}

                      {config?.showWishlist !== false && (
                        <Link
                          href="/account/wishlist"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-center gap-2 text-[15px] tracking-wide text-neutral-200 hover:text-white font-medium py-1 transition-colors w-full"
                        >
                          <Heart className="w-4 h-4 text-white/80" />
                          <span>Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ""}</span>
                        </Link>
                      )}

                      {config?.showAccount !== false && (
                        <Link
                          href="/account"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-center gap-2 text-[15px] tracking-wide text-neutral-200 hover:text-white font-medium py-1 transition-colors w-full"
                        >
                          <User className="w-4 h-4 text-white/80" />
                          <span>{currentUser ? `Account (${currentUser.name})` : "Account"}</span>
                          {currentUser && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                        </Link>
                      )}

                      {config?.showSearch !== false && (
                        <Link
                          href="/search"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-center gap-2 text-[15px] tracking-wide text-neutral-200 hover:text-white font-medium py-1 transition-colors w-full"
                        >
                          <Search className="w-4 h-4 text-white/80" />
                          <span>Search</span>
                        </Link>
                      )}
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
