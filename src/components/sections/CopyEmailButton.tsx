"use client";

import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/ui/ButtonLink";
import { StatusDot } from "@/components/ui/StatusDot";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";

/** How long "Copied" stays before the label returns. */
const CONFIRM_MS = 2000;

/*
 * Both labels share one grid cell, so the button keeps the width of the
 * longer one. The inactive label is transparent, nudged 4px, and aria-hidden,
 * so the accessible name is always the visible word. Transform and opacity
 * only; the global reduced-motion rule makes the swap instant.
 */
const LABEL =
  "col-start-1 row-start-1 transition-[opacity,transform] duration-(--dur-base) ease-out";

/**
 * Secondary button that copies site.email. On success it shows a lime dot and
 * "Copied" for 2s and announces it politely. Without clipboard access (an
 * insecure context, a denied permission) nothing changes: the mailto button
 * beside it still works.
 */
export function CopyEmailButton({ className }: { className?: string }) {
  // Changes on every successful copy, so a second click restarts the timer.
  const [confirmation, setConfirmation] = useState<number | null>(null);
  const copied = confirmation !== null;

  useEffect(() => {
    if (confirmation === null) return;
    const timer = setTimeout(() => setConfirmation(null), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirmation]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      return;
    }
    setConfirmation((count) => (count ?? 0) + 1);
  }

  return (
    <>
      <button type="button" onClick={copy} className={buttonStyles("secondary", className)}>
        <span className="grid justify-items-center">
          <span
            aria-hidden={copied || undefined}
            className={cn(LABEL, copied && "-translate-y-1 opacity-0")}
          >
            {ui.contact.copyEmail}
          </span>
          <span
            aria-hidden={!copied || undefined}
            className={cn(LABEL, "inline-flex items-center gap-2", !copied && "translate-y-1 opacity-0")}
          >
            <StatusDot />
            {ui.contact.copied}
          </span>
        </span>
      </button>
      {/* Present (empty) from the first render, so the update is announced. */}
      <span role="status" className="sr-only">
        {copied ? ui.contact.copied : ""}
      </span>
    </>
  );
}
