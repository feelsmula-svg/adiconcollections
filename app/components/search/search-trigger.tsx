"use client";

import { useState } from "react";

import { Button, Icon, IconButton, Text } from "@/app/components/ui";
import { SearchDialog } from "./search-dialog";

interface SearchTriggerProps {
  variant?: "inline" | "icon";
  className?: string;
}

export function SearchTrigger({
  variant = "inline",
  className,
}: SearchTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <IconButton
          icon="search"
          label="Open search"
          size="sm"
          variant="plain"
          className={className}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          caps={false}
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className={`justify-between gap-sm w-48 border-b border-outline rounded-none px-0 py-1 text-on-surface-variant hover:text-primary hover:bg-transparent ${className ?? ""}`}
        >
          <Text as="span" variant="body-sm" tone="muted" className="text-xs">
            Search the collection
          </Text>
          <Icon name="search" className="text-sm" />
        </Button>
      )}
      <SearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
