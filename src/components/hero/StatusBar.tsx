import { StatusDot } from "@/components/ui/StatusDot";
import { hero } from "@/content/hero";
import { cn } from "@/lib/cn";
import { DualClock } from "./DualClock";
import { SeparatedText } from "./text";

/**
 * The hero's "console footer": a full-width strip under a hairline, in small
 * muted mono. Availability first (pulsing lime dot), then the live clocks.
 *
 * - Phones: stacked; the clocks become a two-row label/value table.
 * - md–lg: the status line, then the clocks in one row with hairline dividers.
 * - xl: everything in one row. The clock group has a fixed width, so the
 *   status line never reflows when the live values arrive.
 */
export function StatusBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-border pt-5 font-mono text-xs text-muted",
        "xl:flex-row xl:items-center xl:gap-0",
        className,
      )}
    >
      <p className="flex gap-2 xl:min-w-0 xl:pr-4">
        <StatusDot pulse className="mt-1" />
        <span>
          <SeparatedText text={hero.status} />
        </span>
      </p>
      <DualClock className="xl:shrink-0 xl:border-l xl:border-border xl:pl-4" />
    </div>
  );
}
