"use client";

import React, { useState, useEffect } from "react";
import { Coupon } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Plus, Tag, Check, Trash2 } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountVal, setDiscountVal] = useState(10);
  const [minOrder, setMinOrder] = useState(50);

  useEffect(() => {
    fetch("/api/coupons")
      .then((res) => res.json())
      .then((data) => {
        if (data.coupons) setCoupons(data.coupons);
      })
      .catch(() => {});
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.toUpperCase(),
          discountType,
          discountValue: discountVal,
          minOrderValue: minOrder,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons([data.coupon, ...coupons]);
        setShowAdd(false);
        setNewCode("");
      }
    } catch {
      alert("Error adding coupon");
    }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
            Marketing & Coupons
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Create campaign promo codes, set minimum checkout thresholds, and monitor redemptions
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-md flex items-center gap-2 self-start shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coupons.map((c) => (
          <div
            key={c._id}
            className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-black tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                {c.code}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">
                Active
              </span>
            </div>

            <div className="text-xs text-neutral-600 space-y-1">
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-bold text-black">
                  {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Min Order:</span>
                <span>${c.minOrderValue || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Redemptions:</span>
                <span className="font-bold text-emerald-600">{c.usageCount} times</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to add coupon */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-between justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-base font-black font-sans uppercase">Create Promo Coupon</h2>
              <button onClick={() => setShowAdd(false)} className="text-neutral-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={discountVal}
                    onChange={(e) => setDiscountVal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Minimum Order ($)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-neutral-300 rounded uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded uppercase font-bold"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
