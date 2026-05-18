import { BundleDeals } from "./components/bundle-deals";
import { Hero } from "./components/hero";
import { ProductGrid } from "./components/product-grid";
import { ShopByTexture } from "./components/shop-by-texture";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StickyActions } from "./components/sticky-actions";
import { TrustStrip } from "./components/trust-strip";
import { UGCGrid } from "./components/ugc-grid";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-[1400px] mx-auto w-full">
        <Hero />
        <TrustStrip />
        <ShopByTexture />
        <ProductGrid />
        <BundleDeals />
        <UGCGrid />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
