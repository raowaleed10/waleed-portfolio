import { Fragment } from "react";
import { GRID } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { sections } from "@/content/site";
import { stack } from "@/content/stack";
import { cn } from "@/lib/cn";

/**
 * 04 / Stack: the intro line, then a definition list with one hairline per
 * row. Category in muted mono on the left, the items as a plain inline list
 * on the right (from md); stacked on phones.
 */
export function Stack() {
  return (
    <Section meta={sections.stack}>
      <p className="measure text-lg text-pretty text-muted">{stack.intro}</p>

      <dl className="mt-10 border-b border-border md:mt-12">
        {stack.groups.map((group) => (
          <div
            key={group.category}
            className={cn(GRID, "gap-y-1.5 border-t border-border py-4 md:items-baseline md:py-5")}
          >
            <dt className="label text-muted md:col-span-4 lg:col-span-3">{group.category}</dt>
            <dd className="md:col-span-8 lg:col-span-9">
              <StackItems items={group.items} />
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/** A trailing parenthetical, e.g. "PostgreSQL (indexing, query tuning, …)". */
const QUALIFIER = /^(.+?)\s+(\(.+\))$/;

/**
 * Items as running text, separated by muted commas. Each name stays on one
 * line; a trailing parenthetical is a qualifier, so it is muted and may wrap.
 * The rendered text is exactly the content string.
 */
function StackItems({ items }: { items: readonly string[] }) {
  return (
    <ul>
      {items.map((item, index) => {
        const [, name = item, qualifier] = QUALIFIER.exec(item) ?? [];
        const isLast = index === items.length - 1;
        const comma = isLast ? null : <span className="text-muted">,</span>;
        return (
          <li key={item} className="inline">
            {qualifier ? (
              <Fragment>
                <span className="whitespace-nowrap">{name}</span>{" "}
                <span className="text-muted">
                  {qualifier}
                  {comma}
                </span>
              </Fragment>
            ) : (
              <span className="whitespace-nowrap">
                {name}
                {comma}
              </span>
            )}
            {isLast ? null : " "}
          </li>
        );
      })}
    </ul>
  );
}
