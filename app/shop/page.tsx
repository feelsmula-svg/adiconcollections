import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { allProducts } from "@/app/lib/products/catalog";

export const metadata: Metadata = {
  title: "Shop All — AdiCon Collections",
  description:
    "The full collection of meticulously sourced hair extensions and treatments.",
};

export default function ShopPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CollectionContent
          title="The Full Collection"
          breadcrumbLabel="Shop All"
          products={allProducts()}
        />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
