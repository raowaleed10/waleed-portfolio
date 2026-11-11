import { GRID } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { StatusDot } from "@/components/ui/StatusDot";
import { experience, presentLabel } from "@/content/experience";
import { sections } from "@/content/site";
import type { Role } from "@/content/types";
import { cn } from "@/lib/cn";

/*
 * From md, each role is a two-row grid: tenure metadata in the narrow left
 * column (row 1), the title and org beside it (row 1), the bullets below
 * (row 2). Explicit lines, not `order`, so the DOM keeps the heading first.
 * Each breakpoint restates its start line: `col-span-*` is the grid-column
 * shorthand, so `lg:col-span-*` would otherwise reset the md start.
 */
const META_COLS = "md:col-span-4 md:col-start-1 md:row-start-1 lg:col-span-3 lg:col-start-1";
const BODY_COLS = "md:col-span-8 md:col-start-5 lg:col-span-9 lg:col-start-4";

/**
 * 03 / Experience: a log of tenure, newest first. One hairline above each
 * role; on phones everything stacks in DOM order.
 */
export function Experience() {
  return (
    <Section meta={sections.experience}>
      <ol>
        {experience.map((role) => (
          <ExperienceRole key={`${role.org}-${role.start.iso}`} role={role} />
        ))}
      </ol>
    </Section>
  );
}

function ExperienceRole({ role }: { role: Role }) {
  const current = role.end === undefined;

  return (
    <li
      className={cn(
        GRID,
        "gap-y-4 border-t border-border py-8 last:pb-0 md:items-baseline md:gap-y-6 md:py-10",
      )}
    >
      {/* Heading first, so jumping by heading still reaches the dates next. */}
      <div className={cn(BODY_COLS, "md:row-start-1")}>
        <h3 className="text-xl font-medium text-balance">{role.title}</h3>
        <p className="mt-1 text-muted">{role.org}</p>
      </div>

      {/* The dot is a plain inline box: its bottom edge sits on the baseline,
          which centres it on the uppercase dates. Lime = the current role. */}
      <p className={cn(META_COLS, "label")}>
        <StatusDot tone={current ? "signal" : "muted"} className="mr-2.5" />
        <span className="whitespace-nowrap text-fg">
          <time dateTime={role.start.iso}>{role.start.label}</time>
          {" – "}
          {role.end ? <time dateTime={role.end.iso}>{role.end.label}</time> : presentLabel}
        </span>
        {/* Phones: same line as the dates. md+: its own line, indented past
            the dot (size-2 + mr-2.5 = 1.125rem) to line up with the dates. */}
        <span className="ml-3 whitespace-nowrap text-muted md:mt-1.5 md:ml-0 md:block md:pl-4.5">
          {role.place}
        </span>
      </p>

      <ul className={cn(BODY_COLS, "measure space-y-3 text-muted md:row-start-2")}>
        {role.bullets.map((bullet) => (
          <ExperienceBullet key={bullet}>{bullet}</ExperienceBullet>
        ))}
      </ul>
    </li>
  );
}

/**
 * A bullet with a short hairline marker and a hanging indent. The marker is
 * vertical-align: middle, which centres it on the x-height of the first line;
 * its width plus margin (1.25rem) equals the indent, so wrapped lines align.
 */
function ExperienceBullet({ children }: { children: string }) {
  return (
    <li className="pl-5 -indent-5 text-pretty before:mr-2.5 before:inline-block before:h-px before:w-2.5 before:bg-graphic before:align-middle">
      {children}
    </li>
  );
}
