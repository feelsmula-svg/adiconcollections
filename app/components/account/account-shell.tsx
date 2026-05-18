import type { ReactNode } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  NavList,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import type { PublicUser } from "@/app/lib/auth/types";

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
  const initials = getInitials(user);
  const displayName = user.name || user.email.split("@")[0];

  return (
    <Box className="max-w-[1280px] mx-auto w-full flex">
      <Box
        role="complementary"
        aria-label="Account navigation"
        className="hidden lg:flex flex-col w-[260px] shrink-0 px-lg py-2xl gap-xl border-r border-outline-variant"
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
          <Card variant="tonal" padding="lg" rounded="2xl">
            <Row gap="md" align="center" className="mb-md">
              <Avatar
                initials={initials}
                size="md"
                tone="primary"
                label={`Signed in as ${user.name || user.email}`}
              />
              <Stack gap="none" className="min-w-0">
                <Text
                  variant="body-md"
                  as="span"
                  className="font-semibold truncate"
                >
                  {displayName}
                </Text>
                <Text
                  variant="body-sm"
                  tone="muted"
                  as="span"
                  className="truncate"
                >
                  Premium Member
                </Text>
              </Stack>
            </Row>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              className="rounded-full"
            >
              View Cart
            </Button>
          </Card>
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

function getInitials(user: PublicUser): string {
  const source = (user.name || user.email).trim();
  if (!source) return "•";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return source.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
