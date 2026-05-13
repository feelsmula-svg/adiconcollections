import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { productsByKeywords } from "@/app/lib/products/catalog";

export const metadata: Metadata = {
  title: "Wigs — AdiCon Collections",
  description:
    "Luxury raw-hair wigs — blunt cuts, bangs, bobs, ponytails and more.",
};

export default function WigsPage() {
  const products = productsByKeywords([
    "wig",
    "blunt",
    "bangs",
    "bob",
    "ponytail",
  ]);
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CollectionContent
          title="Wigs"
          breadcrumbLabel="Wigs"
          products={products}
        />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
