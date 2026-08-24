import type { MetadataRoute } from "next";

/* G1-WHY: robots — public judged link should be crawlable but keep API paths out.
   G2-BEST: app-router convention file. G3-FUTURE: S. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
  };
}
