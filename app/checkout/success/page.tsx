import React from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import OrderSuccessView from "@/components/checkout/OrderSuccessView";
import { getOrderById } from "@/lib/dataService";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Order Confirmed — DIMENSION STREET",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/");
  }

  const order = await getOrderById(orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold uppercase font-mono mb-2">Order Not Found</h2>
        <p className="text-xs text-neutral-500 mb-4 font-mono">We couldn&apos;t locate order #{orderId}.</p>
        <Link href="/" className="px-6 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200 py-4 px-4 sm:px-8">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          <Logo size="md" />
        </div>
      </header>

      <main className="flex-1">
        <OrderSuccessView order={order} />
      </main>
    </div>
  );
}
