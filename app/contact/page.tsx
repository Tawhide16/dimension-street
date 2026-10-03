"use client";

import React, { useState } from "react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import { MessageSquare, Phone, CheckCircle2, ArrowRight } from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}


export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-20 lg:py-24">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-8 lg:pr-4">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-neutral-900 lowercase select-none">
                  contact us
                </h1>
              </div>

              {/* Chat to us */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-900 shrink-0">
                    <MessageSquare className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                    Chat to us
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 pl-12 leading-relaxed">
                  Our customer support team is here to help.
                </p>
                <div className="pl-12">
                  <a
                    href="mailto:support@dimensionstreet.com"
                    className="text-sm font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors"
                  >
                    support@dimensionstreet.com
                  </a>
                </div>
              </div>

              {/* Social Icon Pills */}
              <div className="pt-2">
                <div className="flex items-center gap-3">
                  <a
                    href="tel:+8801700000000"
                    title="Phone / WhatsApp"
                    className="w-10 h-10 rounded-xl border border-neutral-300 hover:border-black flex items-center justify-center text-neutral-800 hover:text-black hover:bg-neutral-50 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    title="Instagram"
                    className="w-10 h-10 rounded-xl border border-neutral-300 hover:border-black flex items-center justify-center text-neutral-800 hover:text-black hover:bg-neutral-50 transition-all"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    title="X / Twitter"
                    className="w-10 h-10 rounded-xl border border-neutral-300 hover:border-black flex items-center justify-center text-neutral-800 hover:text-black hover:bg-neutral-50 transition-all"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Rounded Card */}
            <div className="lg:col-span-7">
              <div className="bg-[#f5f5f4] border border-neutral-200/90 rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-sm transition-all">
                {submitted ? (
                  <div className="py-12 sm:py-16 text-center space-y-4 animate-fade-in">
                    <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                      Message Sent!
                    </h2>
                    <p className="text-sm sm:text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out. Our support concierge will get back to you shortly.
                    </p>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setFormData({ name: "", email: "", message: "" });
                        }}
                        className="px-6 py-3 bg-black text-white text-xs font-mono font-bold uppercase rounded-full tracking-wider hover:bg-neutral-800 transition-all"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-snug">
                        Got questions? We&apos;ve got the answers. Let&apos;s talk.
                      </h2>
                      <p className="text-sm text-neutral-600">
                        Tell us about your inquiry and what you need.
                      </p>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-6 pt-2">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="name"
                          className="block text-xs sm:text-sm font-semibold text-neutral-900"
                        >
                          Your Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your full name"
                          className="w-full bg-transparent border-b border-neutral-300 focus:border-black py-2.5 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="email"
                          className="block text-xs sm:text-sm font-semibold text-neutral-900"
                        >
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="you@institution.com"
                          className="w-full bg-transparent border-b border-neutral-300 focus:border-black py-2.5 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors"
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="message"
                          className="block text-xs sm:text-sm font-semibold text-neutral-900"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={3}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          placeholder="Tell us a little about what you need..."
                          className="w-full bg-transparent border-b border-neutral-300 focus:border-black py-2.5 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 outline-none resize-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-60 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <span className="font-mono text-xs uppercase tracking-wider">Sending...</span>
                        ) : (
                          <>
                            <span>Let&apos;s get started!</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

