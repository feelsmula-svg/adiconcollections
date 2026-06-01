import type { NextConfig } from "next";

// Content-Security-Policy is intentionally permissive for the surfaces we
// actually use (Stripe iframes/scripts, Material Symbols, Google Fonts).
// Tighten further as inline-script usage is removed and assets are pinned.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.stripe.com https://maps.googleapis.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// Canonical host. `www` is the primary domain (see `metadataBase` in
// app/layout.tsx); the bare apex must funnel to it so we never serve the site
// on two hostnames. This is a belt-and-suspenders complement to the redirect
// configured in the Vercel dashboard — if that platform-level rule is ever
// removed, this keeps the canonical direction enforced in code.
const APEX_HOST = "adiconcollections.com";
const CANONICAL_ORIGIN = "https://www.adiconcollections.com";

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats; the optimizer negotiates AVIF/WebP per request.
    formats: ["image/avif", "image/webp"],
    // Cache optimized variants for a week instead of re-running the optimizer
    // on every request.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        // Apex → www. The `has` host condition only matches the bare apex, so
        // requests already on `www` never match — no redirect loop.
        source: "/:path*",
        has: [{ type: "host", value: APEX_HOST }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
