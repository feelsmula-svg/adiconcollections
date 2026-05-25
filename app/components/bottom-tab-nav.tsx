"use client";

import { usePathname } from "next/navigation";

import { Box, Icon, Text, TextLink, cn } from "@/app/components/ui";
import { useSession } from "@/app/lib/hooks/use-session";

interface Tab {
  label: string;
  icon: string;
  href: string;
}

const TABS: Tab[] = [
  { label: "Dashboard", icon: "dashboard", href: "/account" },
  { label: "Orders", icon: "receipt_long", href: "/account/orders" },
  { label: "Wishlist", icon: "favorite", href: "/wishlist" },
  { label: "Help", icon: "help", href: "/contact" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomTabNav() {
  const pathname = usePathname();
  const { user, status } = useSession();

  if (status !== "authed" || !user || user.role === "admin") return null;

  return (
    <>
      {/* Spacer so the last bit of page content can scroll above the fixed nav. */}
      <Box
        aria-hidden
        className="h-[72px] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      />
      <Box
        role="navigation"
        aria-label="Account quick navigation"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-surface border-t border-outline-variant",
          "shadow-[0_-8px_24px_-12px_rgba(34,18,8,0.18)]",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Box className="grid grid-cols-4">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <TextLink
                key={tab.href}
                href={tab.href}
                variant="bare"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-[2px]",
                  "px-xs py-sm text-center transition-colors",
                  "min-h-[64px]",
                  active
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {active ? (
                  <Box
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-b-full bg-primary"
                  />
                ) : null}
                <Icon
                  name={tab.icon}
                  filled={active}
                  className="text-2xl"
                />
                <Text
                  as="span"
                  variant="body-sm"
                  className={cn(
                    "text-[11px] leading-none",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {tab.label}
                </Text>
              </TextLink>
            );
          })}
        </Box>
      </Box>
    </>
  );
}
