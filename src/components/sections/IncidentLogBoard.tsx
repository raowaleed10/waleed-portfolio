"use client";

import { LayoutGroup } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Incident, IncidentId } from "@/content/types";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";
import { duration, ease, prefersReducedMotion } from "@/lib/motion";
import { incidentColumns as col } from "./IncidentColumns";
import { IncidentEntry } from "./IncidentEntry";
import {
  areAllOpen,
  incidentDomIds,
  incidentIdFromHash,
  initialDisclosure,
  isEntryOpen,
  samePageHash,
  setAllEntries,
  setEntry,
  type DisclosureState,
  type DisclosureTrigger,
} from "./IncidentLogic";
import { IncidentGlyph } from "./IncidentStatus";
import { useIncidentStatusFlip } from "./IncidentStatusFlip";

/** Rows below an opened or closed entry glide to their new place (transform only). */
const layoutTransition = { layout: { duration: duration.base, ease: ease.out } };

/**
 * The interactive part of the incident log: the intro with the "Expand all"
 * toggle, the column header (lg), and the entries.
 *
 * Owns everything that is about the log rather than one entry:
 * - open state for every entry (the first starts open, on the server too);
 * - "Expand all" / "Collapse all";
 * - deep links: on load, on `hashchange`, and on clicks on same-page links
 *   such as "/#inc-03" (routers and smooth scrolling change the URL without
 *   a `hashchange`), the matching entry opens. The browser does the scroll;
 * - the status flip (useIncidentStatusFlip);
 * - Motion layout animations: each <li> is layout="position", so opening an
 *   entry moves the rows below with a transform, never by animating height.
 *   MotionConfig reducedMotion="user" makes that instant under reduced motion.
 */
export function IncidentLogBoard({
  intro,
  entries,
}: {
  intro: string;
  entries: readonly Incident[];
}) {
  const ids = entries.map((entry) => entry.id);
  const [disclosure, setDisclosure] = useState<DisclosureState>(() =>
    initialDisclosure(entries.slice(0, 1).map((entry) => entry.id)),
  );
  const listRef = useRef<HTMLUListElement>(null);
  const phases = useIncidentStatusFlip(listRef);
  const allOpen = areAllOpen(disclosure, ids);

  const shouldAnimate = (trigger: DisclosureTrigger) =>
    trigger !== "find" && !prefersReducedMotion();

  const changeEntry = (id: IncidentId, open: boolean, trigger: DisclosureTrigger) => {
    const animate = shouldAnimate(trigger);
    setDisclosure((state) => setEntry(state, id, open, animate));
  };

  const toggleAll = () => {
    const animate = shouldAnimate("all");
    const open = !allOpen;
    setDisclosure((state) => setAllEntries(state, ids, open, animate));
  };

  const openFromHash = useEffectEvent((hash: string) => {
    const id = incidentIdFromHash(hash, entries);
    if (id) changeEntry(id, true, "hash");
  });

  useEffect(() => {
    // After hydration, so the first client render matches the server's.
    const frame = requestAnimationFrame(() => openFromHash(window.location.hash));
    const onHashChange = () => openFromHash(window.location.hash);
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const hash = samePageHash(link.href, window.location.href);
      if (hash) openFromHash(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
        <p className="measure text-lg text-pretty text-muted">{intro}</p>
        <button
          type="button"
          aria-controls={entries.map((entry) => incidentDomIds(entry.anchor).panel).join(" ")}
          onClick={toggleAll}
          className="label inline-flex h-11 shrink-0 cursor-pointer items-center gap-2.5 self-end rounded-sm px-3 text-muted hover:text-fg md:-mb-3"
        >
          {/* Both labels share one grid cell, so the button keeps the width
              of the longer one; the hidden one is visibility:hidden and not
              part of the accessible name. */}
          <span className="grid justify-items-end">
            <span className={cn("col-start-1 row-start-1", allOpen && "invisible")}>
              {ui.incidents.expandAll}
            </span>
            <span className={cn("col-start-1 row-start-1", !allOpen && "invisible")}>
              {ui.incidents.collapseAll}
            </span>
          </span>
          {/* px-3 on the button puts this glyph exactly over the rows' glyphs. */}
          <IncidentGlyph open={allOpen} />
        </button>
      </div>

      {/* Column labels (lg). Visual only: each row's button names every cell. */}
      <div aria-hidden className="label mt-14 hidden px-3 pb-3 text-muted lg:grid lg:grid-12">
        <span className={col.status}>{ui.incidents.columns.status}</span>
        <span className={col.id}>{ui.incidents.columns.id}</span>
        <span className={col.product}>{ui.incidents.columns.product}</span>
        <span className={col.type}>{ui.incidents.columns.type}</span>
        <span className={col.symptom}>{ui.incidents.columns.symptom}</span>
      </div>

      <ul ref={listRef} className="mt-8 border-t border-border lg:mt-0">
        <LayoutGroup>
          {entries.map((incident) => (
            <m.li
              key={incident.id}
              layout="position"
              transition={layoutTransition}
              className="border-b border-border"
            >
              <IncidentEntry
                incident={incident}
                headingLevel={3}
                open={isEntryOpen(disclosure, incident.id)}
                animateOpen={disclosure[incident.id]?.animate ?? false}
                onOpenChange={(open, trigger) => changeEntry(incident.id, open, trigger)}
                statusPhase={phases[incident.id] ?? "resolved"}
              />
            </m.li>
          ))}
        </LayoutGroup>
      </ul>
    </>
  );
}
