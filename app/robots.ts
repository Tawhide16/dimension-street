import { MetadataRoute } from "next";
import { getSeoConfig } from "@/lib/dataService";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoConfig();
  const baseUrl = seo.canonicalUrl || "https://dimensionstreet.com";

  if (!seo.robotsIndex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/checkout/success"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
