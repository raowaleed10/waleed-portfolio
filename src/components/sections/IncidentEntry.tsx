import { Tag } from "@/components/ui/Tag";
import type { Incident } from "@/content/types";
import {
  incidentDomIds,
  typeTone,
  type DisclosureTrigger,
  type IncidentStatusPhase,
} from "./IncidentLogic";
import { IncidentRow } from "./IncidentRow";
import { IncidentStatusDot, IncidentStatusLabel } from "./IncidentStatus";
import { IncidentTrace } from "./IncidentTrace";

export type { DisclosureTrigger, IncidentStatusPhase } from "./IncidentLogic";

export interface IncidentEntryProps {
  incident: Incident;
  /**
   * - "log" (default): a disclosure row (status, ID, product, type, symptom)
   *   that opens the trace. Lines up with IncidentLog's columns from lg, and
   *   reads fine without them.
   * - "standalone": always open. A header (status, ID, product, type) and the
   *   full trace from the symptom on. Static: no client JavaScript of its own.
   */
  variant?: "log" | "standalone";
  /** Level of the heading that names the entry. Default 3. */
  headingLevel?: 3 | 4;
  /** "log" only, uncontrolled: start open. Default false. */
  defaultOpen?: boolean;
  /** "log" only, controlled open state. Pass with onOpenChange. */
  open?: boolean;
  /** "log" only, controlled: play the open animation when `open` turns true. */
  animateOpen?: boolean;
  /** "log" only: the visitor (or find-in-page) asked to open or close the entry. */
  onOpenChange?: (open: boolean, trigger: DisclosureTrigger) => void;
  /** "log" only: the status-flip phase, driven by IncidentLog. Default "resolved". */
  statusPhase?: IncidentStatusPhase;
  className?: string;
}

/**
 * One incident from the log, reusable anywhere (the homepage log, case-study
 * pages). The wrapper's id is the incident's anchor ("inc-03"), so "/#inc-03"
 * lands on it. All of its text is in the server HTML.
 *
 * Case-study pages:
 *   <IncidentEntry incident={incidentsById["INC-03"]} variant="standalone" />
 * or a collapsible row that starts open:
 *   <IncidentEntry incident={incidentsById["INC-03"]} defaultOpen />
 */
export function IncidentEntry({
  incident,
  variant = "log",
  headingLevel = 3,
  defaultOpen = false,
  open,
  animateOpen,
  onOpenChange,
  statusPhase = "resolved",
  className,
}: IncidentEntryProps) {
  if (variant === "standalone") {
    return (
      <IncidentStandalone incident={incident} headingLevel={headingLevel} className={className} />
    );
  }
  const row = (
    <IncidentRow
      incident={incident}
      headingLevel={headingLevel}
      defaultOpen={defaultOpen}
      open={open}
      animateOpen={animateOpen}
      onOpenChange={onOpenChange}
      statusPhase={statusPhase}
    />
  );
  return className ? <div className={className}>{row}</div> : row;
}

/**
 * The always-open entry: status dot, ID, product and type as a heading line,
 * then the trace. The status dot and the trace markers share one 8px column,
 * and the heading text lines up with the step labels.
 */
function IncidentStandalone({
  incident,
  headingLevel,
  className,
}: {
  incident: Incident;
  headingLevel: 3 | 4;
  className?: string;
}) {
  const ids = incidentDomIds(incident.anchor);
  const Heading = headingLevel === 4 ? "h4" : "h3";

  return (
    <article id={ids.entry} aria-labelledby={ids.heading} className={className}>
      <div className="flex items-start gap-3">
        <span className="flex h-5 items-center">
          <IncidentStatusDot />
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <Heading id={ids.heading} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-sm text-fg">{incident.id}</span>
            <span className="sr-only">, </span>
            <span className="text-sm text-muted">{incident.product}</span>
            <span className="sr-only">, </span>
            <span className="flex">
              <Tag tone={typeTone(incident.type)}>{incident.type}</Tag>
            </span>
          </Heading>
          <IncidentStatusLabel className="ml-auto" />
        </div>
      </div>
      <IncidentTrace incident={incident} variant="standalone" className="mt-6" />
    </article>
  );
}
