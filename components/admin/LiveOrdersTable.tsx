"use client";

import React, { useState } from "react";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingBag, Eye, RefreshCw } from "lucide-react";

interface LiveOrdersTableProps {
  initialOrders: Order[];
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

export default function LiveOrdersTable({
  initialOrders,
  onStatusChange,
}: LiveOrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusColors: Record<OrderStatus, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Packed: "bg-purple-50 text-purple-700 border-purple-200",
    Shipped: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
    Returned: "bg-neutral-100 text-neutral-700 border-neutral-300",
    Refunded: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o))
        );
        if (onStatusChange) onStatusChange(orderId, status);
      }
    } catch {
      // Local fallback
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o))
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-800">
            LIVE CUSTOMER ORDERS
          </h3>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            Real purchases recorded directly from storefront
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
          {orders.length} Total
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        {orders.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-neutral-300 mb-2" />
            <p className="text-xs font-mono font-bold text-neutral-700">Awaiting Customer Checkouts</p>
            <p className="text-[11px] font-mono text-neutral-400 mt-1 max-w-sm">
              Your storefront is live. When a shopper places an order, their order items, address, and payment status will update here instantly.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-neutral-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-neutral-900">{order.customer.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate max-w-[130px]">
                      {order.customer.email}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-neutral-700">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} pcs
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-black">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase text-[10px] font-bold text-neutral-600">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value as OrderStatus)
                      }
                      className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                        statusColors[order.orderStatus] || "bg-neutral-100"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-neutral-400 text-[10px]">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-600 hover:text-black transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal / Quick View for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-xl p-6 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <span className="font-bold text-sm text-neutral-900">
                Order {selectedOrder.orderNumber}
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] uppercase text-neutral-400 block font-bold">
                Customer & Shipping
              </span>
              <p className="font-semibold text-black mt-0.5">{selectedOrder.shippingAddress.fullName}</p>
              <p className="text-neutral-600">{selectedOrder.shippingAddress.street}</p>
              <p className="text-neutral-600">
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode},{" "}
                {selectedOrder.shippingAddress.country}
              </p>
              <p className="text-neutral-600 font-mono">Phone: {selectedOrder.shippingAddress.phone}</p>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[10px] uppercase text-neutral-400 block font-bold mb-1.5">
                Purchased Items
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedOrder.items.map((it) => (
                  <div key={it.sku} className="flex justify-between py-1 border-b border-neutral-50">
                    <span>
                      {it.name} ({it.size} / {it.color}) × {it.quantity}
                    </span>
                    <span className="font-bold">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-sm">
              <span>Total:</span>
              <span>{formatPrice(selectedOrder.total)}</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white rounded font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
