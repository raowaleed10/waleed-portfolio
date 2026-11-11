import type { SectionId } from "@/content/types";

/**
 * Section links point at the homepage ("/#work"), not just the fragment, so
 * they also work from the /work/[slug] pages.
 */
export function sectionHref(id: SectionId): `/#${SectionId}` {
  return `/#${id}`;
}

/**
 * Value for a nav link's aria-current. Links style their active state from
 * the attribute (`aria-[current=true]:`), so a scroll-spy can also set
 * aria-current="true" on `[data-nav-section="<id>"]` links directly.
 */
export function ariaCurrent(current: boolean): "true" | undefined {
  return current ? "true" : undefined;
}
