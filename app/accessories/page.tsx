import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CollectionContent } from "@/app/components/products/collection-content";
import { ACCESSORIES } from "@/app/lib/products/catalog";

export const metadata: Metadata = {
  title: "Accessories — AdiCon Collections",
  description: "Brushes, clips, combs and styling tools.",
};

export default function AccessoriesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CollectionContent
          title="Accessories"
          breadcrumbLabel="Accessories"
          products={ACCESSORIES}
        />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
