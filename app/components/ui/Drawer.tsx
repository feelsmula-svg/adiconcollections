"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

type Anchor = "right" | "left";
type Width = "sm" | "md" | "lg" | "xl";

const WIDTH: Record<Width, string> = {
  sm: "max-w-[94vw] sm:max-w-[400px]",
  md: "max-w-[94vw] sm:max-w-[480px]",
  lg: "max-w-[94vw] sm:max-w-[560px]",
  xl: "max-w-[94vw] sm:max-w-[640px]",
};

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  anchor?: Anchor;
  width?: Width;
  ariaLabel?: string;
  children?: ReactNode;
}

export function Drawer({
  open,
  onClose,
  anchor = "right",
  width = "lg",
  ariaLabel,
  children,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  if (!mounted) return null;

  const translateClosed =
    anchor === "right" ? "translate-x-full" : "-translate-x-full";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className={cn(
          "absolute top-0 h-full w-full flex flex-col bg-surface-container-low border-l border-outline-variant outline-none",
          "transition-transform duration-300 ease-out",
          WIDTH[width],
          anchor === "right" && "right-0",
          anchor === "left" && "left-0",
          open ? "translate-x-0" : translateClosed,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
