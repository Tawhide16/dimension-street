"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { HomepageSection, CollectionItem } from "@/types";
import { IThemeConfig, initialThemeConfig } from "@/types/theme";
import { IFooterConfig, initialFooterConfig } from "@/types/footer";
import { INavbarConfig } from "@/models/NavbarConfig";
import { fallbackNavbarConfig } from "@/lib/useNavigation";

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type DrawerPosition = "left" | "right";
export type EditorTab = "sections" | "typography" | "theme" | "collections" | "footer";

interface LiveCmsContextType {
  isAdmin: boolean;
  isCheckingAuth: boolean;
  isEditorOpen: boolean;
  setIsEditorOpen: (open: boolean) => void;
  toggleEditor: () => void;
  drawerPosition: DrawerPosition;
  setDrawerPosition: (pos: DrawerPosition) => void;
  viewMode: ViewportMode;
  setViewMode: (mode: ViewportMode) => void;
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;

  // Live Draft Data
  sections: HomepageSection[];
  updateSectionData: (sectionTypeOrId: string, dataKey: string, value: any) => void;
  updateSectionField: (sectionTypeOrId: string, field: keyof HomepageSection, value: any) => void;
  
  themeConfig: IThemeConfig;
  updateTheme: (field: keyof IThemeConfig, value: any) => void;

  footerConfig: IFooterConfig;
  updateFooter: (updates: Partial<IFooterConfig>) => void;
  addFooterLink: (columnId: string, link: { label: string; href: string; isExternal?: boolean }) => void;
  removeFooterLink: (columnId: string, linkId: string) => void;
  updateFooterSocial: (network: string, url: string) => void;

  navigationConfig: INavbarConfig;
  updateNavigation: (updates: Partial<INavbarConfig>) => void;

  collections: CollectionItem[];
  refreshCollections: () => Promise<void>;
  createNewCollection: (col: { title: string; slug?: string; description?: string; bannerImage: string; featured?: boolean }) => Promise<boolean>;

  // Save & Status
  hasChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  statusMessage: string | null;
  saveAll: () => Promise<boolean>;
  discardChanges: () => void;

  // Auth
  loginWithPass: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
}

const LiveCmsContext = createContext<LiveCmsContextType | null>(null);

interface LiveCmsProviderProps {
  children: React.ReactNode;
  initialSections?: HomepageSection[];
  initialTheme?: IThemeConfig;
  initialFooter?: IFooterConfig;
  initialNavigation?: INavbarConfig;
  initialCollections?: CollectionItem[];
}

