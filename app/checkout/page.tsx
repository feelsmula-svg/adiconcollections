import { redirect } from "next/navigation";

import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { getSessionUser } from "@/app/lib/auth/server";
import { getShippingSettings } from "@/app/lib/settings/shipping/actions";
import { CheckoutContent } from "./checkout-content";

export const metadata = {
  title: "Checkout — AdiCon Collections",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/?signin=1&next=/checkout");
  }
  const shippingSettings = await getShippingSettings();
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CheckoutContent shippingSettings={shippingSettings} />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
