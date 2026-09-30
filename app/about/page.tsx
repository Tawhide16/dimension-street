import React from "react";
import Image from "next/image";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Sparkles, Feather, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-2">
            ORIGIN STORY
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900">
            THE ARCHITECTURE OF CLOTHING
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-3">
            Born in Dhaka. Dedicated to heavyweight organic cottons and eternal minimalist geometry.
          </p>
        </div>

        <div className="relative aspect-16/9 rounded overflow-hidden border border-neutral-200 mb-12 shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80"
            alt="Dimension Street Atelier"
            fill
            className="object-cover"
          />
        </div>

        <div className="prose max-w-none text-neutral-700 font-normal leading-relaxed text-sm space-y-6">
          <p>
            DIMENSION STREET was conceived to disrupt the endless churn of fast-fashion synthetic blends. In an era saturated with paper-thin polyester tees that deform after two washes, we chose the path of structural permanence.
          </p>
          <p>
            Every single t-shirt starts with custom ring-spun carded organic cotton knit between <strong>320 and 480 GSM</strong>. We engineer tight-gauge ribbing, drop-shoulder seams, and boxy proportions that drape with architectural presence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-200 font-mono text-xs">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
              <h4 className="font-bold text-black uppercase mb-1">320-480 GSM</h4>
              <p className="text-neutral-500 text-[11px]">Uncompromising fabric density for permanent silhouette retention.</p>
            </div>
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
              <h4 className="font-bold text-black uppercase mb-1">Ethical Hub</h4>
              <p className="text-neutral-500 text-[11px]">Crafted with fair wages in our dedicated Dhaka manufacturing workshop.</p>
            </div>
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
              <h4 className="font-bold text-black uppercase mb-1">Zero Surplus</h4>
              <p className="text-neutral-500 text-[11px]">Numbered drops eliminate excess production landfill waste.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
