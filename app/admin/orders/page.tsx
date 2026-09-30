import React from "react";
import LiveOrdersTable from "@/components/admin/LiveOrdersTable";
import { getOrders } from "@/lib/dataService";
import { formatPrice } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing" || o.orderStatus === "Packed"
  ).length;

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
            Orders & Shipping Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track customer checkouts, dispatch courier shipments, and update fulfillment statuses
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-neutral-200 text-xs">
          <div>
            <span className="text-neutral-400 block text-[10px]">TOTAL DISPATCHED</span>
            <span className="font-bold text-black">{formatPrice(totalSales)}</span>
          </div>
          <div className="border-l border-neutral-200 pl-4">
            <span className="text-neutral-400 block text-[10px]">PENDING FULFILLMENT</span>
            <span className="font-bold text-amber-600">{pendingOrders} orders</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <LiveOrdersTable initialOrders={orders} />
    </div>
  );
}
