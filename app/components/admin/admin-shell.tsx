"use client";

import { useState, type ReactNode } from "react";

import {
  Box,
  Drawer,
  Heading,
  NavList,
  Stack,
  Text,
} from "@/app/components/ui";
import type { PublicUser } from "@/app/lib/auth/types";

import { AdminBadge } from "./admin-badge";
import { AdminFooter } from "./admin-footer";
import { AdminTopBar } from "./admin-top-bar";

export type AdminNavKey =
  | "dashboard"
  | "orders"
  | "products"
  | "inventory"
  | "customers"
  | "messages"
  | "campaigns"
  | "promo-codes"
  | "marketing"
  | "taxonomy"
  | "settings";

interface NavEntry {
  href: string;
  label: string;
  icon: string;
  key: AdminNavKey;
}

const NAV_ENTRIES: NavEntry[] = [
  { key: "dashboard", href: "/admin", label: "Dashboard", icon: "home" },
  {
    key: "orders",
    href: "/admin/orders",
    label: "Orders",
    icon: "receipt_long",
  },
  {
    key: "products",
    href: "/admin/products",
    label: "Catalog",
    icon: "inventory_2",
  },
  {
    key: "inventory",
    href: "/admin/inventory",
    label: "Inventory",
    icon: "warehouse",
  },
  {
    key: "customers",
    href: "/admin/customers",
    label: "Customers",
    icon: "group",
  },
  {
    key: "messages",
    href: "/admin/messages",
    label: "Messages",
    icon: "forum",
  },
  {
    key: "campaigns",
    href: "/admin/campaigns",
    label: "Campaigns",
    icon: "campaign",
  },
  {
    key: "promo-codes",
    href: "/admin/promo-codes",
    label: "Promo codes",
    icon: "confirmation_number",
  },
  {
    key: "marketing",
    href: "/admin/marketing",
    label: "Marketing",
    icon: "trending_up",
  },
  {
    key: "taxonomy",
    href: "/admin/taxonomy",
    label: "Taxonomy",
    icon: "category",
  },
  {
    key: "settings",
    href: "/admin/settings",
    label: "Settings",
    icon: "settings",
  },
];

interface AdminShellProps {
  user: PublicUser;
  active: AdminNavKey;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function AdminShell({
  user,
  active,
  title,
  subtitle,
  children,
}: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarBody = (
    <Stack gap="lg" className="h-full px-lg py-xl">
      <Stack gap="xs">
        <Heading level={2} variant="headline-md" tone="primary">
          Adicon
        </Heading>
        <Text variant="body-sm" tone="muted">
          Admin Console
        </Text>
      </Stack>

      <NavList
        ariaLabel="Admin sections"
        className="gap-xs flex-grow overflow-y-auto"
      >
        {NAV_ENTRIES.map((entry) => (
          <NavList.Item
            key={entry.key}
            href={entry.href}
            icon={entry.icon}
            active={entry.key === active}
            onClick={() => setDrawerOpen(false)}
          >
            {entry.label}
          </NavList.Item>
        ))}
      </NavList>

      <Box className="mt-auto pt-lg">
        <AdminBadge name={user.name} email={user.email} />
      </Box>
    </Stack>
  );

  return (
    <Box className="flex min-h-screen">
      <Box
        role="navigation"
        aria-label="Admin navigation"
        className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] bg-surface border-r border-outline-variant z-50 flex-col"
      >
        {sidebarBody}
      </Box>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        anchor="left"
        width="sm"
        ariaLabel="Admin navigation"
      >
        {sidebarBody}
      </Drawer>

      <Box className="flex-grow w-full lg:ml-[260px] flex flex-col min-h-screen">
        <AdminTopBar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setDrawerOpen(true)}
          selfUserId={user.id}
        />
        <Box className="flex-grow px-md py-md sm:px-lg sm:py-lg md:px-xl md:py-xl lg:px-2xl">
          <Stack gap="lg" className="md:gap-xl">
            {children}
          </Stack>
        </Box>
        <AdminFooter />
      </Box>
    </Box>
  );
}
