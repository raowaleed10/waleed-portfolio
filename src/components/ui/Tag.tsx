import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TagTone = "neutral" | "signal" | "incident";

const tones: Record<TagTone, string> = {
  neutral: "border-border-strong text-muted",
  signal: "border-signal text-signal-text",
  incident: "border-incident text-incident-text",
};

/** Small mono tag with a hairline outline, e.g. an incident type or a stack item. */
export function Tag({
  tone = "neutral",
  className,
  children,
}: {
  tone?: TagTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border px-1.5 py-0.5 font-mono text-xs leading-none whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
