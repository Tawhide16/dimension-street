"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  Heart,
  MapPin,
  ArrowRight,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  ExternalLink,
} from "lucide-react";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";

interface AccountDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  orders: Order[];
}

export default function AccountDashboard({ user, orders }: AccountDashboardProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  // Get initials for profile badge
  const getInitials = (name: string) => {
    if (!name) return "DS";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Latest address from recent order or default
  const latestOrderWithAddress = orders.find((o) => o.shippingAddress?.street);
  const primaryAddress = latestOrderWithAddress?.shippingAddress;

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3 h-3" />
          <span>Delivered</span>
        </span>
      );
    }
    if (s === "shipped") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3 h-3" />
          <span>In Transit / Shipped</span>
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3" />
        <span>{status || "Processing"}</span>
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-neutral-200 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg font-mono tracking-wider shadow-sm">
            {getInitials(user.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                CUSTOMER ACCOUNT // DIMENSION CLUB
              </span>
              <span className="px-2 py-0.2 bg-neutral-100 text-neutral-700 text-[9px] font-mono font-bold uppercase rounded">
                Verified
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase text-neutral-900 tracking-tight mt-0.5">
              {user.name}
            </h1>
            <p className="text-xs font-mono text-neutral-500 mt-0.5">
              {user.email} {user.phone ? `• ${user.phone}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/account/wishlist"
            className="px-4 py-2 border border-neutral-300 text-xs font-mono font-bold uppercase rounded-lg hover:border-black flex items-center gap-1.5 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 text-neutral-600" />
            <span>Wishlist</span>
          </Link>

          <Link
            href="/shop"
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>

      {/* Account Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Your Orders (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Your Orders ({orders.length})</span>
            </h2>
            <span className="text-2xs font-mono text-neutral-500">
              Only showing orders registered under your email
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 px-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-mono text-xs">
              <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-neutral-900 font-bold uppercase mb-1">
                No orders placed yet
              </p>
              <p className="text-neutral-500 max-w-sm mx-auto mb-5 leading-relaxed font-sans text-xs">
                When you purchase heavyweight streetwear items using{" "}
                <span className="font-semibold text-black">{user.email}</span>,
                they will be recorded and trackable here.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-5 border border-neutral-200 rounded-xl font-mono text-xs space-y-4 bg-white hover:border-neutral-400 transition-colors shadow-2xs"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-black text-sm">
                        {ord.orderNumber}
                      </span>
                      <span className="text-neutral-400 text-xs">
                        • {formatDate(ord.createdAt)}
                      </span>
                    </div>
                    <div>{getStatusBadge(ord.orderStatus)}</div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {ord.items.map((i) => (
                      <div
                        key={i.sku || i.productId}
                        className="flex items-center justify-between gap-3 text-neutral-700 py-1"
                      >
                        <div className="flex items-center gap-3">
                          {i.image && (
                            <div className="w-12 h-12 relative bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                              <Image
                                src={i.image}
                                alt={i.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-neutral-900 font-sans text-xs">
                              {i.name}
                            </p>
                            <p className="text-2xs text-neutral-500 font-mono mt-0.5">
                              Color: {i.color || "Standard"} • Size: {i.size || "M"} • Qty:{" "}
                              {i.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-neutral-900 shrink-0">
                          {formatPrice(i.price * i.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping & Payment Meta */}
                  <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-neutral-600 bg-neutral-50/70 p-3 rounded-lg">
                    <div>
                      <span className="text-neutral-400 font-bold uppercase block text-[9px]">
                        Payment Method
                      </span>
                      <span className="font-semibold uppercase text-neutral-800">
                        {ord.paymentMethod === "bkash"
                          ? "bKash Digital Payment"
                          : ord.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : ord.paymentMethod}
                      </span>{" "}
                      ({ord.paymentStatus})
                    </div>
                    {ord.trackingNumber && (
                      <div>
                        <span className="text-neutral-400 font-bold uppercase block text-[9px]">
                          Tracking Number
                        </span>
                        <span className="font-bold text-black">{ord.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Summary Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 font-bold text-black">
                    <div>
                      <span className="text-neutral-500 font-normal text-xs mr-2">
                        Total Amount:
                      </span>
                      <span className="text-sm font-black">{formatPrice(ord.total)}</span>
                    </div>

                    <Link
                      href={`/checkout/success?orderId=${ord._id}`}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white rounded-md text-neutral-800 flex items-center gap-1.5 text-2xs font-mono font-bold uppercase transition-all"
                    >
                      <span>Digital Receipt</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Primary Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Delivery Address</span>
              </h2>
            </div>

            {primaryAddress ? (
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs space-y-1.5 leading-relaxed">
                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                  Default Shipping Address
                </span>
                <p className="font-bold text-black">{primaryAddress.fullName || user.name}</p>
                <p className="text-neutral-700">{primaryAddress.street}</p>
                <p className="text-neutral-700">
                  {primaryAddress.city} {primaryAddress.postalCode ? `- ${primaryAddress.postalCode}` : ""},{" "}
                  {primaryAddress.country || "Bangladesh"}
                </p>
                <p className="text-neutral-500 pt-1 font-mono text-2xs">
                  Phone: {primaryAddress.phone || user.phone || "Not specified"}
                </p>
              </div>
            ) : (
              <div className="p-5 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl font-mono text-xs text-neutral-500 space-y-2">
                <p>No shipping address registered yet.</p>
                <p className="text-2xs font-sans">
                  Your address will automatically save to your account when you place your first order.
                </p>
              </div>
            )}
          </div>

          {/* Customer Care info */}
          <div className="p-5 border border-neutral-200 rounded-xl space-y-2 text-xs font-mono">
            <h3 className="font-bold uppercase text-neutral-900">Need Help with an Order?</h3>
            <p className="text-neutral-500 font-sans text-xs">
              Reach our Dhaka customer concierge for exchange, sizing queries, or parcel tracking assistance.
            </p>
            <div className="pt-2 text-2xs space-y-1 text-neutral-700">
              <p>📍 Banani, Dhaka 1213</p>
              <p>✉️ support@dimensionstreet.com</p>
              <p>📞 +880 1711 000000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
