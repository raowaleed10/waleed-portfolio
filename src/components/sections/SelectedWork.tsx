import { Section } from "@/components/ui/Section";
import { selectedWork } from "@/content/projects";
import { sections } from "@/content/site";
import { WorkRow } from "./WorkRow";

/**
 * 01 / Selected work: the intro line, then the four featured case studies as
 * editorial rows split by hairlines (no cards), each led by a labelled
 * sketch of its architecture. Everything is static server HTML (inline SVG).
 */
export function SelectedWork() {
  return (
    <Section meta={sections.work}>
      <p className="measure text-lg text-pretty text-muted">{selectedWork.intro}</p>

      <div className="mt-10 md:mt-12">
        {selectedWork.featured.map((project) => (
          <WorkRow key={project.slug} project={project} />
        ))}
      </div>
    </Section>
  );
}
