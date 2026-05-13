import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "Contact — AdiCon Collections",
  description: "Reach our concierge team for questions, styling and orders.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <ContactContent />
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
