"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

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
  const sizeMap = {
    sm: "h-10 sm:h-11",
    md: "h-13 sm:h-14",
    lg: "h-16 sm:h-18 lg:h-20",
    xl: "h-22 sm:h-26",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center select-none transition-transform hover:scale-[1.03] active:scale-95 ${className}`}
      aria-label="DIMENSION STREET Home"
    >
      <div className={`relative ${sizeMap[size]} w-auto aspect-square flex items-center justify-center`}>
        <Image
          src="/images/logo.png"
          alt="DIMENSION STREET"
          width={200}
          height={200}
          className="h-full w-auto object-contain mix-blend-multiply drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]"
          priority
        />
      </div>
    </Link>
  );
}
