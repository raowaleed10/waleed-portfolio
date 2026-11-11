import { cn } from "@/lib/cn";

export type StatusTone = "signal" | "incident" | "muted";

const toneBg: Record<StatusTone, string> = {
  signal: "bg-signal",
  incident: "bg-incident",
  muted: "bg-graphic",
};

/**
 * An 8px status dot. `pulse` adds a slow expanding ring (transform + opacity
 * only; reduced motion leaves the plain dot). Decorative: pair it with text.
 */
export function StatusDot({
  tone = "signal",
  pulse = false,
  className,
}: {
  tone?: StatusTone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("relative inline-flex size-2 shrink-0", className)}>
      {pulse && (
        <span className={cn("absolute inset-0 rounded-full animate-ring-pulse", toneBg[tone])} />
      )}
      <span className={cn("relative size-2 rounded-full", toneBg[tone])} />
    </span>
  );
}
