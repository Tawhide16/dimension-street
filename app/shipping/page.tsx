import React from "react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Truck, Clock, ShieldCheck, Globe } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-black font-mono uppercase tracking-tight text-neutral-900 mb-2">
          Shipping & Delivery
        </h1>
        <p className="text-xs font-mono text-neutral-500 mb-8">
          Dimension Street logistics standards & delivery tiers
        </p>

        <div className="space-y-6 text-xs font-mono text-neutral-700 leading-relaxed">
          <div className="p-5 border border-neutral-200 rounded-xs bg-neutral-50 space-y-2">
            <h3 className="text-sm font-bold text-black uppercase flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Inside Dhaka Delivery
            </h3>
            <p>Standard delivery: 24 to 48 business hours. Delivered via Pathao / Paperfly express courier.</p>
            <p className="font-bold text-black">Delivery Charge: ৳80 BDT (FREE on orders over $150 / ৳18,000)</p>
          </div>

          <div className="p-5 border border-neutral-200 rounded-xs bg-neutral-50 space-y-2">
            <h3 className="text-sm font-bold text-black uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-800" />
              Outside Dhaka (All Bangladesh)
            </h3>
            <p>Delivery time: 2 to 4 business days directly to your home address.</p>
            <p className="font-bold text-black">Delivery Charge: ৳150 BDT</p>
          </div>

          <div className="p-5 border border-neutral-200 rounded-xs bg-neutral-50 space-y-2">
            <h3 className="text-sm font-bold text-black uppercase flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-800" />
              International Worldwide Shipping
            </h3>
            <p>Dispatched via DHL Express Air Freight. Average delivery: 3-6 business days with tracking.</p>
            <p className="font-bold text-black">Flat Rate: $15 USD (FREE over $150 USD)</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
