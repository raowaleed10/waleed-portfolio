/**
 * Pure lookups for the case-study pages: slug guard, the pager's neighbours
 * and the incidents a study references. No React and no DOM, so all of it is
 * unit-tested (case-study-data.test.ts).
 */
import { incidentsById } from "@/content/incidents";
import { caseStudies, caseStudiesBySlug } from "@/content/projects";
import type { CaseStudy, CaseStudySlug, Incident } from "@/content/types";

/**
 * True for a slug that has a case study. An own-property check, so URL
 * segments such as "constructor" or "__proto__" never match the prototype.
 */
export function isCaseStudySlug(slug: string): slug is CaseStudySlug {
  return Object.hasOwn(caseStudiesBySlug, slug);
}

/** The case study for a URL segment, or undefined for an unknown slug. */
export function findCaseStudy(slug: string): CaseStudy | undefined {
  return isCaseStudySlug(slug) ? caseStudiesBySlug[slug] : undefined;
}

export interface AdjacentCaseStudies {
  readonly previous: CaseStudy;
  readonly next: CaseStudy;
}

/**
 * The studies before and after `slug` in page order, wrapping around at both
 * ends, so every page links to its neighbours. Null when the slug isn't in
 * the list or there is no other study to link to.
 */
export function adjacentCaseStudies(
  slug: CaseStudySlug,
  list: readonly CaseStudy[] = caseStudies,
): AdjacentCaseStudies | null {
  const index = list.findIndex((study) => study.slug === slug);
  if (index === -1 || list.length < 2) return null;
  return {
    previous: list[(index - 1 + list.length) % list.length],
    next: list[(index + 1) % list.length],
  };
}

/** The incidents a study lists under "Hard problems", in content order. */
export function caseStudyIncidents(study: CaseStudy): Incident[] {
  return study.incidents.map((id) => incidentsById[id]);
}
