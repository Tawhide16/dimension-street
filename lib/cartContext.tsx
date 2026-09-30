"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { OrderItem } from "@/types";

export interface CartItem extends OrderItem {}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  isFreeShipping: boolean;
  couponCode: string;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("dimension_cart");
      if (savedCart) setItems(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem("dimension_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedCoupon = localStorage.getItem("dimension_coupon");
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        setCouponCode(parsed.code || "");
        setDiscountPercent(parsed.percent || 0);
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("dimension_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("dimension_wishlist", JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku);
      if (existing) {
        return prev.map((i) =>
          i.sku === item.sku ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.sku === sku ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode("");
    setDiscountPercent(0);
    localStorage.removeItem("dimension_cart");
    localStorage.removeItem("dimension_coupon");
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingThreshold = 150;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const isFreeShipping = subtotal >= freeShippingThreshold;

  const discountAmount = Math.round((subtotal * discountPercent) / 100);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: "Please enter a code" };

    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(clean)}&subtotal=${subtotal}`);
      const data = await res.json();
      if (data.valid) {
        setCouponCode(clean);
        setDiscountPercent(data.coupon.discountValue || 10);
        localStorage.setItem(
          "dimension_coupon",
          JSON.stringify({ code: clean, percent: data.coupon.discountValue || 10 })
        );
        return { success: true, message: `Coupon ${clean} applied!` };
      } else {
        return { success: false, message: data.message || "Invalid coupon code" };
      }
    } catch {
      // Local fallback
      if (clean === "WELCOME10") {
        setCouponCode("WELCOME10");
        setDiscountPercent(10);
        return { success: true, message: "10% Welcome discount applied!" };
      }
      if (clean === "DIMENSION20") {
        setCouponCode("DIMENSION20");
        setDiscountPercent(20);
        return { success: true, message: "20% Streetwear VIP discount applied!" };
      }
      return { success: false, message: "Invalid coupon" };
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscountPercent(0);
    localStorage.removeItem("dimension_coupon");
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        freeShippingThreshold,
        freeShippingProgress,
        isFreeShipping,
        couponCode,
        discountAmount,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
