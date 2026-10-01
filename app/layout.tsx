import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
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
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
