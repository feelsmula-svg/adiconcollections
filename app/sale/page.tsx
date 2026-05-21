import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { getAllStorefrontProducts } from "@/app/lib/products/storefront";

export const metadata: Metadata = {
  title: "Sale — AdiCon Collections",
  description: "Limited-time markdowns across the AdiCon collection.",
};

export const dynamic = "force-dynamic";

const SALE_THRESHOLD_CENTS = 16_900;

export default async function SalePage() {
  const all = await getAllStorefrontProducts();
  const products = all.filter((p) => p.priceCents <= SALE_THRESHOLD_CENTS);
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
