import { Inter, Montserrat, Open_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { CartProvider } from "@/lib/cartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import ThemeFavicon from "@/components/shared/ThemeFavicon";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-mono",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

import { getSeoConfig } from "@/lib/dataService";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoConfig();
  const keywordsArray = (seo.keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const rawBase =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    seo.canonicalUrl ||
    "https://dimension-street.vercel.app";

  const base = rawBase.startsWith("http") ? rawBase : `https://${rawBase}`;

  const ogImageUrl =
    seo.ogImage && !seo.ogImage.includes("unsplash.com")
      ? seo.ogImage
      : "/images/og-dimension-street.png";

  return {
    metadataBase: new URL(base),
    title: {
      default: seo.siteTitle,
      template: seo.titleTemplate,
    },
    description: seo.metaDescription,
    keywords: keywordsArray,
    authors: [{ name: "DIMENSION STREET" }],
    robots: {
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
    },
    openGraph: {
      title: seo.ogTitle || seo.siteTitle,
      description: seo.ogDescription || seo.metaDescription,
      url: base,
      siteName: "DIMENSION STREET",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "DIMENSION STREET — Heavyweight Essentials",
        },
      ],
    },
    twitter: {
      card: seo.twitterCard || "summary_large_image",
      site: seo.twitterHandle,
      title: seo.ogTitle || seo.siteTitle,
      description: seo.ogDescription || seo.metaDescription,
      images: [ogImageUrl],
    },
    icons: {
      icon: [
        {
          url: "/favicon-black-32x32.png",
          sizes: "32x32",
          type: "image/png",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/favicon-black-192x192.png",
          sizes: "192x192",
          type: "image/png",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/favicon-white-32x32.png",
          sizes: "32x32",
          type: "image/png",
          media: "(prefers-color-scheme: dark)",
        },
        {
          url: "/favicon-white-192x192.png",
          sizes: "192x192",
          type: "image/png",
          media: "(prefers-color-scheme: dark)",
        },
        { url: "/favicon-black-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    verification: seo.googleSiteVerification
      ? { google: seo.googleSiteVerification }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${openSans.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link
          rel="icon"
          href="/favicon-black-32x32.png"
          media="(prefers-color-scheme: light)"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon-white-32x32.png"
          media="(prefers-color-scheme: dark)"
          type="image/png"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-white text-neutral-900 font-sans selection:bg-black selection:text-white"
      >
        <ThemeFavicon />
        <Script
          id="strip-extension-bis"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var clean = function() {
                    var els = document.querySelectorAll('[bis_skin_checked]');
                    for (var i = 0; i < els.length; i++) {
                      els[i].removeAttribute('bis_skin_checked');
                    }
                  };
                  clean();
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked' && m.target && m.target.removeAttribute) {
                        m.target.removeAttribute('bis_skin_checked');
                      }
                    }
                  });
                  observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
                } catch(e) {}

                if (typeof window !== 'undefined') {
                  var origError = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var str = String(arguments[i] || '');
                      if (str.indexOf('bis_skin_checked') !== -1 || str.indexOf('bis_skin') !== -1) {
                        return;
                      }
                    }
                    origError.apply(console, arguments);
                  };
                }
              })();
            `,
          }}
        />
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
