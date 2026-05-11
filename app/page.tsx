import { BundleDeals } from "./components/bundle-deals";
import { Hero } from "./components/hero";
import { ProductGrid } from "./components/product-grid";
import { QuickFilters } from "./components/quick-filters";
import { Reviews } from "./components/reviews";
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
      <main className="w-full">
        <div className="max-w-[1200px] mx-auto w-full">
          <Hero />
          <TrustStrip />
          <ShopByTexture />
        </div>
        <section className="relative">
          <QuickFilters />
          <div className="max-w-[1200px] mx-auto w-full">
            <ProductGrid />
          </div>
        </section>
        <div className="max-w-[1200px] mx-auto w-full">
          <BundleDeals />
          <UGCGrid />
          <Reviews />
        </div>
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
