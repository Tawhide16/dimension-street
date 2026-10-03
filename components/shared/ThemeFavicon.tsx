"use client";

import { useEffect } from "react";

export default function ThemeFavicon() {
  useEffect(() => {
    const updateFavicon = () => {
      // Check system preference
      const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      // Check document root class (if site uses .dark or data-theme)
      const hasDarkClass = document.documentElement.classList.contains("dark") || 
                           document.body.classList.contains("dark") ||
                           document.documentElement.getAttribute("data-theme") === "dark";

      const useDark = isDarkMode || hasDarkClass;

      const faviconPath = useDark 
        ? "/favicon-white-32x32.png" 
        : "/favicon-black-32x32.png"; // BLACK LOGO FOR WHITE/LIGHT THEME

      // Find or create favicon link
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconPath;
      link.type = "image/png";
    };

    updateFavicon();

    // Listen for OS/Browser theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => updateFavicon();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    // Also observe class mutations on html element for theme toggles
    const observer = new MutationObserver(updateFavicon);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
      observer.disconnect();
    };
  }, []);

  return null;
}
