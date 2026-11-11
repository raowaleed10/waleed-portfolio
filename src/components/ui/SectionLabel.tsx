import type { SectionMeta } from "@/content/types";
import { cn } from "@/lib/cn";

/**
 * The section heading: "01 / Selected work" in mono, uppercased by CSS.
 * It is the section's <h2>; the index and slash are hidden from screen readers.
 */
export function SectionLabel({
  meta,
  id,
  className,
}: {
  meta: SectionMeta;
  id?: string;
  className?: string;
}) {
  return (
    <h2 id={id} className={cn("label flex items-baseline gap-2 text-muted", className)}>
      <span aria-hidden className="text-fg">
        {meta.index}
      </span>
      <span aria-hidden>/</span>
      <span>{meta.label}</span>
    </h2>
  );
}
