"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Activity } from "lucide-react";

interface RevenueTrendChartProps {
  trendData: {
    date: string;
    amount: number;
    orders: number;
  }[];
}

export default function RevenueTrendChart({ trendData }: RevenueTrendChartProps) {
  const hasData = trendData && trendData.length > 0 && trendData.some((d) => d.amount > 0);
  const maxAmount = hasData ? Math.max(...trendData.map((d) => d.amount), 100) : 100;

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-800 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            LIVE REVENUE TREND
          </h3>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            Storefront order volume & income tracking
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-medium rounded-full self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Cloud Connected</span>
        </div>
      </div>

      {/* Chart Canvas / Empty State */}
      <div className="pt-6 min-h-[220px] flex items-center justify-center">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center text-center py-10 max-w-md">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3 text-neutral-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold uppercase font-mono text-neutral-700 mb-1">
              No Sales Recorded Yet
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
              As soon as a customer completes checkout on the storefront (via bKash, Nagad, or Cash on Delivery), the real-time revenue curve will render here automatically.
            </p>
          </div>
        ) : (
          <div className="w-full">
            {/* Simple Dynamic SVG Area Graph */}
            <div className="relative h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-neutral-100">
              {trendData.map((point, idx) => {
                const heightPercent = Math.max(10, Math.round((point.amount / maxAmount) * 100));
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] font-mono py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                      {formatPrice(point.amount)} ({point.orders} orders)
                    </div>

                    <div
                      className="w-full bg-emerald-500/80 hover:bg-emerald-600 transition-all rounded-t-sm"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-mono text-neutral-400 mt-2 truncate w-full text-center">
                      {point.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
