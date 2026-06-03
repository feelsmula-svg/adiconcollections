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
      // Vercel Blob CDN — add once BLOB_READ_WRITE_TOKEN is configured
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],

    // Serve AVIF first (smallest), then WebP, then original format.
    // Browsers negotiate via Accept header automatically.
    formats: ["image/avif", "image/webp"],

    // Match device widths used by the product grid and hero.
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache optimized variants on the CDN for 30 days.
    // Default is 60 seconds — re-optimizes constantly for every unique URL.
    minimumCacheTTL: 60 * 60 * 24 * 30,

    dangerouslyAllowSVG: false,
  },

  // Compress responses — reduces HTML/JSON transfer size.
  compress: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Next.js hashed static assets are immutable — cache for 1 year.
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Public folder assets (images, icons) — cache 7 days, revalidate in background.
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|webp|avif|svg|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;