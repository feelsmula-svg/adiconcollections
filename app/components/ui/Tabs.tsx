"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "./cn";

interface TabsContextValue {
  value: string;
  setValue: (next: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs subcomponents must be rendered inside <Tabs>");
  }
  return ctx;
}

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (next: string) => void;
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
}

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  ariaLabel,
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const baseId = useId();

  function setValue(next: string) {
    if (controlled === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div
        role="region"
        aria-label={ariaLabel}
        className={cn("flex flex-col gap-lg", className)}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
}

function TabsList({ ariaLabel, className, children }: TabsListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  function focusTab(index: number) {
    const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]:not([disabled])',
    );
    if (!tabs || tabs.length === 0) return;
    const wrapped = (index + tabs.length) % tabs.length;
    tabs[wrapped].focus();
    tabs[wrapped].click();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ) ?? [],
    );
    if (tabs.length === 0) return;
    const currentIndex = tabs.findIndex(
      (tab) => tab === document.activeElement,
    );
    if (currentIndex === -1) return;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(currentIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center gap-xs p-xs rounded-full bg-surface-container-low border border-outline-variant max-w-full overflow-x-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  count?: number;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

function TabsTrigger({
  value,
  count,
  disabled,
  children,
  className,
}: TabsTriggerProps) {
  const { value: active, setValue, baseId } = useTabsContext();
  const isActive = value === active;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center gap-xs whitespace-nowrap px-lg py-sm rounded-full text-label-md font-semibold tracking-wide transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive
          ? "bg-primary text-on-primary shadow-sm"
          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        className,
      )}
    >
      <span>{children}</span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[20px] px-xs h-[18px] rounded-full text-label-caps",
            isActive
              ? "bg-on-primary/20 text-on-primary"
              : "bg-surface-container-high text-on-surface-variant",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

interface TabsPanelProps {
  value: string;
  children?: ReactNode;
  className?: string;
}

function TabsPanel({ value, children, className }: TabsPanelProps) {
  const { value: active, baseId } = useTabsContext();
  const isActive = value === active;
  if (!isActive) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      className={className}
    >
      {children}
    </div>
  );
}

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Panel = TabsPanel;
