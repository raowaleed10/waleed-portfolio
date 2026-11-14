import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/projects";
import type { CaseStudy } from "@/content/types";
import {
  adjacentCaseStudies,
  caseStudyIncidents,
  findCaseStudy,
  isCaseStudySlug,
} from "./case-study-data";

describe("isCaseStudySlug / findCaseStudy", () => {
  it("finds every featured study by its slug", () => {
    for (const study of caseStudies) {
      expect(isCaseStudySlug(study.slug)).toBe(true);
      expect(findCaseStudy(study.slug)).toBe(study);
    }
  });

  it("rejects unknown slugs, including inherited property names", () => {
    for (const slug of ["", "ditytruck", "UChatbots", "constructor", "__proto__", "toString"]) {
      expect(isCaseStudySlug(slug)).toBe(false);
      expect(findCaseStudy(slug)).toBeUndefined();
    }
  });
});

describe("adjacentCaseStudies", () => {
  it("links each study to its neighbours in page order, wrapping at both ends", () => {
    const [first, second, third] = caseStudies;
    expect(adjacentCaseStudies(first.slug)).toEqual({ previous: third, next: second });
    expect(adjacentCaseStudies(second.slug)).toEqual({ previous: first, next: third });
    expect(adjacentCaseStudies(third.slug)).toEqual({ previous: second, next: first });
  });

  it("never links a page to itself", () => {
    for (const study of caseStudies) {
      const adjacent = adjacentCaseStudies(study.slug);
      expect(adjacent?.previous.slug).not.toBe(study.slug);
      expect(adjacent?.next.slug).not.toBe(study.slug);
    }
  });

  it("returns null when there is nothing else to link to", () => {
    const [only] = caseStudies;
    expect(adjacentCaseStudies(only.slug, [only])).toBeNull();
    expect(adjacentCaseStudies(only.slug, [])).toBeNull();
    const others: CaseStudy[] = caseStudies.filter((study) => study.slug !== only.slug);
    expect(adjacentCaseStudies(only.slug, others)).toBeNull();
  });
});

describe("caseStudyIncidents", () => {
  it("resolves every referenced incident, in content order, for the right product", () => {
    for (const study of caseStudies) {
      const incidents = caseStudyIncidents(study);
      expect(incidents.map((incident) => incident.id)).toEqual(study.incidents);
      for (const incident of incidents) {
        expect(incident.projectSlug).toBe(study.slug);
      }
    }
  });
});
