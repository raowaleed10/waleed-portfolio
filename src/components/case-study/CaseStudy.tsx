import { IncidentEntry } from "@/components/sections/IncidentEntry";
import { Container } from "@/components/ui/Container";
import type { CaseStudy as CaseStudyContent } from "@/content/types";
import { ui } from "@/content/ui";
import { BuiltList } from "./BuiltList";
import { caseStudyIncidents } from "./case-study-data";
import { CaseStudyDiagram } from "./CaseStudyDiagram";
import { CaseStudyHeader } from "./CaseStudyHeader";
import { CaseStudySection } from "./CaseStudySection";

const HEADING_ID = "case-study-title";

/** Fragment ids of the parts, e.g. "/work/uchatbots#hard-problems". */
const PART_IDS = {
  context: "context",
  built: "built",
  hardProblems: "hard-problems",
  outcome: "outcome",
} as const;

/**
 * One case study, top to bottom: the title block, the architecture diagram,
 * then Context → What I built → Hard problems → Outcome as hairline rows.
 * Server markup throughout; only the diagram hydrates (its packets and, for
 * UChatbots, the provider failover).
 *
 * Headings: the project name is the <h1>, each part an <h2> (mono label),
 * each incident an <h3>.
 */
export function CaseStudy({ study }: { study: CaseStudyContent }) {
  const incidents = caseStudyIncidents(study);

  return (
    <article
      aria-labelledby={HEADING_ID}
      className="pt-12 md:pt-20 xl:pt-24"
    >
      <Container>
        <CaseStudyHeader study={study} headingId={HEADING_ID} />

        <div className="mt-12 md:mt-16">
          <CaseStudyDiagram slug={study.slug} />
        </div>

        <div className="mt-16 md:mt-24">
          <CaseStudySection id={PART_IDS.context} label={ui.caseStudy.context}>
            <p className="measure text-lg text-pretty">{study.context}</p>
          </CaseStudySection>

          <CaseStudySection id={PART_IDS.built} label={ui.caseStudy.built}>
            <BuiltList items={study.built} />
          </CaseStudySection>

          {incidents.length > 0 ? (
            <CaseStudySection id={PART_IDS.hardProblems} label={ui.caseStudy.hardProblems}>
              {/* Each entry is capped at the reading measure, so its
                  "Resolved" label ends where the trace text does instead of
                  at the far edge of a wide column. */}
              <div className="space-y-12 md:space-y-16">
                {incidents.map((incident) => (
                  <IncidentEntry
                    key={incident.id}
                    incident={incident}
                    variant="standalone"
                    headingLevel={3}
                    className="measure"
                  />
                ))}
              </div>
            </CaseStudySection>
          ) : null}

          <CaseStudySection id={PART_IDS.outcome} label={ui.caseStudy.outcome}>
            <p className="text-2xl font-medium text-balance">{study.outcome}</p>
          </CaseStudySection>
        </div>
      </Container>
    </article>
  );
}
