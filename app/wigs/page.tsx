import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { getStorefrontProductsByCategory } from "@/app/lib/products/storefront";

export const metadata: Metadata = {
  title: "Wigs — AdiCon Collections",
  description:
    "Luxury raw-hair wigs — blunt cuts, bangs, bobs, ponytails and more.",
};

export const dynamic = "force-dynamic";

export default async function WigsPage() {
  const products = await getStorefrontProductsByCategory("wigs", [
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
