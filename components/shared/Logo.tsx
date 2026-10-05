"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useNavigation } from "@/lib/useNavigation";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark" | "auto";
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({
  className = "",
  size = "lg",
}: LogoProps) {
  const { config } = useNavigation();

  const sizeMap = {
    sm: "h-9 sm:h-10",
    md: "h-12 sm:h-13",
    lg: "h-14 sm:h-16 lg:h-18",
    xl: "h-20 sm:h-24",
  };

  const isTextLogo = config?.logoType === "text";
  const logoSrc = config?.logoImageUrl || "/images/logo.png";
  const logoText = config?.logoText || "DIMENSION STREET";

  return (
    <Link
      href="/"
      className={`inline-flex items-center select-none transition-transform hover:scale-[1.03] active:scale-95 ${className}`}
      aria-label={`${logoText} Home`}
    >
      {isTextLogo ? (
        <span className="font-mono font-black text-xl sm:text-2xl tracking-tighter text-black uppercase">
          {logoText}
        </span>
      ) : (
        <div className={`relative ${sizeMap[size]} w-auto min-w-[70px] max-w-[150px] sm:max-w-[260px] flex items-center justify-start`}>
          <Image
            src={logoSrc}
            alt={logoText}
            width={260}
            height={80}
            className="h-full w-auto object-contain"
            unoptimized
            priority
          />
        </div>
      )}
    </Link>
  );
}
