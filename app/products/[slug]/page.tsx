import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { ProductDetail } from "@/app/components/products/product-detail";
import { findStorefrontProduct } from "@/app/lib/products/storefront";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findStorefrontProduct(slug);
  if (!product) {
    return { title: "Product — AdiCon Collections" };
  }
  return {
    title: `${product.name} — AdiCon Collections`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await findStorefrontProduct(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <ProductDetail product={product} />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
