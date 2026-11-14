import { ProjectDiagram } from "@/components/diagram/ProjectDiagram";
import type { CaseStudySlug } from "@/content/types";

/**
 * The page's centrepiece: the project's live architecture diagram in the
 * same unfilled hairline frame as the homepage work-row sketches, at full
 * content width. The diagram carries its own accessible name (an sr-only
 * figcaption).
 *
 * Sizing keeps every label at 11px or more:
 * - < md: the frame drops its sides and radius and becomes two hairlines,
 *   so the vertical layout gets the full content width it was drawn for
 *   (335 units at a 375px viewport). From ~480px it caps at max-w-md.
 * - md: a rounded frame. Its inside (~650px at 768) is too narrow for the
 *   desktop layout, so the vertical one stays (desktopFrom="lg"), centred.
 * - lg+: the desktop layout, capped at max-w-4xl (labels ~15px) and centred
 *   in the frame, so it never balloons on wide screens.
 */
export function CaseStudyDiagram({ slug }: { slug: CaseStudySlug }) {
  return (
    <div className="border-y border-border py-8 md:rounded-md md:border md:px-6 md:py-10 lg:px-8 lg:py-14 xl:py-16">
      <ProjectDiagram
        slug={slug}
        variant="full"
        desktopFrom="lg"
        className="mx-auto max-w-4xl *:mx-auto"
      />
    </div>
  );
}
