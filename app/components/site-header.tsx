import { TextLink } from "@/app/components/ui";
import { AccountButton } from "./auth/account-button";
import { CartTriggerButton } from "./cart/cart-trigger-button";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { SearchTrigger } from "./search/search-trigger";

export function SiteHeader() {
  return (
    <>
      <div className="bg-on-surface text-white py-2 text-center text-[11px] font-label-caps tracking-widest px-lg">
        FREE US SHIPPING ON ORDERS OVER $150 · SHOP NOW PAY LATER
      </div>

      <div className="bg-surface border-b border-outline-variant py-2 px-lg hidden md:block">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center text-xs font-label-caps">
          <div className="flex gap-md text-on-surface-variant">
            <span>🇺🇸 EN</span>
            <span>Customer Service +1 (800) 555-0117</span>
          </div>
          <div className="flex items-center gap-lg text-on-surface">
            <SearchTrigger variant="inline" />
            <TextLink
              href="/wishlist"
              variant="bare"
              aria-label="Wishlist"
              className="material-symbols-outlined text-[20px] hover:text-primary transition-colors"
            >
              favorite
            </TextLink>
            <AccountButton size="sm" />
            <CartTriggerButton size="sm" />
          </div>
        </div>
      </div>

      <header className="w-full sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-[1400px] mx-auto px-lg">
          <div className="md:hidden grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-md py-md">
            <MobileMenu />
            <SearchTrigger variant="icon" />
            <TextLink
              href="/"
              variant="bare"
              aria-label="AdiCon Collections home"
              className="font-display-xl text-primary text-lg uppercase tracking-widest text-center whitespace-nowrap"
            >
              AdiCon
            </TextLink>
            <AccountButton size="sm" />
            <CartTriggerButton size="sm" />
          </div>

          <div className="hidden md:flex flex-col items-center py-md gap-md">
            <TextLink
              href="/"
              variant="bare"
              aria-label="AdiCon Collections home"
              className="font-display-xl text-primary text-[28px] lg:text-[32px] uppercase tracking-[0.2em] whitespace-nowrap"
            >
              AdiCon Collections
            </TextLink>
            <NavLinks className="flex-wrap justify-center gap-x-lg gap-y-sm" />
          </div>
        </div>
      </header>
    </>
  );
}
