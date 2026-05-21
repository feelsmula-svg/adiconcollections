import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { getStorefrontProductsByCategory } from "@/app/lib/products/storefront";

export const metadata: Metadata = {
  title: "Bundles — AdiCon Collections",
  description: "Premium raw-hair bundles and curated multi-piece sets.",
};

export const dynamic = "force-dynamic";

export default async function BundlesPage() {
  const products = await getStorefrontProductsByCategory("bundles", [
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
