import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CheckoutContent } from "./checkout-content";

export const metadata = {
  title: "Checkout — AdiCon Collections",
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CheckoutContent />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
