import { useEffect, useState, type RefObject } from "react";
import type { IncidentId } from "@/content/types";
import { prefersReducedMotion } from "@/lib/motion";
import { FLIP_VISIBLE_RATIO, flipDelayMs, type IncidentStatusPhase } from "./IncidentLogic";

export type StatusPhases = Readonly<Partial<Record<IncidentId, IncidentStatusPhase>>>;

/** Rows carry `data-incident-row="INC-01"` (IncidentRow's heading). */
const ROW_SELECTOR = "[data-incident-row]";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** IntersectionObserver ratios can land a hair under a threshold they crossed. */
const RATIO_EPSILON = 0.001;

/**
 * Orchestrates the amber → lime status flip for every row inside `containerRef`.
 *
 * - Server render and hydration: no phases, so every row is "resolved" (lime,
 *   label visible), and the first client render equals the server's.
 * - After hydration, the observer's first report sorts the rows. Rows already
 *   on screen (any part, below the sticky nav) stay resolved and are never
 *   watched again. Rows off screen turn "pending" (amber, label hidden),
 *   which nobody sees.
 * - A pending row that is at least 60% visible for 250ms turns "resolving":
 *   the flip plays once and the row is no longer watched. Rows that arrive
 *   together resolve 120ms apart, top first.
 * - Reduced motion (at load or switched on later): everything stays or goes
 *   back to resolved, and nothing is watched.
 */
export function useIncidentStatusFlip(containerRef: RefObject<HTMLElement | null>): StatusPhases {
  const [phases, setPhases] = useState<StatusPhases>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined" || prefersReducedMotion()) return;

    const rows = Array.from(container.querySelectorAll<HTMLElement>(ROW_SELECTOR));
    const idOf = (row: Element) => (row as HTMLElement).dataset.incidentRow as IncidentId;
    const setPhase = (row: Element, phase: IncidentStatusPhase) =>
      setPhases((current) => ({ ...current, [idOf(row)]: phase }));

    // Rows hidden behind the sticky nav are not on screen.
    const navHeight =
      Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) ||
      0;

    const sorted = new Set<Element>();
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const cancel = (row: Element) => {
      clearTimeout(timers.get(row));
      timers.delete(row);
    };

    const observer = new IntersectionObserver(
      (records) => {
        let batch = 0;
        // Top row first, whatever order the records arrive in.
        const ordered = [...records].sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        for (const record of ordered) {
          const row = record.target;
          if (!sorted.has(row)) {
            sorted.add(row);
            if (record.isIntersecting) observer.unobserve(row);
            else setPhase(row, "pending");
            continue;
          }
          if (record.intersectionRatio >= FLIP_VISIBLE_RATIO - RATIO_EPSILON) {
            if (timers.has(row)) continue;
            const delay = flipDelayMs(batch++);
            timers.set(
              row,
              setTimeout(() => {
                timers.delete(row);
                observer.unobserve(row);
                setPhase(row, "resolving");
              }, delay),
            );
          } else {
            cancel(row);
          }
        }
      },
      { threshold: [0, FLIP_VISIBLE_RATIO], rootMargin: `-${navHeight}px 0px 0px 0px` },
    );
    for (const row of rows) observer.observe(row);

    const media = window.matchMedia(REDUCED_MOTION);
    const onMotionPreference = () => {
      if (!media.matches) return;
      observer.disconnect();
      for (const row of timers.keys()) cancel(row);
      setPhases({});
    };
    media.addEventListener("change", onMotionPreference);

    return () => {
      observer.disconnect();
      for (const row of timers.keys()) cancel(row);
      media.removeEventListener("change", onMotionPreference);
    };
  }, [containerRef]);

  return phases;
}
