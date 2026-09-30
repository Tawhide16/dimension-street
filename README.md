# DIMENSION STREET — Full-Stack E-Commerce Platform

A production-ready, architectural fashion e-commerce storefront and real-time Admin CMS built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB / Mongoose**.

---

## 💎 Brand & Design Direction

- **Brand Identity**: Original premium streetwear brand featuring custom 3D isometric cube logo typography and monochrome luxury aesthetics.
- **Palette**: Pitch Black (`#000000`), Dark Carbon (`#111111`), Off-White Ecru (`#F5F5F2`), Pure White (`#FFFFFF`), Border Gray (`#E5E5E5`).
- **Typography**: Inter (modern neutral sans) + Montserrat / Courier (streetwear SKUs and tactical accents).
- **Inspirations**:
  - Storefront editorial flow inspired by heavyweight streetwear capsule drops.
  - Technical product details inspired by luxury technical apparel.
  - Live Selling Dashboard with real-time KPI cards, dynamic order feeds, and live revenue calculations directly from the database.

---

## ⚡ Tech Stack

- **Framework**: Next.js 16 (App Router + Server Actions / API Routes)
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Icons & Animation**: Lucide Icons, Canvas Confetti
- **Database**: MongoDB Atlas with Mongoose (with hybrid fallback persistence for zero-config offline execution)
- **Payment Abstraction**: Cash on Delivery (COD), bKash Merchant Pay, Nagad, and Credit/Debit Cards (Stripe architecture)
- **State Management**: React Context (`CartProvider` with LocalStorage sync for cart items, wishlist, and promo codes)

---

## 📁 System Architecture & Routes

### Customer Storefront
| Route | Description |
| :--- | :--- |
| `/` | Editorial Homepage: Hero banner, New Arrivals grid, Countdown promo banner, Category taxonomy, Brand story, Bestsellers, Community feed |
| `/shop` | Full product catalog with real-time search, category/collection filters, size & color pickers, price range slider, and sorting |
| `/product/[slug]` | Luxury product detail view: multi-image gallery, variant switcher, stock availability counter, size guide table, spec accordions, and related products |
| `/collections` | Capsule drops overview: New Arrivals, Heavyweight Essentials, Dimension Core, Summer Drop, Limited Edition |
| `/collections/[slug]` | Dedicated capsule view with custom editorial hero banners |
| `/search` | Vault search engine with instant query matching across titles, SKUs, and tags |
| `/cart` | Bag overview with quantity selectors, line prices, and checkout link |
| `/checkout` | 3-step checkout: Contact info, Shipping address, Payment selection (COD / bKash / Card), and Order Summary |
| `/checkout/success` | Order confirmation screen with celebratory confetti, tracking number, and printable receipt |
| `/account` | Customer account portal with real purchase history, order statuses, and saved addresses |
| `/account/wishlist` | Interactive saved garments grid |
| `/about`, `/shipping` | Atelier origin story, shipping rates, and delivery times |

### Admin CMS Dashboard
| Route | Description |
| :--- | :--- |
| `/admin` | **Live Selling Dashboard**: 6 real-time KPI cards (Real-time Revenue in USD & BDT, Total Orders, Actual Customers, Active Catalog, Fulfillment Rate, AOV), Live Revenue Trend chart, and Top Selling items |
| `/admin/products` | Product Catalog CRUD: view all 16 items, add new garment modal, price & stock counters, badges, and deletion |
| `/admin/orders` | Live customer orders feed with real-time status switcher (`Pending`, `Confirmed`, `Processing`, `Packed`, `Shipped`, `Delivered`, `Cancelled`) and order details inspection |
| `/admin/coupons` | Promo codes management (`WELCOME10`, `DIMENSION20`, `FREESHIP`, `STREET50`) with instant creation |
| `/admin/cms` | Homepage Builder: toggle section visibility, edit headlines, and publish to live storefront |
| `/admin/media` | Media asset gallery with one-click CDN URL copying |
| `/admin/seo` | Search engine optimization, meta descriptions, and OpenGraph social cards |
| `/admin/users` | Admin users and Role-Based Access Control (Super Admin / Customer) |

---

## 🚀 Running the Project

```bash
# 1. Install dependencies (already installed)
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser
http://localhost:3000          # Storefront
http://localhost:3000/admin     # Admin CMS Dashboard
```

---

## 💳 Testing Checkout & Real-Time Analytics

1. Go to `http://localhost:3000/shop` and pick any piece (e.g. *DIMENSION Isometric Heavyweight Tee*).
2. Select your size, open the *Size Guide* accordion, and click **ADD TO BAG**.
3. In the slide-out Cart Drawer, apply promo code **`WELCOME10`** to receive a 10% discount.
4. Click **Proceed to Checkout**, fill in your delivery details, select **Cash on Delivery** or **bKash**, and click **PLACE ORDER NOW**.
5. After seeing the confetti on `/checkout/success`, visit `/admin` to watch the **Real-Time Revenue**, **Total Orders**, and **Live Customer Orders** update instantly with your real purchase!
