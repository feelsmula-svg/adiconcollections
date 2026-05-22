"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Icon,
  IconButton,
  LinkButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { cn } from "@/app/components/ui/cn";
import { useSession } from "@/app/lib/hooks/use-session";
import { useAuthStore } from "@/app/lib/state/auth-store";
import type { PublicUser } from "@/app/lib/auth/types";
import { AuthModal } from "./auth-modal";

type Size = "sm" | "md" | "lg";

interface AccountButtonProps {
  size?: Size;
  className?: string;
}

interface MenuLink {
  href: string;
  label: string;
  icon: string;
  matches: (pathname: string) => boolean;
}

const CUSTOMER_LINKS: MenuLink[] = [
  {
    href: "/account",
    label: "Dashboard",
    icon: "dashboard",
    matches: (p) => p === "/account",
  },
  {
    href: "/account/profile",
    label: "My account",
    icon: "person",
    matches: (p) => p.startsWith("/account/profile"),
  },
  {
    href: "/account/orders",
    label: "Order history",
    icon: "receipt_long",
    matches: (p) => p.startsWith("/account/orders"),
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: "favorite",
    matches: (p) => p.startsWith("/wishlist"),
  },
  {
    href: "/account/help",
    label: "Help & support",
    icon: "help",
    matches: (p) => p.startsWith("/account/help"),
  },
];

const ADMIN_LINKS: MenuLink[] = [
  {
    href: "/admin",
    label: "Admin dashboard",
    icon: "home",
    matches: (p) => p === "/admin",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: "receipt_long",
    matches: (p) => p.startsWith("/admin/orders"),
  },
  {
    href: "/admin/products",
    label: "Catalog",
    icon: "inventory_2",
    matches: (p) => p.startsWith("/admin/products"),
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: "warehouse",
    matches: (p) => p.startsWith("/admin/inventory"),
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: "group",
    matches: (p) => p.startsWith("/admin/customers"),
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: "forum",
    matches: (p) => p.startsWith("/admin/messages"),
  },
  {
    href: "/admin/campaigns",
    label: "Campaigns",
    icon: "campaign",
    matches: (p) => p.startsWith("/admin/campaigns"),
  },
  {
    href: "/admin/promo-codes",
    label: "Promo codes",
    icon: "confirmation_number",
    matches: (p) => p.startsWith("/admin/promo-codes"),
  },
  {
    href: "/admin/marketing",
    label: "Marketing",
    icon: "trending_up",
    matches: (p) => p.startsWith("/admin/marketing"),
  },
  {
    href: "/admin/taxonomy",
    label: "Taxonomy",
    icon: "category",
    matches: (p) => p.startsWith("/admin/taxonomy"),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: "settings",
    matches: (p) => p.startsWith("/admin/settings"),
  },
];

