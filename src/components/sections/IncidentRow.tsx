"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { Tag } from "@/components/ui/Tag";
import type { Incident } from "@/content/types";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/motion";
import { incidentColumns as col, SYMPTOM_COLUMN_PAD } from "./IncidentColumns";
import {
  incidentDomIds,
  typeTone,
  type DisclosureTrigger,
  type IncidentStatusPhase,
} from "./IncidentLogic";
import { IncidentGlyph, IncidentStatusDot, IncidentStatusLabel } from "./IncidentStatus";
import { IncidentTrace, TRACE_LINE, TRACE_MARKER, traceMarkerTone } from "./IncidentTrace";

export interface IncidentRowProps {
  incident: Incident;
  headingLevel: 3 | 4;
  /** Uncontrolled: open on first render. */
  defaultOpen: boolean;
  /** Controlled open state (the log uses this for "Expand all" and deep links). */
  open?: boolean;
  /** Controlled: play the open animation (false for find-in-page). */
  animateOpen?: boolean;
  onOpenChange?: (open: boolean, trigger: DisclosureTrigger) => void;
  statusPhase: IncidentStatusPhase;
}

/** True where `hidden="until-found"` and the beforematch event exist (Chromium, Firefox). */
function supportsUntilFound(): boolean {
  return "onbeforematch" in document.documentElement;
}

/** Hidden separators, so the button's accessible name reads "INC-01, Accountabuddy, Critical, …". */
function Separator() {
  return <span className="sr-only">, </span>;
}

/**
 * Hover on a closed row: an opacity-only overlay behind the row's content.
 * An open row already sits on the raised surface, so it gets none.
 */
const hoverOverlay =
  "before:absolute before:inset-0 before:-z-10 before:bg-surface before:opacity-0 before:transition-opacity before:duration-(--dur-fast) before:ease-out not-aria-expanded:hover:before:opacity-100";

/** The open entry (row and trace) sits on the raised surface, faded in behind it. */
const openSurface =
  "before:absolute before:inset-0 before:-z-10 before:bg-raised before:opacity-0 before:transition-opacity before:duration-(--dur-base) before:ease-out data-[state=open]:before:opacity-100";

/** The row's symptom becomes the trace's first step when the entry opens. */
const fadeWithOpen = "transition-opacity duration-(--dur-base) ease-out";

/**
 * One incident in the log: a disclosure row and its trace panel.
 *
 * - The row is a <button aria-expanded aria-controls> inside an <h3> (or
 *   <h4>). Its text, in DOM order, is the accessible name: ID, product,
 *   type, symptom, status. CSS places the status first visually.
 * - The panel (id "inc-01-details") stays in the DOM. The server renders it
 *   `hidden`; after hydration a closed panel is upgraded to
 *   `hidden="until-found"` (React only writes boolean `hidden`), so
 *   find-in-page reaches the text and its `beforematch` opens the entry.
 * - Layout: below lg, two lines (status dot, ID, product, type / symptom);
 *   from lg, cells on the 12-column grid under the log's header row.
 * - Opening never animates height. The trace fades in (IncidentTrace); rows
 *   below move with Motion layout animations, which the log provides.
 */
