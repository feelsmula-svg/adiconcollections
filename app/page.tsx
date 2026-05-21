import { BundleDeals } from "./components/bundle-deals";
import { Hero } from "./components/hero";
import { ProductGrid } from "./components/product-grid";
import { ShopByTexture } from "./components/shop-by-texture";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StickyActions } from "./components/sticky-actions";
import { TrustStrip } from "./components/trust-strip";
import { UGCGrid } from "./components/ugc-grid";
import { getFeaturedStorefrontProducts } from "./lib/products/storefront";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await getFeaturedStorefrontProducts();

  return (
    <>
      <SiteHeader />
      <main className="max-w-[1400px] mx-auto w-full">
        <Hero />
        <TrustStrip />
        <ShopByTexture />
        <ProductGrid products={featuredProducts} />
        <BundleDeals />
        <UGCGrid />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
