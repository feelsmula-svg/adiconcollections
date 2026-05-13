"use client";

import { useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
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
  | { kind: "link"; href: string };

interface AccountItem {
  label: string;
  icon: string;
  action: AccountAction;
}

const ACCOUNT: AccountItem[] = [
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

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  const close = () => setOpen(false);
  const pathname = usePathname();

  const onAccountClick = (
    e: MouseEvent<HTMLAnchorElement>,
    action: AccountAction,
  ) => {
    if (action.kind === "auth") {
      e.preventDefault();
      setAuthView(action.view);
      setAuthOpen(true);
      close();
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

            {ACCOUNT.map((item) => {
              const href =
                item.action.kind === "link" ? item.action.href : "#";
              return (
                <Box key={item.label}>
                  <TextLink
                    href={href}
                    variant="bare"
                    onClick={(e) => onAccountClick(e, item.action)}
                    className="flex items-center gap-md px-lg py-md text-on-surface hover:bg-surface-container"
                  >
                    <Icon name={item.icon} className="text-xl" />
                    <Text as="span" variant="body-md">
                      {item.label}
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
