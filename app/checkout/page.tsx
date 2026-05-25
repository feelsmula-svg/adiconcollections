import { redirect } from "next/navigation";

import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { listAddresses } from "@/app/lib/addresses/actions";
import type { AddressRecord } from "@/app/lib/addresses/types";
import { getSessionUser } from "@/app/lib/auth/server";
import type { PublicUser } from "@/app/lib/auth/types";
import { getShippingSettings } from "@/app/lib/settings/shipping/actions";
import type { ShippingFields } from "@/app/lib/state/checkout-store";
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
  const [shippingSettings, addresses] = await Promise.all([
    getShippingSettings(),
    listAddresses(),
  ]);
  const prefill = buildShippingPrefill(user, addresses);
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <CheckoutContent
          shippingSettings={shippingSettings}
          prefill={prefill}
        />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}

function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function buildShippingPrefill(
  user: PublicUser,
  addresses: AddressRecord[],
): Partial<ShippingFields> {
  const defaultShipping =
    addresses.find((a) => a.isDefaultShipping) ?? addresses[0] ?? null;
  const { firstName, lastName } = defaultShipping
    ? splitName(defaultShipping.name)
    : splitName(user.name);

  return {
    email: user.email,
    firstName,
    lastName,
    address: defaultShipping?.line1 ?? "",
    city: defaultShipping?.city ?? "",
    stateRegion: defaultShipping?.state ?? "",
    zip: defaultShipping?.postal ?? "",
    phone: defaultShipping?.phone ?? user.phone ?? "",
  };
}
