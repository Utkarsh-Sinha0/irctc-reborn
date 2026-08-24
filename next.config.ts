import type { NextConfig } from "next";

/* G1-WHY: security + deployment headers — red-team council items (SDE-6): strict
   framing/isolation for a public judged link; ETag reuse; no powered-by leakage.
   G2-BEST: header-level only (no proxy.ts needed at this scope); CSP allows self +
   inline styles (Tailwind runtime is compile-time, but font CSS needs style-src).
   G3-FUTURE: M blast-radius — tightening CSP further could break Motion's style
 * injection; verified against current screens. */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next/Turbopack inlines small scripts/styles; Motion injects styles at runtime:
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
