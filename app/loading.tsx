import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-9 bg-neutral-900 w-full flex items-center justify-center">
        <div className="h-3 w-64 bg-neutral-800 rounded-full"></div>
      </div>

      {/* Header Skeleton */}
      <div className="h-20 border-b border-neutral-100 px-6 sm:px-12 flex items-center justify-between">
        <div className="h-6 w-36 bg-neutral-200 rounded"></div>
        <div className="hidden md:flex items-center gap-8">
          <div className="h-4 w-16 bg-neutral-200 rounded"></div>
          <div className="h-4 w-20 bg-neutral-200 rounded"></div>
          <div className="h-4 w-16 bg-neutral-200 rounded"></div>
          <div className="h-4 w-24 bg-neutral-200 rounded"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
          <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="w-full h-[65vh] min-h-[460px] max-h-[750px] bg-neutral-100 flex flex-col justify-end p-8 sm:p-16">
        <div className="max-w-xl space-y-4">
          <div className="h-4 w-28 bg-neutral-300 rounded"></div>
          <div className="h-12 sm:h-16 w-3/4 bg-neutral-300 rounded-lg"></div>
          <div className="h-4 w-full bg-neutral-200 rounded"></div>
          <div className="flex items-center gap-4 pt-4">
            <div className="h-12 w-36 bg-neutral-300 rounded-none"></div>
            <div className="h-12 w-36 bg-neutral-200 rounded-none"></div>
          </div>
        </div>
      </div>

      {/* Section Skeleton (New Arrivals) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-neutral-200">
          <div className="space-y-2">
            <div className="h-6 w-44 bg-neutral-300 rounded"></div>
            <div className="h-3 w-28 bg-neutral-200 rounded"></div>
          </div>
          <div className="h-4 w-20 bg-neutral-200 rounded"></div>
        </div>

        {/* 4 Cards Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <div className="aspect-[3/4] w-full bg-neutral-200 rounded-none relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-20 bg-neutral-200 rounded"></div>
                <div className="h-4 w-full bg-neutral-300 rounded"></div>
                <div className="h-4 w-16 bg-neutral-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
