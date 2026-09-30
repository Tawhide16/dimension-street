import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { CartProvider } from "@/lib/cartContext";
import CartDrawer from "@/components/cart/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "DIMENSION STREET — Premium Heavyweight Streetwear",
    template: "%s | DIMENSION STREET",
  },
  description:
    "Architectural silhouettes crafted from custom milled 320–480 GSM organic cotton knits. Designed in Dhaka, worn worldwide.",
  keywords: [
    "Dimension Street",
    "streetwear",
    "heavyweight hoodie",
    "oversized tee",
    "tactical pants",
    "Dhaka streetwear",
    "320 GSM",
  ],
  authors: [{ name: "DIMENSION STREET" }],
  openGraph: {
    title: "DIMENSION STREET — Heavyweight Essentials",
    description: "Premium architectural streetwear designed for every dimension.",
    url: "https://dimensionstreet.com",
    siteName: "DIMENSION STREET",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} h-full antialiased scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-white text-neutral-900 font-sans selection:bg-black selection:text-white"
      >
        <Script
          id="anti-extension-hydration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked') return;
                    return origSetAttr.apply(this, arguments);
                  };
                  if (typeof document !== 'undefined') {
                    document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                      el.removeAttribute('bis_skin_checked');
                    });
                    if (window.MutationObserver) {
                      var observer = new MutationObserver(function(mutations) {
                        for (var i = 0; i < mutations.length; i++) {
                          var m = mutations[i];
                          if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                            m.target.removeAttribute('bis_skin_checked');
                          }
                        }
                      });
                      observer.observe(document.documentElement, {
                        attributes: true,
                        subtree: true,
                        attributeFilter: ['bis_skin_checked']
                      });
                    }
                  }
                } catch(e) {}
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
