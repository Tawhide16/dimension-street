import React from "react";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-9 bg-neutral-900 w-full flex items-center justify-center">
        <div className="h-3 w-64 bg-neutral-800 rounded-full"></div>
      </div>

      {/* Header Skeleton */}
      <div className="h-20 border-b border-neutral-100 px-6 sm:px-12 flex items-center justify-between">
        <div className="h-6 w-36 bg-neutral-200 rounded"></div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
          <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
        {/* Breadcrumb / Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-neutral-300 rounded"></div>
            <div className="h-3 w-32 bg-neutral-200 rounded"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-28 bg-neutral-200 rounded"></div>
            <div className="h-9 w-36 bg-neutral-200 rounded"></div>
          </div>
        </div>

        {/* Catalog Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <div className="aspect-[3/4] w-full bg-neutral-200 rounded-none relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-20 bg-neutral-200 rounded"></div>
                <div className="h-4 w-3/4 bg-neutral-300 rounded"></div>
                <div className="h-4 w-16 bg-neutral-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
