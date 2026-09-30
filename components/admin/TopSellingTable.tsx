"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Box } from "lucide-react";

interface TopSellingTableProps {
  topItems: {
    productId: string;
    name: string;
    image: string;
    salesCount: number;
    revenue: number;
  }[];
}

export default function TopSellingTable({ topItems }: TopSellingTableProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-800">
            TOP SELLING ITEMS
          </h3>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            Ranked by actual sales volume
          </p>
        </div>
      </div>

      <div className="mt-4">
        {topItems.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2 text-neutral-400">
              <Box className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono font-bold text-neutral-700">No Items Sold Yet</p>
            <p className="text-[11px] font-mono text-neutral-400 mt-1 max-w-xs">
              Rankings will appear dynamically once products are purchased.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 font-mono text-xs">
            {topItems.map((item, index) => (
              <div key={item.productId} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-neutral-400 w-4 text-center">
                    #{index + 1}
                  </span>
                  <div className="relative w-10 h-12 bg-neutral-100 rounded overflow-hidden flex-shrink-0 border border-neutral-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate max-w-[160px]">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-neutral-500">
                      {item.salesCount} units ordered
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-bold text-black block">
                    {formatPrice(item.revenue)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Live Volume
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
