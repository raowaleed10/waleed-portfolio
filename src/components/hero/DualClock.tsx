"use client";

import type { CSSProperties } from "react";
import { StatusDot } from "@/components/ui/StatusDot";
import { clock } from "@/content/hero";
import { cn } from "@/lib/cn";
import { getClockState, MAX_TIME_LENGTH, maxMessageLength } from "@/lib/time";
import { useNow } from "./useNow";

/** Fills each time box until the browser knows the time. */
const PLACEHOLDER = "--:--";

/*
 * Reserved widths, in ch. Geist Mono draws every glyph 1ch wide, so the boxes
 * below are exactly as wide as their longest possible content: the real times
 * replace the placeholder without moving anything (no layout shift).
 */
const reservedWidths = {
  "--clock-time-w": `${MAX_TIME_LENGTH}ch`,
  // Status dot (0.5rem) + gap (0.5rem) + the longest possible message.
  "--clock-message-w": `calc(${maxMessageLength(clock)}ch + 1rem)`,
} as CSSProperties;

/**
 * Live Lahore and New York times plus the online / off-hours line.
 *
 * The server and the hydration render have no time (useNow() is null), so both
 * show the same placeholder: "--:--" in fixed-width boxes, a muted dot and an
 * empty status line of fixed height. The browser then fills in the real values
 * and refreshes them every 30s. No aria-live: announcing the time every 30s
 * would be noise.
 *
 * Layout: label/value rows on phones; one row with hairline dividers from md.
 * From xl, StatusBar puts the status line beside this, so the message cell
 * keeps its full width reserved there too.
 */
export function DualClock({ className }: { className?: string }) {
  const now = useNow();
  const state = now === null ? null : getClockState(new Date(now), clock);
  const zones = [
    { zone: clock.home, time: state?.homeTime },
    { zone: clock.remote, time: state?.remoteTime },
  ];

  return (
    <div
      style={reservedWidths}
      className={cn(
        // From md, padding beside each hairline does the spacing (no gaps).
        "flex flex-col gap-3 font-mono text-xs text-muted md:flex-row md:items-center md:gap-0",
        className,
      )}
    >
      <dl className="grid grid-cols-[auto_auto] justify-start gap-x-4 gap-y-1 md:flex md:items-center md:gap-0">
        {zones.map(({ zone, time }, index) => (
          <div
            key={zone.timeZone}
            className={cn(
              "contents md:flex md:items-baseline md:gap-2 md:pr-4",
              index > 0 && "md:border-l md:border-border md:pl-4",
            )}
          >
            <dt className="label">{zone.label}</dt>
            <dd className="whitespace-nowrap">
              <time
                dateTime={state?.iso}
                className="inline-block w-(--clock-time-w) text-right text-fg"
              >
                {time ?? <span aria-hidden>{PLACEHOLDER}</span>}
              </time>{" "}
              {zone.abbr}
            </dd>
          </div>
        ))}
      </dl>
      <p className="flex min-h-4 items-center gap-2 md:border-l md:border-border md:pl-4 xl:min-w-(--clock-message-w)">
        <StatusDot tone={state?.online ? "signal" : "muted"} />
        <span>{state?.message}</span>
      </p>
    </div>
  );
}
