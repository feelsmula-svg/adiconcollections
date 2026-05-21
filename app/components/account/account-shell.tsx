import type { ReactNode } from "react";
import { Box, NavList, Stack, Text } from "@/app/components/ui";
import type { PublicUser } from "@/app/lib/auth/types";
import { MemberCard } from "./member-card";

interface NavEntry {
  href: string;
  label: string;
  icon: string;
  key: string;
}

const NAV_ENTRIES: NavEntry[] = [
  { key: "home", href: "/account", label: "Home", icon: "home" },
  {
    key: "profile",
    href: "/account/profile",
    label: "My Account",
    icon: "person",
  },
  {
    key: "orders",
    href: "/account/orders",
    label: "Order History",
    icon: "receipt_long",
  },
  {
    key: "wishlist",
    href: "/wishlist",
    label: "Wishlist",
    icon: "favorite",
  },
  { key: "help", href: "/contact", label: "Help", icon: "help" },
];

interface AccountShellProps {
  user: PublicUser;
  active: NavEntry["key"];
  children?: ReactNode;
}

export function AccountShell({ user, active, children }: AccountShellProps) {
  return (
    <Box className="max-w-[1280px] mx-auto w-full flex items-start">
      <Box
        role="complementary"
        aria-label="Account navigation"
        className="hidden lg:flex flex-col w-[260px] shrink-0 px-lg py-2xl gap-xl border-r border-outline-variant lg:sticky lg:top-[112px] lg:self-start lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto"
      >
        <Stack gap="md">
          <Text
            variant="label-caps"
            tone="muted"
            as="span"
            className="tracking-[0.18em]"
          >
            Account Menu
          </Text>
        </Stack>

        <NavList ariaLabel="Account sections" className="gap-xs">
          {NAV_ENTRIES.map((entry) => (
            <NavList.Item
              key={entry.key}
              href={entry.href}
              icon={entry.icon}
              active={entry.key === active}
            >
              {entry.label}
            </NavList.Item>
          ))}
        </NavList>

        <Box className="mt-auto">
          <MemberCard
            fallbackName={user.name}
            fallbackEmail={user.email}
          />
        </Box>
      </Box>

      <Box className="flex-1 min-w-0 px-md py-lg md:px-2xl md:py-2xl">
        <Stack gap="xl" className="md:gap-2xl">
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