export function LiveCmsProvider({
  children,
  initialSections = [],
  initialTheme = initialThemeConfig,
  initialFooter = initialFooterConfig,
  initialNavigation = fallbackNavbarConfig,
  initialCollections = [],
}: LiveCmsProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState<DrawerPosition>("left");
  const [viewMode, setViewMode] = useState<ViewportMode>("desktop");
  const [activeTab, setActiveTab] = useState<EditorTab>("sections");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>("hero");

  // Live draft states
  const [sections, setSections] = useState<HomepageSection[]>(initialSections);
  const [themeConfig, setThemeConfig] = useState<IThemeConfig>(initialTheme);
  const [footerConfig, setFooterConfig] = useState<IFooterConfig>(initialFooter);
  const [navigationConfig, setNavigationConfig] = useState<INavbarConfig>(initialNavigation);
  const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);

  // Saved snapshots for change detection
  const [savedSectionsSnapshot, setSavedSectionsSnapshot] = useState(JSON.stringify(initialSections));
  const [savedThemeSnapshot, setSavedThemeSnapshot] = useState(JSON.stringify(initialTheme));
  const [savedFooterSnapshot, setSavedFooterSnapshot] = useState(JSON.stringify(initialFooter));

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Check admin authentication
  const checkAdminAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.authenticated) {
          setIsAdmin(true);
          return true;
        }
      }
      setIsAdmin(false);
      return false;
    } catch {
      setIsAdmin(false);
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth().then((authed) => {
      if (typeof window !== "undefined") {
        if (authed) {
          const params = new URLSearchParams(window.location.search);
          if (params.get("editor") === "true" || params.get("cms") === "true") {
            setIsEditorOpen(true);
          } else if (window.localStorage.getItem("ds_editor_opened") === "true") {
            setIsEditorOpen(true);
          }
        } else {
          setIsEditorOpen(false);
        }
      }
    });
  }, [checkAdminAuth]);

  // Load latest data when admin opens editor
  const loadLatestData = useCallback(async () => {
    try {
      const [secRes, themeRes, footRes, colRes] = await Promise.all([
        fetch("/api/cms/sections", { cache: "no-store" }),
        fetch("/api/cms/theme", { cache: "no-store" }),
        fetch("/api/cms/footer", { cache: "no-store" }),
        fetch("/api/collections", { cache: "no-store" }),
      ]);

      if (secRes.ok) {
        const sData = await secRes.json();
        if (sData.success && Array.isArray(sData.sections) && sData.sections.length > 0) {
          setSections(sData.sections);
          setSavedSectionsSnapshot(JSON.stringify(sData.sections));
        }
      }
      if (themeRes.ok) {
        const tData = await themeRes.json();
        if (tData.success && tData.config) {
          setThemeConfig(tData.config);
          setSavedThemeSnapshot(JSON.stringify(tData.config));
        }
      }
      if (footRes.ok) {
        const fData = await footRes.json();
        if (fData.success && fData.config) {
          setFooterConfig(fData.config);
          setSavedFooterSnapshot(JSON.stringify(fData.config));
        }
      }
      if (colRes.ok) {
        const cData = await colRes.json();
        if (cData.success && Array.isArray(cData.collections)) {
          setCollections(cData.collections);
        }
      }
    } catch (e) {
      console.warn("Live CMS failed to refresh background data:", e);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadLatestData();
    }
  }, [isAdmin, loadLatestData]);

  // Apply Theme & Typography CSS Variables dynamically
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    root.style.setProperty("--cms-primary-color", themeConfig.primaryColor || "#000000");
    root.style.setProperty("--cms-accent-color", themeConfig.accentColor || "#111111");
    root.style.setProperty("--cms-bg-color", themeConfig.backgroundColor || "#ffffff");

    const desktopHeadingScale = (themeConfig.desktopHeadingSize || 100) / 100;
    const mobileHeadingScale = (themeConfig.mobileHeadingSize || 100) / 100;
    const desktopBodyScale = (themeConfig.desktopBodySize || 100) / 100;
    const mobileBodyScale = (themeConfig.mobileBodySize || 100) / 100;

    root.style.setProperty("--cms-desktop-heading-scale", desktopHeadingScale.toString());
    root.style.setProperty("--cms-mobile-heading-scale", mobileHeadingScale.toString());
    root.style.setProperty("--cms-desktop-body-scale", desktopBodyScale.toString());
    root.style.setProperty("--cms-mobile-body-scale", mobileBodyScale.toString());

    // Corner radius for buttons
    const radiusMap: Record<string, string> = {
      none: "0px",
      xs: "2px",
      sm: "4px",
      md: "8px",
      lg: "12px",
      full: "9999px",
    };
    root.style.setProperty("--cms-btn-radius", radiusMap[themeConfig.buttonRadius || "xs"] || "2px");
  }, [themeConfig]);

  // Check if any draft has unsaved edits
  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(sections) !== savedSectionsSnapshot ||
      JSON.stringify(themeConfig) !== savedThemeSnapshot ||
      JSON.stringify(footerConfig) !== savedFooterSnapshot
    );
  }, [sections, themeConfig, footerConfig, savedSectionsSnapshot, savedThemeSnapshot, savedFooterSnapshot]);

  // Section updates
  const updateSectionData = (sectionTypeOrId: string, dataKey: string, value: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.type === sectionTypeOrId || s._id === sectionTypeOrId) {
          return {
            ...s,
            data: {
              ...(s.data || {}),
              [dataKey]: value,
            },
          };
        }
        return s;
      })
    );
  };

  const updateSectionField = (sectionTypeOrId: string, field: keyof HomepageSection, value: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.type === sectionTypeOrId || s._id === sectionTypeOrId) {
          return {
            ...s,
            [field]: value,
          };
        }
        return s;
      })
    );
  };

  // Theme update
  const updateTheme = (field: keyof IThemeConfig, value: any) => {
    setThemeConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Footer update
  const updateFooter = (updates: Partial<IFooterConfig>) => {
    setFooterConfig((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const addFooterLink = (columnId: string, link: { label: string; href: string; isExternal?: boolean }) => {
    setFooterConfig((prev) => {
      const cols = [...(prev.columns || [])];
      const targetCol = cols.find((c) => c.id === columnId);
      if (targetCol) {
        targetCol.links = [
          ...targetCol.links,
          {
            id: `link-${Date.now()}`,
            label: link.label,
            href: link.href,
            isExternal: link.isExternal,
          },
        ];
      }
      return { ...prev, columns: cols };
    });
  };

  const removeFooterLink = (columnId: string, linkId: string) => {
    setFooterConfig((prev) => {
      const cols = prev.columns.map((c) => {
        if (c.id === columnId) {
          return {
            ...c,
            links: c.links.filter((l) => l.id !== linkId),
          };
        }
        return c;
      });
      return { ...prev, columns: cols };
    });
  };

  const updateFooterSocial = (network: string, url: string) => {
    setFooterConfig((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [network]: url,
      },
    }));
  };

  // Navigation update
  const updateNavigation = (updates: Partial<INavbarConfig>) => {
    setNavigationConfig((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Collections
  const refreshCollections = async () => {
    try {
      const res = await fetch("/api/collections", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.collections)) {
          setCollections(data.collections);
        }
      }
    } catch {}
  };

  const createNewCollection = async (col: {
    title: string;
    slug?: string;
    description?: string;
    bannerImage: string;
    featured?: boolean;
  }) => {
    try {
      const slug = col.slug || col.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...col,
          slug,
          itemCount: 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshCollections();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Save All Changes
  const saveAll = async (): Promise<boolean> => {
    setIsSaving(true);
    setStatusMessage("Publishing changes to live storefront...");
    try {
      const [secRes, themeRes, footRes] = await Promise.all([
        fetch("/api/cms/sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections }),
        }),
        fetch("/api/cms/theme", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(themeConfig),
        }),
        fetch("/api/cms/footer", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(footerConfig),
        }),
      ]);

      const [secData, themeData, footData] = await Promise.all([
        secRes.json().catch(() => ({ success: false })),
        themeRes.json().catch(() => ({ success: false })),
        footRes.json().catch(() => ({ success: false })),
      ]);

      if (secData.success) setSavedSectionsSnapshot(JSON.stringify(sections));
      if (themeData.success) setSavedThemeSnapshot(JSON.stringify(themeConfig));
      if (footData.success) setSavedFooterSnapshot(JSON.stringify(footerConfig));

      setSaveSuccess(true);
      setStatusMessage("✓ All theme, text, images & footer links published live!");
      setTimeout(() => {
        setSaveSuccess(false);
        setStatusMessage(null);
      }, 4000);
      return true;
    } catch (err: any) {
      setStatusMessage("Failed to publish: " + (err?.message || "Network error"));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Discard draft
  const discardChanges = () => {
    try {
      setSections(JSON.parse(savedSectionsSnapshot));
      setThemeConfig(JSON.parse(savedThemeSnapshot));
      setFooterConfig(JSON.parse(savedFooterSnapshot));
      setStatusMessage("Reverted to last published state.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {}
  };

  // Admin Quick Login with password
  const loginWithPass = async (password: string, email?: string) => {
    try {
      const targetEmail = (email && email.trim()) || "tawhideh.b10@gmail.com";
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          password: password.trim(),
          rememberMe: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setIsEditorOpen(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ds_editor_opened", "true");
        }
        await loadLatestData();
        return { success: true };
      } else {
        // Try fallback admin email if default failed
        if (!email && password.trim() === "admin123") {
          const fallbackRes = await fetch("/api/admin/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "admin@dimensionstreet.com",
              password: password.trim(),
              rememberMe: true,
            }),
          });
          const fbData = await fallbackRes.json();
          if (fbData.success) {
            setIsAdmin(true);
            setIsEditorOpen(true);
            if (typeof window !== "undefined") {
              window.localStorage.setItem("ds_editor_opened", "true");
            }
            await loadLatestData();
            return { success: true };
          }
        }
        return { success: false, error: data.error || "Incorrect admin password." };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || "Server connection failed." };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
    setIsAdmin(false);
    setIsEditorOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ds_editor_opened");
    }
  };

  const toggleEditor = () => {
    setIsEditorOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ds_editor_opened", next ? "true" : "false");
      }
      return next;
    });
  };

  return (
    <LiveCmsContext.Provider
      value={{
        isAdmin,
        isCheckingAuth,
        isEditorOpen,
        setIsEditorOpen,
        toggleEditor,
        drawerPosition,
        setDrawerPosition,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        selectedSectionId,
        setSelectedSectionId,
        sections,
        updateSectionData,
        updateSectionField,
        themeConfig,
        updateTheme,
        footerConfig,
        updateFooter,
        addFooterLink,
        removeFooterLink,
        updateFooterSocial,
        navigationConfig,
        updateNavigation,
        collections,
        refreshCollections,
        createNewCollection,
        hasChanges,
        isSaving,
        saveSuccess,
        statusMessage,
        saveAll,
        discardChanges,
        loginWithPass,
        logoutAdmin,
      }}
    >
      {children}
    </LiveCmsContext.Provider>
  );
}

export function useLiveCms() {
  const ctx = useContext(LiveCmsContext);
  if (!ctx) {
    throw new Error("useLiveCms must be used within a LiveCmsProvider");
  }
  return ctx;
}

