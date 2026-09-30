import React from "react";
import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { getCollections } from "@/lib/dataService";
import { ArrowUpRight } from "lucide-react";

export const revalidate = 0;

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400">
            SEASONAL CAPSULES
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 mt-2">
            COLLECTIONS
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-3">
            Explore dedicated design explorations ranging from custom 480 GSM fleeces to limited numbered archive drops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col) => (
            <Link
              key={col._id}
              href={`/collections/${col.slug}`}
              className="group relative aspect-4/3 rounded-xs overflow-hidden border border-neutral-200 bg-neutral-100 flex flex-col justify-end p-6"
            >
              <Image
                src={col.bannerImage}
                alt={col.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase text-white tracking-tight">
                    {col.title}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 line-clamp-1">
                    {col.description}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors flex-shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
