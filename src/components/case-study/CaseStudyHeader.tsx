import { SeparatedText } from "@/components/hero/text";
import { WorkStack } from "@/components/sections/WorkStack";
import { GRID } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { StatusDot } from "@/components/ui/StatusDot";
import type { CaseStudy } from "@/content/types";
import { ui } from "@/content/ui";

/**
 * The case study's title block: the homepage work row's text column, scaled
 * up to a page header. Company line as the mono eyebrow (like the hero's),
 * the project name as the page's only <h1> at display size, the one-liner,
 * then the same status line, stack tags and "Live product" link as the row.
 *
 * Left-aligned in columns 1–8 from lg; the diagram below takes the full width.
 */
export function CaseStudyHeader({ study, headingId }: { study: CaseStudy; headingId: string }) {
  return (
    <header className={GRID}>
      <div className="lg:col-span-8">
        <p className="label text-muted">
          <SeparatedText text={study.company} />
        </p>

        <h1 id={headingId} className="mt-6 text-display text-balance">
          {study.name}
        </h1>

        <p className="measure mt-4 text-xl text-pretty text-muted md:mt-6">{study.oneLiner}</p>

        <p className="mt-8 flex gap-2 font-mono text-xs text-fg md:mt-10">
          <StatusDot className="mt-1" />
          <span>{study.status}</span>
        </p>

        <WorkStack items={study.stack} className="mt-5" />

        <p className="mt-4">
          <ExternalLink href={study.liveUrl} className="min-h-11 text-sm text-muted hover:text-fg">
            {ui.work.liveProduct}
          </ExternalLink>
        </p>
      </div>
    </header>
  );
}
