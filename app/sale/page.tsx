import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { productsOnSale } from "@/app/lib/products/catalog";

export const metadata: Metadata = {
  title: "Sale — AdiCon Collections",
  description: "Limited-time markdowns across the AdiCon collection.",
};

const SALE_THRESHOLD_CENTS = 16_900;

export default function SalePage() {
  const products = productsOnSale(SALE_THRESHOLD_CENTS);
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CollectionContent
          title="Sale"
          breadcrumbLabel="Sale"
          products={products}
          emptyTitle="No sale pieces right now"
          emptyDescription="Check back soon — we rotate markdowns weekly."
        />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
