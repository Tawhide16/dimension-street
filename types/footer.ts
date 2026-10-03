export interface IFooterLink {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface IFooterColumn {
  id: string;
  title: string;
  links: IFooterLink[];
}

export interface IFooterConfig {
  columns: IFooterColumn[];
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterButtonText: string;
  brandWordmark: string;
  missionStatement: string;
  copyrightText: string;
}

export const initialFooterConfig: IFooterConfig = {
  columns: [
    {
      id: "col-shop",
      title: "SHOP",
      links: [
        { id: "link-1", label: "All", href: "/shop" },
        { id: "link-2", label: "T-shirts", href: "/shop?category=tees" },
        { id: "link-3", label: "Hoodies", href: "/shop?category=hoodies" },
        { id: "link-4", label: "Sweaters", href: "/shop?category=sweaters" },
        { id: "link-5", label: "Accessories", href: "/shop?category=accessories" },
        { id: "link-6", label: "Last sizes", href: "/shop?sort=last-sizes" },
        { id: "link-7", label: "Archive", href: "/collections/archive" },
      ],
    },
    {
      id: "col-brand",
      title: "BRAND",
      links: [
        { id: "link-8", label: "About us", href: "/about" },
        { id: "link-9", label: "Behind the scenes", href: "/about#behind-the-scenes" },
        { id: "link-10", label: "Reviews", href: "/reviews" },
      ],
    },
    {
      id: "col-account",
      title: "ACCOUNT",
      links: [
        { id: "link-11", label: "About", href: "/account" },
        { id: "link-12", label: "Kaur Clo", href: "/collections/kaur" },
        { id: "link-13", label: "Donations", href: "/donations" },
        { id: "link-14", label: "★ 4.8 Trustpilot", href: "https://trustpilot.com", isExternal: true },
      ],
    },
    {
      id: "col-support",
      title: "SUPPORT",
      links: [
        { id: "link-15", label: "FAQs", href: "/faq" },
        { id: "link-16", label: "Track My Order", href: "/shipping" },
        { id: "link-17", label: "Returns / Exchanges", href: "/returns" },
        { id: "link-18", label: "Contact Us", href: "/contact" },
        { id: "link-19", label: "WhatsApp", href: "https://wa.me/", isExternal: true },
      ],
    },
    {
      id: "col-community",
      title: "COMMUNITY",
      links: [
        { id: "link-20", label: "Community", href: "/about" },
      ],
    },
  ],
  newsletterTitle: "JOIN THE COMMUNITY FOR EXCLUSIVE WELLNESS INSIGHTS",
  newsletterSubtitle: "*By joining, you'll receive our wellness insights and can unsubscribe anytime.",
  newsletterButtonText: "JOIN NOW",
  brandWordmark: "DIMENSION",
  missionStatement: "Premium everyday clothing in heavyweight natural fabrics. A fictional label built as a conversion-focused ecommerce concept.",
  copyrightText: "© 2026 DIMENSION® — fictional label for a conversion-focused ecommerce concept",
};
