import React from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { getOrders } from "@/lib/dataService";
import { formatPrice, formatDate } from "@/lib/utils";
import { User, Package, Heart, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function AccountPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-neutral-200 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg font-mono">
              RC
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                VIP MEMBER // DHAKA
              </span>
              <h1 className="text-2xl font-black uppercase text-neutral-900 tracking-tight">
                Rifat Chowdhury
              </h1>
              <p className="text-xs font-mono text-neutral-500">
                rifat.c@outlook.com • +880 1711 234567
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/account/wishlist"
              className="px-4 py-2 border border-neutral-300 text-xs font-mono font-bold uppercase rounded-xs hover:border-black flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Wishlist</span>
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-neutral-900 text-white text-xs font-mono font-bold uppercase rounded-xs hover:bg-black"
            >
              Switch to Admin CMS
            </Link>
          </div>
        </div>

        {/* Account Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Orders (col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Your Order History</span>
              </h2>
              <span className="text-xs font-mono text-neutral-500">{orders.length} Orders</span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 border border-neutral-200 rounded font-mono text-xs">
                <p className="text-neutral-500 mb-2">No orders placed yet.</p>
                <Link href="/shop" className="text-black font-bold underline">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-5 border border-neutral-200 rounded-xs font-mono text-xs space-y-3 hover:border-neutral-400 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                      <div>
                        <span className="font-bold text-black">{ord.orderNumber}</span>
                        <span className="text-neutral-400 ml-2">• {formatDate(ord.createdAt)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-100 text-neutral-800">
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items.map((i) => (
                        <div key={i.sku} className="flex justify-between text-neutral-600">
                          <span>
                            {i.name} ({i.color}/{i.size}) × {i.quantity}
                          </span>
                          <span>{formatPrice(i.price * i.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 font-bold text-black">
                      <span>Total: {formatPrice(ord.total)}</span>
                      <Link
                        href={`/checkout/success?orderId=${ord._id}`}
                        className="text-neutral-600 hover:text-black flex items-center gap-1 text-[11px]"
                      >
                        <span>View Receipt</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Addresses (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Primary Address</span>
              </h2>
            </div>

            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xs font-mono text-xs space-y-1.5 leading-relaxed">
              <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                Default Shipping Hub
              </span>
              <p className="font-bold text-black">Rifat Chowdhury</p>
              <p className="text-neutral-600">House 42, Road 11, Banani</p>
              <p className="text-neutral-600">Dhaka 1213, Bangladesh</p>
              <p className="text-neutral-500 pt-1">Phone: +880 1711 234567</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
