"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { Box, Drawer, Heading, NavList, Row, Stack, Text } from "@/app/components/ui";
import type { PublicUser } from "@/app/lib/auth/types";

import { AdminBadge } from "./admin-badge";

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

interface NavSection {
  label: string;
  items: NavEntry[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { key: "dashboard", href: "/admin", label: "Dashboard", icon: "home" },
    ],
  },
  {
    label: "Storefront",
    items: [
      { key: "orders", href: "/admin/orders", label: "Orders", icon: "receipt_long" },
      { key: "products", href: "/admin/products", label: "Catalog", icon: "inventory_2" },
      { key: "inventory", href: "/admin/inventory", label: "Inventory", icon: "warehouse" },
      { key: "customers", href: "/admin/customers", label: "Customers", icon: "group" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { key: "messages", href: "/admin/messages", label: "Messages", icon: "forum" },
      { key: "campaigns", href: "/admin/campaigns", label: "Campaigns", icon: "campaign" },
      {
        key: "promo-codes",
        href: "/admin/promo-codes",
        label: "Promo codes",
        icon: "confirmation_number",
      },
      { key: "marketing", href: "/admin/marketing", label: "Marketing", icon: "trending_up" },
    ],
  },
  {
    label: "Setup",
    items: [
      { key: "taxonomy", href: "/admin/taxonomy", label: "Taxonomy", icon: "category" },
      { key: "settings", href: "/admin/settings", label: "Settings", icon: "settings" },
    ],
  },
];

function deriveActive(pathname: string): AdminNavKey {
  if (pathname === "/admin") return "dashboard";
  const segment = pathname.replace(/^\/admin\//, "").split("/")[0];
  const known: AdminNavKey[] = [
    "orders",
    "products",
    "inventory",
    "customers",
    "messages",
    "campaigns",
    "promo-codes",
    "marketing",
    "taxonomy",
    "settings",
  ];
  return (known.find((k) => k === segment) as AdminNavKey) ?? "dashboard";
}

interface AdminNavValue {
  openNav: () => void;
  selfUserId: string;
}

const AdminNavContext = createContext<AdminNavValue | null>(null);

/** Access the persistent admin chrome (drawer toggle + current admin id). */
export function useAdminNav(): AdminNavValue {
  const value = useContext(AdminNavContext);
  if (!value) {
    throw new Error("useAdminNav must be used within AdminFrame");
  }
  return value;
}

interface AdminFrameProps {
  user: PublicUser;
  children?: ReactNode;
}

/**
 * Persistent admin chrome rendered by the admin layout: the sidebar (desktop +
 * mobile drawer) stays mounted across navigations, so route-level loading shows
 * only in the content column. Pages render their own top bar via `AdminPage`.
 */
export function AdminFrame({ user, children }: AdminFrameProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const active = deriveActive(pathname);

  const sidebarBody = (
    <Stack gap="md" className="min-h-full px-md py-md">
      <Row gap="sm" align="center" className="px-sm pt-xs">
        <Box className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center shadow-sm">
          <Text
            as="span"
            variant="label-caps"
            className="text-on-primary-container font-bold tracking-normal text-base"
          >
            A
          </Text>
        </Box>
        <Stack gap="none" className="flex-1 min-w-0">
          <Heading level={2} variant="headline-sm" tone="primary" className="leading-none">
            Adicon
          </Heading>
          <Text
            variant="label-caps"
            tone="muted"
            as="span"
            className="text-[10px] tracking-[0.18em]"
          >
            Admin Console
          </Text>
        </Stack>
      </Row>

      <NavList ariaLabel="Admin sections" className="gap-md flex-grow">
        {NAV_SECTIONS.map((section) => (
          <Stack gap="xs" key={section.label}>
            <Text
              as="span"
              variant="label-caps"
              tone="muted"
              className="px-sm text-[10px] tracking-[0.18em] opacity-80"
              aria-hidden
            >
              {section.label}
            </Text>
            <Stack gap="xs">
              {section.items.map((entry) => (
                <NavList.Item
                  key={entry.key}
                  href={entry.href}
                  icon={entry.icon}
                  active={entry.key === active}
                  size="sm"
                  onClick={() => setDrawerOpen(false)}
                >
                  {entry.label}
                </NavList.Item>
              ))}
            </Stack>
          </Stack>
        ))}
      </NavList>

      <Box className="mt-auto pt-sm border-t border-outline-variant">
        <AdminBadge name={user.name} email={user.email} />
      </Box>
    </Stack>
  );

  return (
    <AdminNavContext.Provider
      value={{ openNav: () => setDrawerOpen(true), selfUserId: user.id }}
    >
      <Box className="flex min-h-screen">
        <Box
          role="navigation"
          aria-label="Admin navigation"
          className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] bg-surface border-r border-outline-variant z-50 flex-col overflow-y-auto"
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
          {children}
        </Box>
      </Box>
    </AdminNavContext.Provider>
  );
}
