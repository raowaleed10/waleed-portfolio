import type { ReactNode } from "react";
import { GRID } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

/**
 * One part of a case study (Context, What I built, …) as a hairline row on
 * the 12-column grid, like the homepage Experience and Stack rows: the mono
 * label is the <h2> in the narrow left column (md: 4 columns, lg: 3), the
 * content in the wide column beside it, first baselines aligned. Stacked on
 * phones. No index: these are parts of one page, not homepage sections.
 *
 * The label sits close under the hairline and the space before the next
 * row is generous, so each rule reads as the head of its section.
 * `id` is the URL fragment ("/work/uchatbots#hard-problems"); like the
 * homepage sections, the element is focusable for in-page links.
 */
export function CaseStudySection({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const labelId = `${id}-label`;
  return (
    <section
      id={id}
      aria-labelledby={labelId}
      tabIndex={-1}
      className={cn(
        GRID,
        "gap-y-5 border-t border-border pt-6 pb-16 outline-none md:items-baseline md:pt-8 md:pb-24",
        className,
      )}
    >
      <h2 id={labelId} className="label text-muted md:col-span-4 lg:col-span-3">
        {label}
      </h2>
      <div className="min-w-0 md:col-span-8 lg:col-span-9">{children}</div>
    </section>
  );
}
