import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { contact } from "@/content/contact";
import { footer as credits, site } from "@/content/site";

/** Same underline treatment as ExternalLink, for the (internal) mailto link. */
const linkUnderline =
  "underline decoration-border-strong underline-offset-4 hover:decoration-current";

/**
 * Site footer: the three ways to reach Rao (email address, GitHub, LinkedIn),
 * then the copyright and source line.
 */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="pt-6 pb-8 md:pt-8 md:pb-10">
        <ul className="flex flex-col items-start font-mono text-sm text-fg md:flex-row md:flex-wrap md:items-center md:gap-x-8">
          <li className="max-w-full">
            <a
              href={`mailto:${site.email}`}
              className={`inline-flex min-h-11 items-center wrap-anywhere ${linkUnderline}`}
            >
              {site.email}
            </a>
          </li>
          <li className="max-w-full">
            <ExternalLink href={site.github} className="min-h-11">
              {contact.links.github}
            </ExternalLink>
          </li>
          <li className="max-w-full">
            <ExternalLink href={site.linkedin} className="min-h-11">
              {contact.links.linkedin}
            </ExternalLink>
          </li>
        </ul>

        {/* Below 640px the copyright takes its own line, so a separator
            never dangles at a line end. */}
        <p className="mt-6 flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted md:mt-2">
          <span className="basis-full sm:basis-auto">{credits.copyright}</span>
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <span>{credits.builtWith}</span>
          <span aria-hidden>·</span>
          <ExternalLink href={credits.source.href} className="min-h-11 hover:text-fg">
            {credits.source.label}
          </ExternalLink>
        </p>
      </Container>
    </footer>
  );
}
