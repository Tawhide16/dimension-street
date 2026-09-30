import React from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Checkout — DIMENSION STREET",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Minimal Clean Checkout Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4 sm:px-8">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline font-bold">256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Checkout View */}
      <main className="flex-1">
        <CheckoutForm />
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-neutral-200 text-center text-xs font-mono text-neutral-400 bg-white">
        <p>© 2026 DIMENSION STREET • Banani, Dhaka • Worldwide Courier</p>
      </footer>
    </div>
  );
}
