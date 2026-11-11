/**
 * Pure logic for the incident log: trace steps, DOM ids, URL fragments,
 * disclosure state and status-flip timing. No React and no DOM, so all of it
 * is unit-tested (IncidentLogic.test.ts).
 */
import type { TagTone } from "@/components/ui/Tag";
import type { Incident, IncidentId } from "@/content/types";
import { staggerMs } from "@/lib/motion";

/* ----------------------------------------------------------------- trace */

export type TraceStepKind = "symptom" | "rootCause" | "fix" | "impact";

export interface TraceStep {
  readonly kind: TraceStepKind;
  readonly text: string;
}

/**
 * The steps of an incident's trace, in order: Symptom → Root cause → Fix →
 * Impact. Fix is left out while it is still TODO(waleed) in content.md.
 * The log row already shows the symptom, so the log's panel starts at the
 * root cause (`includeSymptom: false`).
 */
export function traceSteps(
  incident: Incident,
  { includeSymptom }: { includeSymptom: boolean },
): TraceStep[] {
  const steps: TraceStep[] = [];
  if (includeSymptom) steps.push({ kind: "symptom", text: incident.symptom });
  steps.push({ kind: "rootCause", text: incident.rootCause });
  if (incident.fix) steps.push({ kind: "fix", text: incident.fix });
  steps.push({ kind: "impact", text: incident.impact });
  return steps;
}

/* --------------------------------------------------------------- ids, tags */

/** DOM ids for one entry. `entry` is the URL fragment ("/#inc-03"). */
export function incidentDomIds(anchor: string) {
  return {
    entry: anchor,
    button: `${anchor}-button`,
    panel: `${anchor}-details`,
    heading: `${anchor}-heading`,
  } as const;
}

/** The one incident type that earns the amber tag; every other type is neutral. */
const CRITICAL_TYPE = "Critical";

export function typeTone(type: string): TagTone {
  return type === CRITICAL_TYPE ? "incident" : "neutral";
}

/* ------------------------------------------------------------- fragments */

function decodeFragment(fragment: string): string {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

/** The incident a URL fragment ("#inc-03") points at, or null. Ids are case-sensitive, like the browser's. */
export function incidentIdFromHash(
  hash: string,
  entries: readonly Incident[],
): IncidentId | null {
  const fragment = decodeFragment(hash.replace(/^#/, ""));
  if (!fragment) return null;
  return entries.find((entry) => entry.anchor === fragment)?.id ?? null;
}

/**
 * The fragment of a link that stays on the current document ("#inc-03",
 * "/#inc-03" while on "/"), or null for links to other pages or without one.
 * Catches in-page links that change the URL without a `hashchange` event
 * (client-side routers, smooth-scroll libraries).
 */
export function samePageHash(linkHref: string, currentHref: string): string | null {
  let link: URL;
  let current: URL;
  try {
    current = new URL(currentHref);
    link = new URL(linkHref, current);
  } catch {
    return null;
  }
  const samePage =
    link.origin === current.origin &&
    link.pathname === current.pathname &&
    link.search === current.search;
  return samePage && link.hash ? link.hash : null;
}

/* ------------------------------------------------------------ disclosure */

/** What opened or closed an entry. Find-in-page opens instantly; the rest may animate. */
export type DisclosureTrigger = "toggle" | "all" | "hash" | "find";

export interface Disclosure {
  readonly open: boolean;
  /** Play the open animation. False for entries open from the start or revealed by find-in-page. */
  readonly animate: boolean;
}

/** Entries missing from the record are closed. */
export type DisclosureState = Readonly<Partial<Record<IncidentId, Disclosure>>>;

export function initialDisclosure(openIds: readonly IncidentId[]): DisclosureState {
  return Object.fromEntries(openIds.map((id) => [id, { open: true, animate: false }]));
}

export function isEntryOpen(state: DisclosureState, id: IncidentId): boolean {
  return state[id]?.open ?? false;
}

export function areAllOpen(state: DisclosureState, ids: readonly IncidentId[]): boolean {
  return ids.every((id) => isEntryOpen(state, id));
}

/**
 * Opens or closes one entry. Returns the same object when nothing changes,
 * so React skips the render. An entry that is already open keeps its
 * animation flag: re-opening it must not replay the animation.
 */
export function setEntry(
  state: DisclosureState,
  id: IncidentId,
  open: boolean,
  animate: boolean,
): DisclosureState {
  if (isEntryOpen(state, id) === open) return state;
  return { ...state, [id]: { open, animate: open && animate } };
}

/** Opens or closes every entry ("Expand all" / "Collapse all"). */
export function setAllEntries(
  state: DisclosureState,
  ids: readonly IncidentId[],
  open: boolean,
  animate: boolean,
): DisclosureState {
  return ids.reduce((next, id) => setEntry(next, id, open, animate), state);
}

/* ------------------------------------------------------------ status flip */

/**
 * The status dot of a log entry:
 * - "resolved": lime, label visible. What the server renders, and final.
 * - "pending": amber, label hidden. Set quietly while the row is off screen.
 * - "resolving": lime crossfades in with one ring, then the label. Plays once.
 */
export type IncidentStatusPhase = "resolved" | "pending" | "resolving";

/** Share of a row that must be on screen before it resolves. */
export const FLIP_VISIBLE_RATIO = 0.6;

/** Wait after a row becomes visible, so the flip is seen rather than missed mid-scroll. */
export const FLIP_DELAY_MS = 250;

/** Rows that become visible together resolve one after another, top first. */
export const FLIP_STAGGER_MS = staggerMs * 3;

/** Delay before the `order`-th row (0-based) of one visibility batch resolves. */
export function flipDelayMs(order: number): number {
  return FLIP_DELAY_MS + Math.max(0, order) * FLIP_STAGGER_MS;
}
