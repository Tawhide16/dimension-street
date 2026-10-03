"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import MetricCard from "@/components/admin/MetricCard";
import RevenueTrendChart from "@/components/admin/RevenueTrendChart";
import LiveOrdersTable from "@/components/admin/LiveOrdersTable";
import TopSellingTable from "@/components/admin/TopSellingTable";
import { AdminAnalytics } from "@/types";
import { formatPrice } from "@/lib/utils";
import { RefreshCw, Radio, CheckCircle2, Pause, Play, Sparkles } from "lucide-react";

interface RealtimeDashboardProps {
  initialAnalytics: AdminAnalytics;
  initialPeriod: "7D" | "30D" | "ALL";
}

export default function RealtimeDashboard({
  initialAnalytics,
  initialPeriod,
}: RealtimeDashboardProps) {
  const [period, setPeriod] = useState<"7D" | "30D" | "ALL">(initialPeriod);
  const [analytics, setAnalytics] = useState<AdminAnalytics>(initialAnalytics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [newOrderNotice, setNewOrderNotice] = useState<string | null>(null);

  const prevOrdersCount = useRef(initialAnalytics.totalOrders);

  // Fetch updated analytics
  const fetchAnalytics = useCallback(async (currentPeriod = period, isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${currentPeriod}&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analytics) {
          // Check if new orders arrived
          if (data.analytics.totalOrders > prevOrdersCount.current) {
            const diff = data.analytics.totalOrders - prevOrdersCount.current;
            setNewOrderNotice(`🎉 ${diff} new order${diff > 1 ? "s" : ""} placed just now!`);
            setTimeout(() => setNewOrderNotice(null), 6000);
          }
          prevOrdersCount.current = data.analytics.totalOrders;

          setAnalytics(data.analytics);
          setLastUpdated(new Date());
          setSecondsAgo(0);
        }
      }
    } catch (err) {
      console.warn("Real-time analytics fetch error:", err);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, [period]);

  // Handle period change
  const handlePeriodChange = (newPeriod: "7D" | "30D" | "ALL") => {
    setPeriod(newPeriod);
    fetchAnalytics(newPeriod, false);
  };

  // Real-time polling every 5 seconds when live is active
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      fetchAnalytics(period, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveActive, period, fetchAnalytics]);

  // Second counter for "Updated Xs ago"
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  return (
    <div suppressHydrationWarning className="w-full space-y-8 font-sans pb-16">
      {/* Top Title & Real-time Live Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              {isLiveActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isLiveActive ? "bg-emerald-500" : "bg-neutral-400"
                }`}
              />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
              Live Selling Dashboard
            </h1>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                isLiveActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-neutral-100 text-neutral-600 border border-neutral-200"
              }`}
            >
              <Radio className="w-3 h-3 text-emerald-600" />
              <span>{isLiveActive ? "Live Sync (5s)" : "Paused"}</span>
            </span>
          </div>

          <p className="text-xs text-neutral-500 font-mono mt-1">
            Real-time storefront checkout analytics. No dummy/mock numbers.
            <span className="ml-2 text-neutral-400">
              • Synced {secondsAgo === 0 ? "just now" : `${secondsAgo}s ago`}
            </span>
          </p>
        </div>

        {/* Live Controls & Period Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pause / Resume Auto-sync */}
          <button
            type="button"
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isLiveActive
                ? "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
            }`}
            title={isLiveActive ? "Pause auto-refresh" : "Resume auto-refresh"}
          >
            {isLiveActive ? (
              <>
                <Pause className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Resume</span>
              </>
            )}
          </button>

          {/* Manual Refresh Now */}
          <button
            type="button"
            onClick={() => fetchAnalytics(period, false)}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh analytics now"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-pink-400 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Syncing..." : "Sync Now"}</span>
          </button>

          {/* Timeframe Filter Pills */}
          <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => handlePeriodChange("7D")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                period === "7D"
                  ? "bg-white text-black font-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              7D
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange("30D")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                period === "30D"
                  ? "bg-white text-black font-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              30D
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange("ALL")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                period === "ALL"
                  ? "bg-white text-black font-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              ALL
            </button>
          </div>
        </div>
      </div>

      {/* New Order Toast Notification */}
      {newOrderNotice && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-900 text-xs font-mono rounded-xl flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
            <span className="font-bold text-sm">{newOrderNotice}</span>
          </div>
          <button
            onClick={() => setNewOrderNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 6 Metric KPI Cards (Live Real-Time Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. REAL-TIME REVENUE */}
        <MetricCard
          title="REAL-TIME REVENUE"
          value={formatPrice(analytics.revenue)}
          subValue={`৳${analytics.revenueBdt.toLocaleString()} BDT`}
          icon="dollar"
          iconColor="text-emerald-500"
          badgeText={`${analytics.totalOrders} real sales`}
          badgeColor="bg-emerald-50 text-emerald-700"
          footerText="Live checkout volume"
        />

        {/* 2. TOTAL ORDERS */}
        <MetricCard
          title="TOTAL ORDERS"
          value={analytics.totalOrders.toString()}
          subValue={`${analytics.pendingDispatch} pending dispatch`}
          icon="bag"
          iconColor="text-blue-500"
          badgeText={analytics.totalOrders === 0 ? "Awaiting 1st sale" : "Active Orders"}
          badgeColor="bg-neutral-100 text-neutral-700"
          footerText="Storefront checkouts"
        />

        {/* 3. ACTUAL CUSTOMERS */}
        <MetricCard
          title="ACTUAL CUSTOMERS"
          value={analytics.actualCustomers.toString()}
          subValue={`${analytics.verifiedBuyers} verified buyers`}
          icon="users"
          iconColor="text-purple-500"
          badgeText={`${analytics.actualCustomers} buyers`}
          badgeColor="bg-purple-50 text-purple-700"
          footerText="Unique consumer accounts"
        />

        {/* 4. ACTIVE CATALOG */}
        <MetricCard
          title="ACTIVE CATALOG"
          value={analytics.activeCatalogCount.toString()}
          subValue={`${analytics.outOfStockCount} out of stock`}
          icon="box"
          iconColor="text-amber-500"
          badgeText="In-stock inventory"
          badgeColor="bg-emerald-50 text-emerald-700"
          footerText="Milled streetwear styles"
        />

        {/* 5. FULFILLMENT RATE */}
        <MetricCard
          title="FULFILLMENT RATE"
          value={`${analytics.fulfillmentRate}%`}
          subValue={`${analytics.pendingDispatch} processing`}
          icon="trend"
          iconColor="text-cyan-500"
          badgeText={`${analytics.recentOrders.filter((o) => o.orderStatus === "Delivered").length} delivered`}
          badgeColor="bg-cyan-50 text-cyan-700"
          footerText="Doorstep delivery speed"
        />

        {/* 6. AVG. ORDER VALUE (AOV) */}
        <MetricCard
          title="AVG. ORDER VALUE (AOV)"
          value={formatPrice(analytics.averageOrderValue)}
          subValue={`৳${Math.round(analytics.averageOrderValue * 120).toLocaleString()} BDT`}
          icon="card"
          iconColor="text-rose-500"
          badgeText="Per checkout"
          badgeColor="bg-neutral-100 text-neutral-700"
          footerText="Basket yield analysis"
        />
      </div>

      {/* Revenue Trend Chart */}
      <RevenueTrendChart trendData={analytics.revenueTrend} />

      {/* Split Row: Live Customer Orders & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <LiveOrdersTable
            initialOrders={analytics.recentOrders}
            onStatusChange={() => {
              // Trigger a quiet re-fetch so metrics update after status change
              fetchAnalytics(period, true);
            }}
          />
        </div>
        <div className="lg:col-span-4">
          <TopSellingTable topItems={analytics.topSelling} />
        </div>
      </div>
    </div>
  );
}
