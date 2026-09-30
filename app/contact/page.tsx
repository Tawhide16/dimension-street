"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import { Mail, Phone, MapPin, Send, CheckCircle2, Building2, PackageCheck } from "lucide-react";

function ContactContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") || "general";

  const [formType, setFormType] = useState(
    initialSubject === "bulk"
      ? "bulk"
      : initialSubject === "distributor"
      ? "distributor"
      : "general"
  );
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    unitsNeeded: "100 - 500",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-neutral-500">
          DIMENSION STREET ARCHIVE // DIRECT DESK
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900">
          {formType === "bulk"
            ? "BULK PRICING & INQUIRIES"
            : formType === "distributor"
            ? "DISTRIBUTOR APPLICATION"
            : "CONTACT & SUPPORT"}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto">
          {formType === "bulk"
            ? "Custom tier pricing for bulk orders of 50+ units. Premium heavyweight streetwear for teams, brands, and boutiques."
            : formType === "distributor"
            ? "Apply to become an authorized global stockist or regional distributor for DIMENSION STREET."
            : "Have questions about our archive collections, fit guide, or shipping? Reach out to our Dhaka headquarters."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-neutral-100 rounded-full border border-neutral-200">
          <button
            type="button"
            onClick={() => {
              setFormType("general");
              setSubmitted(false);
            }}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              formType === "general"
                ? "bg-black text-white shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            General Contact
          </button>
          <button
            type="button"
            onClick={() => {
              setFormType("bulk");
              setSubmitted(false);
            }}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              formType === "bulk"
                ? "bg-black text-white shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            Bulk Pricing
          </button>
          <button
            type="button"
            onClick={() => {
              setFormType("distributor");
              setSubmitted(false);
            }}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              formType === "distributor"
                ? "bg-black text-white shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            Distributor Application
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-3">
              HEADQUARTERS
            </h3>
            
            <div className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
              <MapPin className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <span>Gulshan-2, Dhaka 1212, Bangladesh</span>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
              <Mail className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <span>concierge@dimensionstreet.com</span>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
              <Phone className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <span>+880 1700-000000</span>
            </div>
          </div>

          <div className="p-6 bg-neutral-900 text-white rounded-2xl space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
              AVERAGE RESPONSE TIME
            </span>
            <p className="text-2xl font-black">Within 4 Hours</p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Wholesale and distributor requests are assigned dedicated account managers.
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="p-8 sm:p-12 bg-neutral-50 border border-neutral-200 rounded-2xl text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
                Inquiry Received
              </h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                Thank you for contacting DIMENSION STREET. Our wholesale and concierge team will review your application and respond shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase rounded-full tracking-wider hover:bg-neutral-800"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {(formType === "bulk" || formType === "distributor") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1.5">
                      Company / Store Name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Streetwear Boutique LLC"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1.5">
                      Estimated Volume
                    </label>
                    <select
                      value={formData.unitsNeeded}
                      onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="50 - 100">50 - 100 Units</option>
                      <option value="100 - 500">100 - 500 Units</option>
                      <option value="500 - 2,000">500 - 2,000 Units</option>
                      <option value="2,000+">2,000+ Units (Enterprise)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1.5">
                  Message / Requirements *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={
                    formType === "bulk"
                      ? "Tell us about the styles, sizes, and destination for your bulk order..."
                      : formType === "distributor"
                      ? "Tell us about your distribution channels, retail locations, and market presence..."
                      : "How can we assist you today?"
                  }
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
              >
                <span>Submit Inquiry</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="py-20 text-center text-sm font-mono">Loading form...</div>}>
          <ContactContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
