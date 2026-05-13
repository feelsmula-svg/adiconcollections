"use client";

import { usePathname } from "next/navigation";
import { TextLink, cn } from "@/app/components/ui";

interface NavItem {
  label: string;
  href: string;
}

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "Wigs", href: "/wigs" },
  { label: "Bundles", href: "/bundles" },
  { label: "Frontals & Closures", href: "/frontals-and-closures" },
  { label: "Accessories", href: "/accessories" },
  { label: "Sale", href: "/sale" },
  { label: "Contact", href: "/contact" },
];

interface NavLinksProps {
  className?: string;
}

export function NavLinks({ className }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex items-center font-label-caps text-[11px] tracking-widest uppercase",
        className,
      )}
    >
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <TextLink
            key={item.label}
            href={item.href}
            variant="bare"
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-colors border-b pb-1",
              active
                ? "text-primary border-primary font-bold"
                : "text-on-surface-variant border-transparent hover:text-primary hover:border-primary",
            )}
          >
            {item.label}
          </TextLink>
        );
      })}
    </nav>
  );
}
