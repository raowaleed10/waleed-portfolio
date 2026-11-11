import { Section } from "@/components/ui/Section";
import { incidentLog } from "@/content/incidents";
import { sections } from "@/content/site";
import { IncidentLogBoard } from "./IncidentLogBoard";

/**
 * 02 / Incident log: production incidents as a postmortem-style log.
 *
 * Server component. Every word (intro, rows and all five traces) is in the
 * prerendered HTML; collapsed traces are `hidden`, then `hidden="until-found"`
 * after hydration so find-in-page reaches them. The interactive parts live
 * in IncidentLogBoard.
 */
export function IncidentLog() {
  return (
    <Section meta={sections.incidents}>
      <IncidentLogBoard intro={incidentLog.intro} entries={incidentLog.entries} />
    </Section>
  );
}
