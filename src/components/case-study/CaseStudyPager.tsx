import Link from "next/link";
import { Container, GRID } from "@/components/ui/Container";
import type { CaseStudy, CaseStudySlug } from "@/content/types";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";
import { caseStudyPath } from "@/lib/seo";
import { adjacentCaseStudies } from "./case-study-data";

/**
 * Previous / next case study, in homepage order and wrapping around, so
 * every page links to the other two. A plain list of links, not a <nav>
 * landmark (the site header already owns the one navigation landmark).
 *
 * A full-bleed hairline on top, like a homepage section. Phones: stacked,
 * split by a content-width hairline. md+: side by side on the grid, the next
 * study starting at column 7 (the homepage work rows' text column). Both
 * stay left-aligned; no arrows are added to link text.
 */
export function CaseStudyPager({ current }: { current: CaseStudySlug }) {
  const adjacent = adjacentCaseStudies(current);
  if (!adjacent) return null;

  return (
    <div className="border-t border-border">
      <Container>
        <ul className={cn(GRID, "py-4 md:py-8")}>
          <PagerItem label={ui.caseStudy.previous} study={adjacent.previous} className="md:col-span-6" />
          <PagerItem
            label={ui.caseStudy.next}
            study={adjacent.next}
            className="border-t border-border md:col-span-6 md:col-start-7 md:border-t-0"
          />
        </ul>
      </Container>
    </div>
  );
}

/**
 * The whole block is the link (label, name and one-liner), so the hit area
 * is generous; the name underlines on hover like a work row's name. Its
 * accessible name reads "Next case study ExcevoAI Multi-tenant AI …".
 */
function PagerItem({
  label,
  study,
  className,
}: {
  label: string;
  study: CaseStudy;
  className?: string;
}) {
  return (
    <li className={className}>
      <Link
        href={caseStudyPath(study.slug)}
        className="group -mx-2 block rounded-sm px-2 py-8 md:py-10"
      >
        <span className="label block text-muted">{label}</span>
        <span className="mt-3 block text-2xl font-medium underline decoration-transparent underline-offset-4 group-hover:decoration-muted">
          {study.name}
        </span>
        <span className="mt-2 block text-pretty text-muted">{study.oneLiner}</span>
      </Link>
    </li>
  );
}
