import { GRID } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { about } from "@/content/about";
import { sections } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * 05 / About: the two paragraphs in reading measure (the first in `fg`, the
 * second muted, like the hero's headline and subheadline), then one hairline
 * row: the education heading in the left column, the credentials beside it.
 */
export function About() {
  return (
    <Section meta={sections.about}>
      <div className="measure space-y-6 text-lg text-pretty">
        {about.paragraphs.map((paragraph, index) => (
          <p key={paragraph} className={index === 0 ? "text-fg" : "text-muted"}>
            {paragraph}
          </p>
        ))}
      </div>

      <div
        className={cn(
          GRID,
          "mt-16 gap-y-4 border-t border-border pt-6 md:mt-24 md:items-baseline md:pt-8",
        )}
      >
        <h3 className="label text-muted md:col-span-4 lg:col-span-3">{about.educationHeading}</h3>
        <ul className="space-y-5 md:col-span-8 lg:col-span-9">
          {about.education.map((credential) => (
            <li key={credential.title}>
              <p>{credential.title}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted">
                <span>{credential.org}</span>
                <span className="label">{credential.detail}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
