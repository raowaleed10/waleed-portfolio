import { diagrams } from "@/content/diagrams";
import type { CaseStudySlug, Diagram } from "@/content/types";
import { cn } from "@/lib/cn";
import { diagramLayouts } from "./layouts";
import { SystemDiagram } from "./SystemDiagram";

/** Where the desktop layout takes over from the vertical one. */
const SWITCH = {
  md: { desktop: "hidden md:block", mobile: "md:hidden" },
  lg: { desktop: "hidden lg:block", mobile: "lg:hidden" },
} as const;

/**
 * A case study's architecture diagram.
 *
 * - `full`: desktop layout (~704–720 units wide: render it ≥ 690px wide so
 *   text stays ≥ 11px) and the vertical layout (335 units, capped at
 *   max-w-md) below the breakpoint. Gentle packets; UChatbots also runs the
 *   provider failover. No tooltips: project nodes have none.
 * - `thumbnail`: the desktop layout without text. Static, decorative
 *   (aria-hidden), so pair it with a visible project name. Aspect ratios:
 *   uchatbots 704∶336, excevoai 720∶268, accountabuddy 716∶200.
 */
export function ProjectDiagram({
  slug,
  variant,
  desktopFrom = "md",
  className,
}: {
  slug: CaseStudySlug;
  variant: "full" | "thumbnail";
  /** Breakpoint for the desktop layout; use "lg" if the column is narrower than ~690px at md. */
  desktopFrom?: keyof typeof SWITCH;
  className?: string;
}) {
  const diagram: Diagram = diagrams[slug];
  const layouts = diagramLayouts[slug];

  if (variant === "thumbnail") {
    return (
      <SystemDiagram
        diagram={diagram}
        layout={layouts.desktop}
        variant="thumbnail"
        className={className}
      />
    );
  }

  const failover = diagram.failover !== undefined;
  return (
    <div className={className}>
      <SystemDiagram
        diagram={diagram}
        layout={layouts.desktop}
        animated
        failover={failover}
        className={SWITCH[desktopFrom].desktop}
      />
      <SystemDiagram
        diagram={diagram}
        layout={layouts.mobile}
        animated
        failover={failover}
        className={cn(SWITCH[desktopFrom].mobile, "max-w-md")}
      />
    </div>
  );
}
