import type { CSSProperties } from "react";
import type { Incident } from "@/content/types";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";
import { traceSteps, type TraceStepKind } from "./IncidentLogic";

/*
 * The trace: Symptom → Root cause → Fix → Impact as a description list on a
 * vertical hairline. Each step has an 8px marker; the line stops 4px short
 * of every marker. The colour journey mirrors the status dot:
 *
 *   ● symptom     amber, filled   (the alert)
 *   ○ root cause  neutral ring
 *   ○ fix         neutral ring
 *   ● impact      lime, filled    (resolved)
 *
 * Two layouts:
 * - Stacked (standalone, and the log below lg): markers in an 8px column
 *   (the same column as the status dot in a log row), text 20px to the
 *   right, each label above its text.
 * - Table (the log from lg): every step is a row on the log's 12-column
 *   grid. Labels sit right-aligned in the Type column, text in the Symptom
 *   column, and the line runs down the 24px gutter between them, continuing
 *   the line that starts at the symptom in the row above.
 *
 * In the log the symptom is the row itself, so the panel starts at the root
 * cause and its line reaches up to the row (see IncidentRow).
 */

export type TraceVariant = "log" | "standalone";

/** Marker fill per step. Root cause and fix are hollow rings (waypoints). */
export const traceMarkerTone: Record<TraceStepKind, string> = {
  symptom: "bg-incident",
  rootCause: "border border-graphic",
  fix: "border border-graphic",
  impact: "bg-signal",
};

/** Root cause is the point of every incident, so it gets the strongest type. */
const textStyle: Record<TraceStepKind, string> = {
  symptom: "text-base text-fg",
  rootCause: "text-lg font-medium text-fg",
  fix: "text-base text-fg",
  impact: "text-base text-fg",
};

export const TRACE_MARKER = "size-2 rounded-full";
export const TRACE_LINE = "absolute w-px bg-border-strong";

/*
 * Open animation (only when the visitor opens an entry): each step's text
 * fades and rises 6px over 320ms, 40ms after the step before; markers and
 * line segments only fade, so the line never jumps. Reduced motion never
 * gets these classes, and the global reduced-motion rule would end them
 * anyway.
 */
const enter =
  "animate-fade-rise [animation-delay:calc(var(--step)*var(--stagger))] [animation-duration:var(--dur-base)]";
const enterFade = `${enter} [--rise:0px]`;

export function IncidentTrace({
  incident,
  variant,
  animate = false,
  className,
}: {
  incident: Incident;
  variant: TraceVariant;
  /** Play the open animation. Set it in the same render that opens the panel. */
  animate?: boolean;
  className?: string;
}) {
  const table = variant === "log";
  const steps = traceSteps(incident, { includeSymptom: variant === "standalone" });

  return (
    <dl className={className}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <div
            key={step.kind}
            style={animate ? ({ "--step": index } as CSSProperties) : undefined}
            className={cn("relative pl-5", table && "lg:static lg:grid-12 lg:items-baseline lg:pl-0")}
          >
            <dt
              className={cn(
                "label text-muted",
                table && "lg:col-span-2 lg:col-start-6 lg:row-start-1 lg:text-right",
                animate && enter,
              )}
            >
              {ui.incidents.steps[step.kind]}
            </dt>
            <dd
              className={cn(
                "mt-1 text-pretty",
                textStyle[step.kind],
                !last && "pb-5",
                table && "lg:relative lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mt-0 lg:pr-8",
              )}
            >
              {/* Marker: centred on the label line when stacked, on the text's
                  first line in the table. */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-0 left-0 flex h-4 w-2 items-center",
                  table && "lg:-left-4 lg:h-lh",
                  animate && enterFade,
                )}
              >
                <span className={cn(TRACE_MARKER, traceMarkerTone[step.kind])} />
              </span>
              {/* Line from above, into this marker (table only: when stacked,
                  the segment above ends exactly 4px short of it). */}
              {table && (
                <span
                  aria-hidden
                  className={cn(
                    TRACE_LINE,
                    "top-0 hidden h-[calc(0.5lh-0.5rem)] left-[calc(-0.75rem-0.5px)] lg:block",
                    animate && enterFade,
                  )}
                />
              )}
              {/* Line from this marker down to the next step. */}
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    TRACE_LINE,
                    "top-4 bottom-0 left-[calc(0.25rem-0.5px)]",
                    table && "lg:top-[calc(0.5lh+0.5rem)] lg:left-[calc(-0.75rem-0.5px)]",
                    animate && enterFade,
                  )}
                />
              )}
              <span className={cn("block", !table && "measure", animate && enter)}>{step.text}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
