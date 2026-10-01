"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PromoCountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target 48 hours countdown from load or fixed end date
    const target = new Date();
    target.setHours(target.getHours() + 36);
    target.setMinutes(target.getMinutes() + 45);

    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNum = (num: number) => num.toString().padStart(2, "0");

  const topMarqueeText =
    "ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • ";

  const bottomMarqueeText =
    "FASHION OFFERS YOU CAN'T MISS • FASHION OFFERS YOU CAN'T MISS • FASHION OFFERS YOU CAN'T MISS • FASHION OFFERS YOU CAN'T MISS • FASHION OFFERS YOU CAN'T MISS • FASHION OFFERS YOU CAN'T MISS • ";

  return (
    <section className="relative w-full overflow-hidden bg-neutral-900 text-white my-4">
      {/* 1. Top Ticker Marquee Bar - Bigger Font */}
      <div className="relative z-20 w-full bg-neutral-950 py-3 sm:py-3.5 border-b border-white/10 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee text-sm sm:text-base md:text-lg font-mono font-bold tracking-[0.25em] uppercase text-white">
          {topMarqueeText} {topMarqueeText}
        </div>
      </div>

      {/* 2. Main Visual Billboard */}
      <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] flex items-center justify-center">
        {/* Background Streetwear Lookbook Photography */}
        <Image
          src="/images/offer_closing_banner.jpg"
          alt="Streetwear Lookbook - Offer Closing Soon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter contrast-105"
        />

        {/* Ambient Dark Gradient Vignette for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Content Container (Left / Center / Right Layout) */}
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 lg:gap-12">
            {/* Left Column: Heading & Call to Action */}
            <div className="flex flex-col items-start space-y-4 text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                Offer Closing Soon...
              </h2>
              <Link
                href="/shop?sort=discount"
                className="btn-slide-white inline-block px-7 sm:px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md cursor-pointer"
              >
                VIEW COLLECTION
              </Link>
            </div>

            {/* Center Column: Big Digital Clock with Unit Labels */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
                {/* Days */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    {formatNum(timeLeft.days)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-300 mt-1">
                    DAYS
                  </span>
                </div>

                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold -translate-y-2 text-white/80">
                  :
                </span>

                {/* Hours */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    {formatNum(timeLeft.hours)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-300 mt-1">
                    HOURS
                  </span>
                </div>

                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold -translate-y-2 text-white/80">
                  :
                </span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    {formatNum(timeLeft.minutes)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-300 mt-1">
                    MINUTES
                  </span>
                </div>

                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold -translate-y-2 text-white/80">
                  :
                </span>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    {formatNum(timeLeft.seconds)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-300 mt-1">
                    SECONDS
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Explanatory Subtitle */}
            <div className="flex md:justify-end text-left md:text-left">
              <p className="text-xs sm:text-sm md:text-base font-medium text-white/90 max-w-[320px] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Explore Curated Styles Designed To Elevate Your Everyday Look.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Ticker Marquee Bar - Bigger Font */}
      <div className="relative z-20 w-full bg-neutral-950 py-3 sm:py-3.5 border-t border-white/10 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee-reverse text-sm sm:text-base md:text-lg font-mono font-bold tracking-[0.25em] uppercase text-white">
          {bottomMarqueeText} {bottomMarqueeText}
        </div>
      </div>
    </section>
  );
}
