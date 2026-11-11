import { StatusDot } from "@/components/ui/StatusDot";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";
import type { IncidentStatusPhase } from "./IncidentLogic";

/*
 * The status flip, amber → lime, in three layers inside one 8px box:
 *
 *   amber dot  (only while pending or resolving; fades out last)
 *   lime ring  (resolving only: one expanding ring, animate-ring-once)
 *   lime dot   (on top; hidden while pending, crossfades in when resolving)
 *
 * Opacity and transform only. Pending → resolving swaps classes in a single
 * style change, so the transitions run from the pending values. Resolved is
 * the server render and has no transitions, so switching to pending (off
 * screen) is instant and unseen.
 */

const fadeIn = "transition-opacity duration-(--dur-base) ease-out";
/** Starts once the lime dot is mostly in, so amber never shows through the crossfade. */
const fadeOutLate = "opacity-0 transition-opacity duration-(--dur-base) delay-(--dur-fast) ease-out";

/** The status dot of an incident. Decorative: pair it with IncidentStatusLabel. */
export function IncidentStatusDot({
  phase = "resolved",
  className,
}: {
  phase?: IncidentStatusPhase;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("relative inline-flex size-2 shrink-0", className)}>
      {phase !== "resolved" && (
        // flex: keeps the inline dot off the text line box, so it sits exactly under the lime dot
        <span className={cn("absolute inset-0 flex", phase === "resolving" && fadeOutLate)}>
          <StatusDot tone="incident" />
        </span>
      )}
      {phase === "resolving" && (
        <span className="absolute inset-0 animate-ring-once rounded-full bg-signal" />
      )}
      <span
        className={cn(
          "relative inline-flex",
          phase === "pending" && "opacity-0",
          phase === "resolving" && fadeIn,
        )}
      >
        <StatusDot tone="signal" />
      </span>
    </span>
  );
}

/** "Resolved", hidden while pending and faded in just after the dot turns lime. */
export function IncidentStatusLabel({
  phase = "resolved",
  className,
}: {
  phase?: IncidentStatusPhase;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label text-muted",
        phase === "pending" && "opacity-0",
        phase === "resolving" && "transition-opacity duration-(--dur-base) delay-(--dur-fast) ease-out",
        className,
      )}
    >
      {ui.incidents.resolved}
    </span>
  );
}

/**
 * Plus / minus: two hairlines; the vertical one collapses (scale-y) when
 * open. Transform only; the global reduced-motion rule makes it instant.
 * Colour follows currentColor.
 */
export function IncidentGlyph({ open, className }: { open: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative block size-3 shrink-0", className)}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
      <span
        className={cn(
          "absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-(--dur-base) ease-out",
          open && "scale-y-0",
        )}
      />
    </span>
  );
}
