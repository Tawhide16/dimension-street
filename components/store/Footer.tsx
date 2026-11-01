"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp, Check } from "lucide-react";
import { IFooterConfig, initialFooterConfig } from "@/types/footer";

interface FooterProps {
  config?: IFooterConfig;
}

export default function Footer({ config: propConfig }: FooterProps) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [liveConfig, setLiveConfig] = useState<IFooterConfig>(propConfig || initialFooterConfig);

  useEffect(() => {
    if (propConfig) {
      setLiveConfig(propConfig);
      return;
    }

    let isMounted = true;
    fetch("/api/cms/footer", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success && data?.config) {
          setLiveConfig(data.config);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [propConfig]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setJoined(true);
    setEmail("");
    setTimeout(() => setJoined(false), 3000);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const columns = liveConfig.columns && liveConfig.columns.length > 0 ? liveConfig.columns : initialFooterConfig.columns;
  const social = liveConfig.socialLinks || initialFooterConfig.socialLinks;

  return (
    <footer className="relative bg-black text-white pt-16 pb-12 overflow-hidden border-t border-neutral-900">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Top Section: Links Columns + Newsletter Column */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-6 pb-14">
          {/* Dynamic Link Columns */}
          {columns.map((col, idx) => (
            <div key={col.id || `col-${idx}`} className="lg:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                {col.links.map((link, lIdx) => (
                  <li key={link.id || `link-${lIdx}`}>
                    {link.isExternal || link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* NEWSLETTER (RIGHT COLUMN) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 lg:border-l lg:border-neutral-800 lg:pl-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 leading-snug">
              {liveConfig.newsletterTitle || "JOIN THE COMMUNITY FOR EXCLUSIVE WELLNESS INSIGHTS"}
            </h4>

            {joined ? (
              <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-full flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                <Check className="w-4 h-4" />
                <span>WELCOME TO THE COMMUNITY</span>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-2.5">
                <input
                  type="email"
                  required
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full bg-white text-black px-5 py-3 text-xs placeholder:text-neutral-400 placeholder:uppercase font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-slide-white w-full rounded-full font-bold uppercase tracking-wider text-xs py-3 cursor-pointer text-center block shadow-sm border border-white hover:border-black"
                >
                  {liveConfig.newsletterButtonText || "JOIN NOW"}
                </button>
              </form>
            )}

            <p className="text-[10px] text-neutral-400 mt-2.5 leading-tight">
              {liveConfig.newsletterSubtitle || "*By joining, you'll receive our wellness insights and can unsubscribe anytime."}
            </p>

            {/* Social Links Row */}
            {social && (
              <div className="pt-6 border-t border-neutral-900 mt-6">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-3">
                  Follow Our Dimensions
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  {social.instagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white text-black hover:bg-neutral-200 hover:scale-105 flex items-center justify-center transition-all shadow-md cursor-pointer"
                      title="Instagram"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {social.facebook && (
                    <a
                      href={social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white text-black hover:bg-neutral-200 hover:scale-105 flex items-center justify-center transition-all shadow-md cursor-pointer"
                      title="Facebook"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                      </svg>
                    </a>
                  )}
                  {social.tiktok && (
                    <a
                      href={social.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white text-black hover:bg-neutral-200 hover:scale-105 flex items-center justify-center transition-all shadow-md cursor-pointer"
                      title="TikTok"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c-.01 2.21-.77 4.45-2.31 6.06-1.64 1.74-4.04 2.62-6.42 2.4-2.37-.17-4.63-1.4-5.96-3.38-1.39-2.01-1.67-4.69-.76-6.95.88-2.28 2.87-3.95 5.25-4.38.74-.15 1.5-.18 2.25-.13v4.11c-.5-.07-1.02-.04-1.51.1-.98.24-1.83.89-2.26 1.8-.46.94-.43 2.09.07 3.01.5 1.01 1.48 1.72 2.6 1.87 1.1.18 2.25-.19 3.04-.97.77-.73 1.17-1.81 1.16-2.89V.02z" />
                      </svg>
                    </a>
                  )}
                  {social.whatsapp && (
                    <a
                      href={social.whatsapp.startsWith("http") ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white text-black hover:bg-neutral-200 hover:scale-105 flex items-center justify-center transition-all shadow-md cursor-pointer"
                      title="WhatsApp"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </a>
                  )}
                  {social.twitter && (
                    <a
                      href={social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white text-black hover:bg-neutral-200 hover:scale-105 flex items-center justify-center transition-all shadow-md cursor-pointer"
                      title="X / Twitter"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                  {social.youtube && (
                    <a
                      href={social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white text-black hover:bg-neutral-200 hover:scale-105 flex items-center justify-center transition-all shadow-md cursor-pointer"
                      title="YouTube"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Massive White Wordmark */}
        <div className="py-6 sm:py-10 text-center select-none overflow-hidden">
          <h1 className="text-[13vw] sm:text-[14vw] font-black tracking-tight text-white leading-none uppercase">
            {liveConfig.brandWordmark || "DIMENSION"}
          </h1>
        </div>

        {/* Boxed Mission Statement */}
        <div className="max-w-2xl mx-auto my-6 border border-white/30 px-6 sm:px-10 py-4 text-center">
          <p className="text-xs sm:text-[13px] text-neutral-200 font-normal leading-relaxed">
            {liveConfig.missionStatement || "Premium everyday clothing in heavyweight natural fabrics. A fictional label built as a conversion-focused ecommerce concept."}
          </p>
        </div>

        {/* Copyright notice */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[11px] text-neutral-400">
            {liveConfig.copyrightText || "© 2026 DIMENSION® — fictional label for a conversion-focused ecommerce concept"}
          </p>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-6 right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black border border-white/30 text-white flex items-center justify-center hover:bg-neutral-900 hover:border-white transition-all shadow-lg z-40 cursor-pointer"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </footer>
  );
}
