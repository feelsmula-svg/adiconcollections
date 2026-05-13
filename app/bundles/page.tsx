import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { productsByKeywords } from "@/app/lib/products/catalog";

export const metadata: Metadata = {
  title: "Bundles — AdiCon Collections",
  description: "Premium raw-hair bundles and curated multi-piece sets.",
};

export default function BundlesPage() {
  const products = productsByKeywords([
    "bundle",
    "set",
    "wave",
    "straight",
    "curl",
  ]);
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CollectionContent
          title="Bundles"
          breadcrumbLabel="Bundles"
          products={products}
        />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
