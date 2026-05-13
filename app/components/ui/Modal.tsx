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

type Width = "sm" | "md" | "lg";

const WIDTH: Record<Width, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[480px]",
  lg: "max-w-[560px]",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  width?: Width;
  ariaLabel?: string;
  children?: ReactNode;
}

export function Modal({
  open,
  onClose,
  width = "md",
  ariaLabel,
  children,
}: ModalProps) {
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-md",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-200",
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
          "relative w-full bg-surface rounded-xl shadow-2xl outline-none overflow-hidden",
          "flex flex-col max-h-[calc(100dvh-2rem)]",
          "transition-all duration-200 ease-out",
          WIDTH[width],
          open ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
