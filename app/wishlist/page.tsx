import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { WishlistContent } from "./wishlist-content";

export const metadata: Metadata = {
  title: "Wish List — AdiCon Collections",
  description: "Pieces you've saved to revisit later.",
};

export default function WishlistPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <WishlistContent />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
