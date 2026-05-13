import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { productsByKeywords } from "@/app/lib/products/catalog";

export const metadata: Metadata = {
  title: "Frontals & Closures — AdiCon Collections",
  description: "HD lace frontals, closures and silk-base units.",
};

export default function FrontalsAndClosuresPage() {
  const products = productsByKeywords(["lace", "frontal", "closure"]);
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CollectionContent
          title="Frontals & Closures"
          breadcrumbLabel="Frontals & Closures"
          products={products}
        />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
