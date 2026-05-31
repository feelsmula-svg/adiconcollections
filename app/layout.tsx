import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Noto_Serif } from "next/font/google";
import { NavProgress } from "@/app/components/ui";
import { BottomTabNav } from "@/app/components/bottom-tab-nav";
import { CampaignModal } from "@/app/components/campaign-modal";
import { CartShell } from "@/app/components/cart/cart-shell";
import { getSessionUser } from "@/app/lib/auth/server";
import { getModalCampaigns } from "@/app/lib/campaigns/server";
import { getWishlistIds } from "@/app/lib/wishlist/actions";
import { WishlistProvider } from "@/app/lib/wishlist/wishlist-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const DEFAULT_SITE_URL = "https://www.adiconcollections.com";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return DEFAULT_SITE_URL;
  }
  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(normalized).toString();
  } catch {
    return DEFAULT_SITE_URL;
  }
}

const siteUrl = resolveSiteUrl();
const siteName = "AdiCon Collections";
const siteDescription =
  "100% virgin raw hair bundles, wigs, closures and styling. 30-day returns and free US shipping on orders over $150.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AdiCon Collections — Premium Raw Hair, Direct to You",
    template: "%s | AdiCon Collections",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "raw hair",
    "virgin hair",
    "human hair bundles",
    "lace wigs",
    "lace frontals",
    "closures",
    "body wave hair",
    "straight hair",
    "AdiCon Collections",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName,
    title: "AdiCon Collections — Premium Raw Hair, Direct to You",
    description: siteDescription,
    url: siteUrl,
    locale: "en_US",
    images: [
      {
        url: "/hero.jpeg",
        width: 1200,
        height: 630,
        alt: "AdiCon Collections premium raw hair",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdiCon Collections — Premium Raw Hair, Direct to You",
    description: siteDescription,
    images: ["/hero.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, modalCampaigns] = await Promise.all([
    getSessionUser(),
    getModalCampaigns().catch(() => []),
  ]);
  const wishlistIds = user ? await getWishlistIds() : [];
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerif.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        <WishlistProvider
          initialIds={wishlistIds}
          isAuthenticated={Boolean(user)}
        >
          <CartShell>{children}</CartShell>
          <CampaignModal campaigns={modalCampaigns} />
          <BottomTabNav />
        </WishlistProvider>
      </body>
    </html>
  );
}