export function IncidentRow({
  incident,
  headingLevel,
  defaultOpen,
  open: openProp,
  animateOpen,
  onOpenChange,
  statusPhase,
}: IncidentRowProps) {
  const [own, setOwn] = useState({ open: defaultOpen, animate: false });
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : own.open;
  const animate = open && (controlled ? (animateOpen ?? false) : own.animate);

  const panelRef = useRef<HTMLDivElement>(null);
  const ids = incidentDomIds(incident.anchor);
  const Heading = headingLevel === 4 ? "h4" : "h3";

  const requestOpen = (next: boolean, trigger: DisclosureTrigger) => {
    if (!controlled) {
      setOwn({ open: next, animate: next && trigger !== "find" && !prefersReducedMotion() });
    }
    onOpenChange?.(next, trigger);
  };

  // Find-in-page matched text in the closed panel: the browser has already
  // removed `hidden` and scrolls to the match, so open without animating.
  const onBeforeMatch = useEffectEvent(() => requestOpen(true, "find"));
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const handle = () => onBeforeMatch();
    panel.addEventListener("beforematch", handle);
    return () => panel.removeEventListener("beforematch", handle);
  }, []);

  // Runs after React writes `hidden=""` and before paint, so the upgrade is
  // never visible. Both values hide the panel with zero height.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (panel && !open && supportsUntilFound()) panel.setAttribute("hidden", "until-found");
  }, [open]);

  return (
    <div id={ids.entry} data-state={open ? "open" : "closed"} className={cn("relative isolate", openSurface)}>
      <Heading data-incident-row={incident.id}>
        <button
          id={ids.button}
          type="button"
          aria-expanded={open}
          aria-controls={ids.panel}
          onClick={() => requestOpen(!open, "toggle")}
          className={cn(
            "group relative isolate grid w-full cursor-pointer grid-cols-[0.5rem_minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-3 py-5 text-left focus-visible:-outline-offset-2",
            "lg:grid-12 lg:items-baseline",
            hoverOverlay,
          )}
        >
          {/* Line 1 below lg: ID, product, type (wrapping if they must).
              From lg the wrapper dissolves and each part takes its column. */}
          <span className="col-start-2 row-start-1 flex flex-wrap items-center gap-x-3 gap-y-1 lg:contents">
            <span className={cn("font-mono text-sm text-fg", col.id)}>{incident.id}</span>
            <Separator />
            <span className={cn("text-sm text-muted", col.product)}>{incident.product}</span>
            <Separator />
            <span className={cn("flex", col.type)}>
              <Tag tone={typeTone(incident.type)}>{incident.type}</Tag>
            </span>
            <Separator />
          </span>

          {/* Line 2 below lg; the Symptom column from lg. When the entry is
              open, an amber marker and the top of the trace line appear
              beside it, in the status dot's column (below lg) or the gutter
              left of the column (lg). */}
          <span
            className={cn(
              "relative col-span-2 col-start-2 row-start-2 text-base text-pretty text-fg",
              col.symptom,
              SYMPTOM_COLUMN_PAD,
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-0 -left-5 flex h-lh w-2 items-center lg:-left-4",
                fadeWithOpen,
                open ? "opacity-100" : "opacity-0",
              )}
            >
              <span className={cn(TRACE_MARKER, traceMarkerTone.symptom)} />
            </span>
            <span
              aria-hidden
              className={cn(
                TRACE_LINE,
                // Down to the button's bottom edge (its pb-5), where the panel's line continues.
                "top-[calc(0.5lh+0.5rem)] -bottom-5 left-[calc(-1rem-0.5px)] lg:left-[calc(-0.75rem-0.5px)]",
                fadeWithOpen,
                open ? "opacity-100" : "opacity-0",
              )}
            />
            {incident.symptom}
          </span>

          {/* Status: the dot alone below lg (the label stays for screen
              readers), dot and "Resolved" from lg. Last in the DOM, so the
              accessible name ends with it. */}
          <span
            className={cn(
              "col-start-1 row-start-1 flex h-5 items-center gap-2 lg:h-auto lg:items-baseline",
              col.status,
            )}
          >
            <IncidentStatusDot phase={statusPhase} className="lg:self-center" />
            <IncidentStatusLabel phase={statusPhase} className="sr-only lg:not-sr-only" />
          </span>

          <span
            aria-hidden
            className={cn(
              "col-start-3 row-start-1 flex h-5 items-center text-muted group-hover:text-fg group-aria-expanded:text-fg",
              "lg:h-lh lg:self-start lg:justify-self-end lg:text-base",
              col.glyph,
            )}
          >
            <IncidentGlyph open={open} />
          </span>
        </button>
      </Heading>

      {/* No padding, border or display class on this element: a closed
          (until-found) panel must collapse to zero height. */}
      <div ref={panelRef} id={ids.panel} role="region" aria-labelledby={ids.button} hidden={!open}>
        <IncidentTrace incident={incident} variant="log" animate={animate} className="px-3 pb-6" />
      </div>
    </div>
  );
}
