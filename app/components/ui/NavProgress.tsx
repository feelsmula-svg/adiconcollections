"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "./cn";

type Phase = "idle" | "active" | "done";

/**
 * A slim top progress bar that gives instant feedback during client-side
 * navigation — it starts when an in-app link/back-forward navigation begins and
 * completes once the new route commits (detected via pathname/search change).
 *
 * App Router exposes no global router events, so we start the bar from a
 * capture-phase click listener on in-app anchors and finish it when the URL
 * resolves. Mounted once in the root layout.
 */
export function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Snapshot of the URL when a navigation began, so we can ignore the first
  // effect run (initial mount) and only complete on a genuine change.
  const fromKey = useRef<string | null>(null);

  const clearTimers = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (doneRef.current) clearTimeout(doneRef.current);
    tickRef.current = null;
    doneRef.current = null;
  };

  const start = () => {
    const currentKey = `${pathname}?${searchParams}`;
    fromKey.current = currentKey;
    clearTimers();
    setPhase("active");
    setProgress(12);
    // Creep toward — but never reach — 90% while we wait for the route.
    tickRef.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(1, (90 - p) * 0.12) : p));
    }, 200);
  };

  // Begin the bar when a same-origin in-app link is activated.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }
      // External links / different origins: let the browser handle it.
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }
      start();
    };

    const onPopState = () => start();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
    // start closes over pathname/searchParams via fromKey; listeners are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Complete the bar once the URL actually changes.
  useEffect(() => {
    const currentKey = `${pathname}?${searchParams}`;
    if (phase !== "active" || fromKey.current === null) return;
    if (currentKey === fromKey.current) return;
    clearTimers();
    setProgress(100);
    setPhase("done");
    doneRef.current = setTimeout(() => {
      setPhase("idle");
      setProgress(0);
    }, 320);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-x-0 top-0 z-[200] h-0.5 pointer-events-none",
        phase === "idle" && "opacity-0",
      )}
    >
      <div
        className={cn(
          "h-full bg-primary origin-left",
          phase === "done"
            ? "transition-[width,opacity] duration-300 ease-out opacity-0"
            : "transition-[width] duration-200 ease-out",
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
