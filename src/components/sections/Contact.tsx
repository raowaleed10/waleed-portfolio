import { ButtonLink } from "@/components/ui/ButtonLink";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Section } from "@/components/ui/Section";
import { contact } from "@/content/contact";
import { sections, site } from "@/content/site";
import { hasResume, resumeHref } from "@/lib/resume";
import { CopyEmailButton } from "./CopyEmailButton";

/** ExternalLink's underline, for the (internal) résumé download. */
const linkUnderline =
  "underline decoration-border-strong underline-offset-4 hover:decoration-current";

/**
 * 06 / Contact: the page's closing statement. Left-aligned from column 1 like
 * the hero, so the page opens and closes on the same edge: the heading, the
 * body, the email action (mirroring the hero's CTA row), then the profiles.
 * Sans, not the footer's small mono, so the two never read as one block.
 */
export function Contact() {
  return (
    <Section meta={sections.contact}>
      {/* max-w-[12em] gives a balanced two-line statement from md up. */}
      <h3 className="max-w-[12em] text-3xl font-medium text-balance">{contact.heading}</h3>

      <p className="measure mt-6 text-lg text-pretty text-muted md:mt-8">{contact.body}</p>

      {/* Phones: two full-width buttons. From sm: one row. */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-12">
        <ButtonLink href={`mailto:${site.email}`}>{site.email}</ButtonLink>
        <CopyEmailButton />
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-8 md:mt-10">
        <li>
          <ExternalLink href={site.linkedin} className="min-h-11">
            {contact.links.linkedin}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink href={site.github} className="min-h-11">
            {contact.links.github}
          </ExternalLink>
        </li>
        {hasResume ? (
          <li>
            <a href={resumeHref} download className={`inline-flex min-h-11 items-center ${linkUnderline}`}>
              {contact.links.resume}
            </a>
          </li>
        ) : null}
      </ul>
    </Section>
  );
}
