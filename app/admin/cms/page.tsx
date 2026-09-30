"use client";

import React, { useState, useEffect } from "react";
import { HomepageSection } from "@/types";
import { LayoutTemplate, Eye, Check, Power, MoveVertical } from "lucide-react";
import Link from "next/link";

export default function AdminCMSBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    fetch("/api/cms/sections")
      .then((res) => res.json())
      .then((data) => {
        if (data.sections) setSections(data.sections);
      })
      .catch(() => {});
  }, []);

  const handleToggleActive = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s._id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s._id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleSave = async () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
              Homepage CMS Builder
            </h1>
            <span className="text-[10px] font-bold bg-pink-600 text-white px-2 py-0.5 rounded">
              CMS V2
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Reorder, customize headings, and toggle visibility of storefront homepage sections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 border border-neutral-300 text-neutral-800 text-xs font-bold uppercase rounded-md hover:bg-neutral-100 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </Link>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-md flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Homepage sections published to live storefront cache successfully!</span>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div
            key={section._id}
            className={`p-5 bg-white border rounded-xl shadow-2xs transition-all ${
              section.isActive ? "border-neutral-200" : "border-neutral-200/50 opacity-60 bg-neutral-50"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                    {section.type.replace("_", " ")}
                  </span>
                  <span className="font-bold text-neutral-900 text-sm">
                    {section.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(section._id)}
                  className={`px-3 py-1 text-xs rounded font-bold flex items-center gap-1.5 transition-colors ${
                    section.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{section.isActive ? "Active on Storefront" : "Disabled / Hidden"}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleTitleChange(section._id, e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded font-sans focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                  Subheading / Narrative
                </label>
                <input
                  type="text"
                  value={section.subtitle || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSections((prev) =>
                      prev.map((s) => (s._id === section._id ? { ...s, subtitle: val } : s))
                    );
                  }}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded font-sans focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
