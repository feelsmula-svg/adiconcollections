import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { getAllStorefrontProducts } from "@/app/lib/products/storefront";

export const metadata: Metadata = {
  title: "Shop All — AdiCon Collections",
  description:
    "The full collection of meticulously sourced hair extensions and treatments.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getAllStorefrontProducts();
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CollectionContent
          title="The Full Collection"
          breadcrumbLabel="Shop All"
          products={products}
        />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
