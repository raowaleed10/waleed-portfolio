import { SeparatedText } from "@/components/hero/text";
import { GRID } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { SmallProject as SmallProjectContent } from "@/content/types";
import { ui } from "@/content/ui";
import { WorkStack } from "./WorkStack";

/**
 * The smaller project under the featured rows: no sketch, no case study.
 * Smaller and quieter type on the same columns as a WorkRow: stacked below
 * lg; from lg, identity where the sketches sit (1–5) and details on the
 * text column (7–12).
 *
 * The public link renders only once content has a URL for it.
 */
export function SmallProject({ project }: { project: SmallProjectContent }) {
  const headingId = "work-small-project";
  const linkId = `${headingId}-live`;

  return (
    <article
      aria-labelledby={headingId}
      className={`${GRID} gap-y-4 border-t border-border pt-8 md:pt-10 lg:pt-12`}
    >
      <div className="lg:col-span-5">
        <h3 id={headingId} className="text-xl font-medium">
          {project.name}
        </h3>
        <p className="mt-1 text-pretty text-muted">{project.oneLiner}</p>
        <p className="mt-3 font-mono text-xs text-muted">
          <SeparatedText text={project.company} />
        </p>
      </div>

      <div className="text-sm lg:col-span-6 lg:col-start-7">
        <p className="measure text-pretty">{project.summary}</p>
        <p className="measure mt-3 text-pretty text-muted">{project.also}</p>
        <WorkStack items={project.stack} className="mt-5" />
        {project.url ? (
          <ExternalLink
            href={project.url}
            id={linkId}
            aria-labelledby={`${linkId} ${headingId}`}
            className="mt-4 min-h-11 text-sm text-muted hover:text-fg"
          >
            {ui.work.liveProduct}
          </ExternalLink>
        ) : null}
      </div>
    </article>
  );
}
