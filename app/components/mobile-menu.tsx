"use client";

import { useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Divider,
  Drawer,
  Heading,
  Icon,
  IconButton,
  Row,
  Stack,
  Text,
  TextLink,
  cn,
} from "@/app/components/ui";
import { useSession } from "@/app/lib/hooks/use-session";
import { useAuthStore } from "@/app/lib/state/auth-store";
import { AuthModal } from "./auth/auth-modal";

interface NavItem {
  label: string;
  href: string;
}

const PRIMARY: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "Wigs", href: "/wigs" },
  { label: "Bundles", href: "/bundles" },
  { label: "Frontals & Closures", href: "/frontals-and-closures" },
  { label: "Accessories", href: "/accessories" },
  { label: "Sale", href: "/sale" },
  { label: "Contact", href: "/contact" },
];

type AccountAction =
  | { kind: "auth"; view: "signin" | "signup" }
  | { kind: "link"; href: string }
  | { kind: "signout" };

interface AccountItem {
  label: string;
  icon: string;
  action: AccountAction;
}

const GUEST_ACCOUNT: AccountItem[] = [
  { label: "Sign In", icon: "person", action: { kind: "auth", view: "signin" } },
  {
    label: "Create an Account",
    icon: "person_add",
    action: { kind: "auth", view: "signup" },
  },
  {
    label: "My Wish List",
    icon: "favorite",
    action: { kind: "link", href: "/wishlist" },
  },
];

const AUTHED_ACCOUNT: AccountItem[] = [
  {
    label: "Dashboard",
    icon: "dashboard",
    action: { kind: "link", href: "/account" },
  },
  {
    label: "Order history",
    icon: "receipt_long",
    action: { kind: "link", href: "/account/orders" },
  },
  {
    label: "My Wish List",
    icon: "favorite",
    action: { kind: "link", href: "/wishlist" },
  },
  {
    label: "Help & support",
    icon: "help",
    action: { kind: "link", href: "/contact" },
  },
  { label: "Sign out", icon: "logout", action: { kind: "signout" } },
];

const AUTHED_ADMIN: AccountItem[] = [
  {
    label: "Admin dashboard",
    icon: "home",
    action: { kind: "link", href: "/admin" },
  },
  {
    label: "Orders",
    icon: "receipt_long",
    action: { kind: "link", href: "/admin/orders" },
  },
  {
    label: "Catalog",
    icon: "inventory_2",
    action: { kind: "link", href: "/admin/products" },
  },
  {
    label: "Inventory",
    icon: "warehouse",
    action: { kind: "link", href: "/admin/inventory" },
  },
  {
    label: "Customers",
    icon: "group",
    action: { kind: "link", href: "/admin/customers" },
  },
  {
    label: "Marketing",
    icon: "trending_up",
    action: { kind: "link", href: "/admin/marketing" },
  },
  {
    label: "Taxonomy",
    icon: "category",
    action: { kind: "link", href: "/admin/taxonomy" },
  },
  {
    label: "Settings",
    icon: "settings",
    action: { kind: "link", href: "/admin/settings" },
  },
  { label: "Sign out", icon: "logout", action: { kind: "signout" } },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  const [signingOut, setSigningOut] = useState(false);
  const close = () => setOpen(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useSession();
  const signOut = useAuthStore((s) => s.signOut);
  const isAuthed = status === "authed" && !!user;
  const isAdmin = isAuthed && user?.role === "admin";
  const accountItems = !isAuthed
    ? GUEST_ACCOUNT
    : isAdmin
      ? AUTHED_ADMIN
      : AUTHED_ACCOUNT;

  const onAccountClick = (
    e: MouseEvent<HTMLAnchorElement>,
    action: AccountAction,
  ) => {
    if (action.kind === "auth") {
      e.preventDefault();
      setAuthView(action.view);
      setAuthOpen(true);
      close();
    } else if (action.kind === "signout") {
      e.preventDefault();
      if (signingOut) return;
      setSigningOut(true);
      void signOut().finally(() => {
        setSigningOut(false);
        close();
        router.push("/");
      });
    } else {
      close();
    }
  };

  return (
    <>
      <IconButton
        icon="menu"
        label="Open menu"
        size="md"
        variant="plain"
        onClick={() => setOpen(true)}
      />
      <Drawer
        open={open}
        onClose={close}
        anchor="left"
        width="sm"
        ariaLabel="Site menu"
      >
        <Row
          justify="between"
          align="center"
          className="px-lg py-md border-b border-outline-variant bg-surface shrink-0"
        >
          <Heading
            level={2}
            variant="headline-sm"
            className="font-display-xl tracking-wide"
          >
            Menu
          </Heading>
          <IconButton
            icon="close"
            label="Close menu"
            size="sm"
            variant="plain"
            onClick={close}
          />
        </Row>

        <Box className="flex-1 overflow-y-auto bg-surface">
          <Stack gap="none">
            {PRIMARY.map((item) => {
              const active = pathname === item.href;
              return (
                <Box key={item.label}>
                  <TextLink
                    href={item.href}
                    variant="bare"
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block px-lg py-md font-display-xl text-body-md uppercase tracking-widest hover:bg-surface-container",
                      active
                        ? "text-primary font-bold bg-surface-container"
                        : "text-on-surface",
                    )}
                  >
                    {item.label}
                  </TextLink>
                  <Divider />
                </Box>
              );
            })}

            <Box className="h-md" />

            {isAuthed && user && (
              <Box className="px-lg py-md bg-surface-container-low">
                <Text
                  variant="label-caps"
                  tone="muted"
                  as="span"
                  className="block"
                >
                  {isAdmin ? "Signed in as admin" : "Signed in as"}
                </Text>
                <Text
                  variant="body-md"
                  as="span"
                  className="font-semibold block truncate"
                >
                  {user.name || user.email}
                </Text>
              </Box>
            )}

            {accountItems.map((item) => {
              const href =
                item.action.kind === "link" ? item.action.href : "#";
              const isSignOut = item.action.kind === "signout";
              return (
                <Box key={item.label}>
                  <TextLink
                    href={href}
                    variant="bare"
                    onClick={(e) => onAccountClick(e, item.action)}
                    aria-disabled={isSignOut && signingOut}
                    className={cn(
                      "flex items-center gap-md px-lg py-md hover:bg-surface-container",
                      isSignOut
                        ? "text-on-surface-variant"
                        : "text-on-surface",
                    )}
                  >
                    <Icon name={item.icon} className="text-xl" />
                    <Text as="span" variant="body-md">
                      {isSignOut && signingOut ? "Signing out…" : item.label}
                    </Text>
                  </TextLink>
                  <Divider />
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Drawer>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialView={authView}
      />
    </>
  );
}
