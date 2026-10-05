"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface PromoCountdownBannerProps {
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  bgImage?: string;
  topMarqueeText?: string;
  bottomMarqueeText?: string;
  countdownHours?: number;
}

export default function PromoCountdownBanner({
  title = "Offer Closing Soon...",
  buttonText = "VIEW COLLECTION",
  buttonLink = "/shop?sort=discount",
  bgImage = "/images/offer_closing_banner.jpg",
  topMarqueeText = "ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • ENJOY UP TO 50% OFF SELECT STYLES • ",
  bottomMarqueeText = "FASHION OFFERS YOU CAN'T MISS • FASHION OFFERS YOU CAN'T MISS • FASHION OFFERS YOU CAN'T MISS • ",
  countdownHours = 36,
}: PromoCountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target countdown from hours specified
    const target = new Date();
    target.setHours(target.getHours() + (countdownHours || 36));
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
  }, [countdownHours]);

  const formatNum = (num: number) => num.toString().padStart(2, "0");

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
          src={bgImage || "/images/offer_closing_banner.jpg"}
          alt="Streetwear Lookbook - Offer Closing Soon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter contrast-105"
        />

        {/* Ambient Dark Gradient Vignette for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Content Container (Left / Center / Right Layout on desktop, Centered column on mobile) */}
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 sm:gap-8 lg:gap-12">
            {/* Left Column: Heading & Call to Action (Desktop) */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 order-1 md:order-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-bold text-white tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] whitespace-nowrap">
                {title}
              </h2>
              {/* Desktop-only button */}
              <div className="hidden md:block">
                <Link
                  href={buttonLink}
                  className="btn-slide-white inline-block px-7 sm:px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {buttonText}
                </Link>
              </div>
            </div>

            {/* Center Column: Big Digital Clock with Unit Labels */}
            <div className="flex flex-col items-center justify-center text-center order-2 md:order-2">
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
            <div className="flex justify-center md:justify-end text-center md:text-left order-3 md:order-3">
              <p className="text-xs sm:text-sm md:text-base font-medium text-white/90 max-w-[320px] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Explore Curated Styles Designed To Elevate Your Everyday Look.
              </p>
            </div>

            {/* Mobile-only Call to Action Button: at the bottom (order-4) and centered */}
            <div className="flex md:hidden justify-center items-center text-center order-4 pt-2">
              <Link
                href={buttonLink}
                className="btn-slide-white inline-block px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md cursor-pointer"
              >
                {buttonText}
              </Link>
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