export function AccountButton({ size = "sm", className }: AccountButtonProps) {
  const { user, status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "authed" && user) {
    return (
      <Box className={cn("relative inline-flex", className)}>
        <Avatar
          initials={getInitials(user)}
          size={size}
          tone="primary"
          label={`Account menu for ${user.name || user.email}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        />
        <AccountDropdown
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          user={user}
        />
      </Box>
    );
  }

  return (
    <>
      <IconButton
        icon="person"
        label="Sign in or create an account"
        size={size}
        variant="plain"
        className={className}
        onClick={() => setAuthOpen(true)}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

interface AccountDropdownProps {
  open: boolean;
  onClose: () => void;
  user: PublicUser;
}

function AccountDropdown({ open, onClose, user }: AccountDropdownProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const signOut = useAuthStore((s) => s.signOut);
  const [signingOut, setSigningOut] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(event.target as Node)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      onClose();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Box
      ref={panelRef}
      role="menu"
      aria-label="Account menu"
      aria-hidden={!open}
      className={cn(
        "absolute right-0 top-[calc(100%+10px)] z-[60] w-[296px] max-w-[calc(100vw-24px)] origin-top-right",
        "rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_24px_48px_-12px_rgba(34,18,8,0.20)] overflow-hidden",
        "transition-all duration-150",
        open
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none",
      )}
    >
      <Box className="relative">
        <Box className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary-fixed/30 to-transparent pointer-events-none" />
        <Box className="relative px-md pt-md pb-md">
          <Row gap="md" align="center">
            <Box className="rounded-full p-[2px] bg-gradient-to-br from-primary to-tertiary">
              <Avatar
                initials={getInitials(user)}
                size="md"
                tone="primary"
                label="Signed in"
                tabIndex={-1}
                className="ring-2 ring-surface-container-lowest"
              />
            </Box>
            <Stack gap="none" className="min-w-0 flex-1">
              <Text
                variant="body-md"
                as="span"
                className="font-semibold truncate"
              >
                {user.name || "Your account"}
              </Text>
              <Text
                variant="body-sm"
                tone="muted"
                as="span"
                className="truncate"
              >
                {user.email}
              </Text>
            </Stack>
          </Row>
        </Box>
      </Box>

      <Divider />

      {user.role === "admin" ? (
        <>
          <Stack gap="none" className="px-xs py-sm">
            <Box className="px-md pb-xs flex items-center justify-between">
              <Text
                variant="label-caps"
                tone="primary"
                as="span"
                className="text-[10px] tracking-[0.18em]"
              >
                Admin
              </Text>
              <Box className="px-xs py-[2px] rounded-full bg-primary-fixed/60 text-primary text-[9px] font-semibold tracking-[0.14em] uppercase">
                Console
              </Box>
            </Box>
            {ADMIN_LINKS.map((link) => (
              <DropdownLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                active={link.matches(pathname)}
                onClick={onClose}
              >
                {link.label}
              </DropdownLink>
            ))}
          </Stack>

          <Divider />

          <Stack gap="none" className="px-xs py-sm">
            <Box className="px-md pb-xs">
              <Text
                variant="label-caps"
                tone="muted"
                as="span"
                className="text-[10px] tracking-[0.18em]"
              >
                Your account
              </Text>
            </Box>
            <DropdownLink
              href="/account"
              icon="storefront"
              active={pathname === "/account"}
              onClick={onClose}
            >
              View customer dashboard
            </DropdownLink>
          </Stack>
        </>
      ) : (
        <Stack gap="none" className="px-xs py-sm">
          <Box className="px-md pb-xs">
            <Text
              variant="label-caps"
              tone="muted"
              as="span"
              className="text-[10px] tracking-[0.18em]"
            >
              Account
            </Text>
          </Box>
          {CUSTOMER_LINKS.map((link) => (
            <DropdownLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              active={link.matches(pathname)}
              onClick={onClose}
            >
              {link.label}
            </DropdownLink>
          ))}
        </Stack>
      )}

      <Divider />

      <Box className="px-xs py-sm">
        <DropdownAction
          icon="logout"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownAction>
      </Box>
    </Box>
  );
}

interface DropdownLinkProps {
  href: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

function DropdownLink({
  href,
  icon,
  active,
  onClick,
  children,
}: DropdownLinkProps) {
  return (
    <LinkButton
      href={href}
      variant="ghost"
      size="sm"
      fullWidth
      caps={false}
      role="menuitem"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative justify-start gap-sm rounded-lg pl-md pr-md py-[10px] text-on-surface",
        active &&
          "bg-primary-fixed/40 text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-r-full before:bg-primary",
      )}
    >
      <Box
        className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
          active
            ? "bg-primary text-on-primary"
            : "bg-surface-container text-on-surface-variant",
        )}
      >
        <Icon name={icon} filled={active} className="text-[18px]" />
      </Box>
      <Text as="span" variant="body-md" className="flex-1 text-left">
        {children}
      </Text>
      {active ? (
        <Icon name="chevron_right" className="text-[18px] text-primary" />
      ) : null}
    </LinkButton>
  );
}

interface DropdownActionProps {
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}

function DropdownAction({
  icon,
  onClick,
  disabled,
  children,
}: DropdownActionProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      fullWidth
      caps={false}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className="justify-start gap-sm rounded-lg px-md py-[10px] text-on-surface-variant"
    >
      <Box className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-[18px]" />
      </Box>
      <Text as="span" variant="body-md">
        {children}
      </Text>
    </Button>
  );
}

function getInitials(user: PublicUser): string {
  const source = (user.name || user.email).trim();
  if (!source) return "•";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return source.slice(0, 2).toUpperCase();
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
