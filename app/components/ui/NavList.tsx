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

type NavItemSize = "sm" | "md";

const NAV_ITEM_SIZE: Record<NavItemSize, string> = {
  sm: "gap-sm px-md py-xs text-body-sm",
  md: "gap-md px-md py-sm text-body-md",
};

const NAV_ITEM_ICON_SIZE: Record<NavItemSize, string> = {
  sm: "text-lg",
  md: "text-xl",
};

interface NavItemProps
  extends Omit<LinkProps, "className">,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "color"> {
  icon?: string;
  active?: boolean;
  size?: NavItemSize;
  children?: ReactNode;
}

function NavListItem({
  icon,
  active,
  size = "md",
  className,
  children,
  ...rest
}: NavItemProps) {
  return (
    <NextLink
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-lg font-body-md transition-all duration-200",
        "border-l-2 border-transparent",
        NAV_ITEM_SIZE[size],
        active
          ? "bg-primary-fixed/60 text-on-primary-fixed-variant font-semibold border-primary-container shadow-sm"
          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <Icon
          name={icon}
          filled={active}
          className={cn(
            NAV_ITEM_ICON_SIZE[size],
            "transition-transform duration-200 group-hover:scale-110",
          )}
        />
      ) : null}
      <span>{children}</span>
    </NextLink>
  );
}

NavList.Item = NavListItem;
