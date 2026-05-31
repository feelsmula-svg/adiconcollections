"use client";

import { useLinkStatus } from "next/link";

import { LinkButton, Spinner } from "@/app/components/ui";

function TabPendingSpinner({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <Spinner
      size="sm"
      tone={active ? "on-primary" : "primary"}
      className="ml-xs"
    />
  );
}

interface TabSpinnerLinkProps {
  href: string;
  label: string;
  active: boolean;
}

/**
 * A filter/tab link that shows an inline spinner on *itself* while its
 * navigation is pending (Next's `useLinkStatus`). Lets a tab switch update only
 * the table area — wrapped in its own `<Suspense>` — instead of triggering the
 * full-page loading skeleton.
 */
export function TabSpinnerLink({ href, label, active }: TabSpinnerLinkProps) {
  return (
    <LinkButton
      href={href}
      variant={active ? "primary" : "ghost"}
      size="sm"
      caps={false}
      prefetch={false}
    >
      {label}
      <TabPendingSpinner active={active} />
    </LinkButton>
  );
}
