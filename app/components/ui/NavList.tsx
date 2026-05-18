import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { Icon } from "./Icon";

interface NavListProps {
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
}

export function NavList({ ariaLabel, className, children }: NavListProps) {
  return (
    <nav aria-label={ariaLabel} className={cn("flex flex-col gap-xs", className)}>
      {children}
    </nav>
  );
}

interface NavItemProps
  extends Omit<LinkProps, "className">,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "color"> {
  icon?: string;
  active?: boolean;
  children?: ReactNode;
}

function NavListItem({
  icon,
  active,
  className,
  children,
  ...rest
}: NavItemProps) {
  return (
    <NextLink
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-md px-md py-sm rounded-lg font-body-md text-body-md transition-colors",
        active
          ? "bg-surface-variant text-primary font-bold"
          : "text-on-surface-variant hover:bg-surface-container",
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} filled={active} className="text-xl" /> : null}
      <span>{children}</span>
    </NextLink>
  );
}

NavList.Item = NavListItem;
