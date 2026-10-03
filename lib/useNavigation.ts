"use client";

import { useState, useEffect } from "react";
import { INavbarConfig } from "@/models/NavbarConfig";

export const fallbackNavbarConfig: INavbarConfig = {
  logoType: "image",
  logoText: "DIMENSION STREET",
  logoImageUrl: "/images/logo.png",
  menuPillLabel: "Menu",
  showCart: true,
  showWishlist: true,
  showAccount: true,
  showSearch: true,
  sticky: true,
  items: [
    { id: "nav-1", label: "Home", href: "/", isActive: true },
    { id: "nav-2", label: "Shop All", href: "/shop", isActive: true },
    { id: "nav-3", label: "Contact", href: "/contact", isActive: true },
    { id: "nav-4", label: "About", href: "/about", isActive: true },
  ],
  announcement: {
    enabled: true,
    text: "Dimension Street — Made in Bangladesh",
    linkUrl: "",
    bgColor: "#000000",
    textColor: "#ffffff",
  },
};

export function useNavigation() {
  const [config, setConfig] = useState<INavbarConfig>(fallbackNavbarConfig);
  const [loaded, setLoaded] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/cms/navigation", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.config) {
          setConfig(json.config);
        }
      }
    } catch {
      // fallback preserved
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchConfig();

    const handleUpdate = () => {
      fetchConfig();
    };

    window.addEventListener("focus", handleUpdate);
    window.addEventListener("navigation-updated", handleUpdate);

    return () => {
      window.removeEventListener("focus", handleUpdate);
      window.removeEventListener("navigation-updated", handleUpdate);
    };
  }, []);

  return { config, loaded, refresh: fetchConfig };
}
