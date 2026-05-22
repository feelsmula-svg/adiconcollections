import { Suspense } from "react";

import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { CheckoutSuccessContent } from "./success-content";

export const metadata = {
  title: "Order confirmed — AdiCon Collections",
};

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <Suspense fallback={null}>
          <CheckoutSuccessContent />
        </Suspense>
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
