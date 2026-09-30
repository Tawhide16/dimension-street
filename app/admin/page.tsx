import React from "react";
import MetricCard from "@/components/admin/MetricCard";
import RevenueTrendChart from "@/components/admin/RevenueTrendChart";
import LiveOrdersTable from "@/components/admin/LiveOrdersTable";
import TopSellingTable from "@/components/admin/TopSellingTable";
import { getAdminAnalytics } from "@/lib/dataService";
import { formatPrice } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: "7D" | "30D" | "ALL" }>;
}) {
  const { period = "ALL" } = await searchParams;
  const analytics = await getAdminAnalytics(period);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Title & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
              Live Selling Dashboard
            </h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Real-time storefront checkout analytics. No dummy/mock numbers.
          </p>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-1 text-xs font-mono font-bold shadow-2xs">
          <a
            href="/admin?period=7D"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              period === "7D" ? "bg-black text-white" : "text-neutral-600 hover:text-black"
            }`}
          >
            7D
          </a>
          <a
            href="/admin?period=30D"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              period === "30D" ? "bg-black text-white" : "text-neutral-600 hover:text-black"
            }`}
          >
            30D
          </a>
          <a
            href="/admin?period=ALL"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              period === "ALL" ? "bg-black text-white" : "text-neutral-600 hover:text-black"
            }`}
          >
            ALL TIME
          </a>
        </div>
      </div>

      {/* 6 Metric KPI Cards (matching reference screenshot) */}
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
          badgeText={`${analytics.recentOrders.filter(o => o.orderStatus === "Delivered").length} delivered`}
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
          <LiveOrdersTable initialOrders={analytics.recentOrders} />
        </div>
        <div className="lg:col-span-4">
          <TopSellingTable topItems={analytics.topSelling} />
        </div>
      </div>
    </div>
  );
}
