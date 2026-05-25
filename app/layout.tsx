import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
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

export const metadata: Metadata = {
  title: "AdiCon Collections — Premium Raw Hair, Direct to You",
  description:
    "100% virgin raw hair bundles, closures and styling. 30-day returns and free US shipping on orders over $150.",
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
