import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { navSections, site } from "@/content/site";
import type { SectionId, SectionMeta } from "@/content/types";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";
import { hasResume, resumeHref } from "@/lib/resume";
import { MobileMenu } from "./MobileMenu";
import { ariaCurrent, sectionHref } from "./nav-links";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The site header: a sticky 64px bar on a solid background with a bottom
 * hairline. Name on the left; from `lg` the section links, theme toggle and
 * résumé button; below `lg` the theme toggle and the mobile menu.
 *
 * `currentSection` marks one link as the active section (aria-current).
 * Nothing sets it yet; see NavLink for the hook.
 */
export function Nav({ currentSection }: { currentSection?: SectionId }) {
  return (
    <header className="sticky top-0 z-(--z-nav) h-(--nav-height) border-b border-border bg-bg">
      <Container as="nav" className="flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          className="-ml-2 inline-flex h-11 shrink-0 items-center rounded-sm px-2 text-sm font-medium text-fg"
        >
          {site.name}
        </Link>

        <div className="flex h-full items-center">
          <ul className="hidden h-full lg:flex">
            {navSections.map((section) => (
              <NavLink
                key={section.id}
                section={section}
                current={section.id === currentSection}
              />
            ))}
          </ul>
          <span aria-hidden className="mx-3 hidden h-4 w-px bg-border lg:block" />
          {/* When it is the last item, pull the icon flush with the content edge. */}
          <ThemeToggle className={cn(!hasResume && "lg:-mr-3.5")} />
          {hasResume && (
            <div className="ml-3 hidden lg:block">
              <ButtonLink href={resumeHref} variant="secondary">
                {ui.nav.resume}
              </ButtonLink>
            </div>
          )}
          <MobileMenu currentSection={currentSection} />
        </div>
      </Container>
    </header>
  );
}

/**
 * One inline section link (lg and up), rendered as an <li>.
 *
 * Active state: pass `current`, or set aria-current="true" on the
 * `[data-nav-section]` link from a scroll-spy. Either way the label turns
 * `fg` and a 1px signal line scales in over the nav's bottom hairline.
 */
export function NavLink({ section, current = false }: { section: SectionMeta; current?: boolean }) {
  return (
    <li className="relative flex h-full items-center">
      <Link
        href={sectionHref(section.id)}
        aria-current={ariaCurrent(current)}
        data-nav-section={section.id}
        className="peer label inline-flex h-11 items-center rounded-sm px-3 text-muted hover:text-fg aria-[current=true]:text-fg"
      >
        {section.navLabel}
      </Link>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-signal transition-transform duration-(--dur-base) ease-out peer-aria-[current=true]:scale-x-100"
      />
    </li>
  );
}
