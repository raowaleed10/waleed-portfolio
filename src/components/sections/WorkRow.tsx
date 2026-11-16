import Link from "next/link";
import { ProjectDiagram } from "@/components/diagram/ProjectDiagram";
import { SeparatedText } from "@/components/hero/text";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { GRID } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { StatusDot } from "@/components/ui/StatusDot";
import type { CaseStudy } from "@/content/types";
import { ui } from "@/content/ui";
import { WorkStack } from "./WorkStack";

/**
 * One featured case study as an editorial row: hairline on top, the
 * project's own architecture diagram as a small static sketch, then the name,
 * one-liner, status, company, summary, stack and links.
 *
 * - Below lg: one column, the sketch first (capped at 32rem, so it stays a
 *   sketch on tablets instead of a 700px panel).
 * - lg+: sketch in columns 1–5, text in 7–12; column 6 is air.
 *
 * Links: "Read case study" is the row's one keyboard stop for the case study.
 * The sketch and the name link there too, for pointers only (tabIndex -1;
 * the sketch is aria-hidden), so nothing is nested and nothing is tabbed
 * twice. Each action's accessible name adds the project name ("Read case
 * study UChatbots"), so a screen reader's links list tells the rows apart.
 */
export function WorkRow({ project }: { project: CaseStudy }) {
  const href = `/work/${project.slug}`;
  const ids = {
    heading: `work-${project.slug}`,
    caseStudy: `work-${project.slug}-case-study`,
    live: `work-${project.slug}-live`,
  };

  return (
    <article
      aria-labelledby={ids.heading}
      className={`${GRID} gap-y-6 border-t border-border py-10 md:gap-y-8 md:py-12 lg:py-16`}
    >
      {/* Each sketch is its project's 6 key nodes, labelled, in a 300-unit
          viewBox, capped at max-w-sm. Phones: a 16:10 frame with the sketch at
          11/12 of its width, so labels stay ≥ 11px at 375px. From sm: 16:9 at
          5/6. Every row keeps the same shape; labels are ~15px on wide screens.
          The frame is a hairline on the page background, not a filled panel:
          the nodes are drawn in the surface color, so they read exactly as
          they do in the hero diagram. */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="group block max-w-lg self-start lg:col-span-5 lg:max-w-none"
      >
        <div className="flex aspect-[16/10] items-center justify-center rounded-md border border-border group-hover:border-border-strong sm:aspect-video">
          <div className="w-11/12 max-w-sm sm:w-5/6">
            <ProjectDiagram slug={project.slug} variant="thumbnail" />
          </div>
        </div>
      </Link>

      <div className="lg:col-span-6 lg:col-start-7">
        <h3 id={ids.heading} className="text-2xl font-medium">
          <Link
            href={href}
            tabIndex={-1}
            className="underline decoration-transparent underline-offset-4 hover:decoration-muted"
          >
            {project.name}
          </Link>
        </h3>
        <p className="mt-2 text-lg text-pretty text-muted">{project.oneLiner}</p>

        {/* Status block: the dot marks it, both lines share one text edge. */}
        <div className="mt-5 font-mono text-xs">
          <p className="flex gap-2 text-fg">
            <StatusDot className="mt-1" />
            <span>{project.status}</span>
          </p>
          <p className="mt-1.5 pl-4 text-muted">
            <SeparatedText text={project.company} />
          </p>
        </div>

        <p className="measure mt-6 text-pretty">{project.cardSummary}</p>

        <WorkStack items={project.stack} className="mt-6" />

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <ButtonLink
            href={href}
            variant="secondary"
            id={ids.caseStudy}
            aria-labelledby={`${ids.caseStudy} ${ids.heading}`}
          >
            {ui.work.readCaseStudy}
          </ButtonLink>
          <ExternalLink
            href={project.liveUrl}
            id={ids.live}
            aria-labelledby={`${ids.live} ${ids.heading}`}
            className="min-h-11 text-sm text-muted hover:text-fg"
          >
            {ui.work.liveProduct}
          </ExternalLink>
        </div>
      </div>
    </article>
  );
}
