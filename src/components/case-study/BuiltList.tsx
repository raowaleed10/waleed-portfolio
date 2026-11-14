import { cn } from "@/lib/cn";

/**
 * "What I built" as a list with the homepage Experience bullets' marker: a
 * short hairline with a hanging indent. The marker is vertical-align:
 * middle, which centres it on the first line's x-height; its width plus
 * margin (1.25rem) equals the indent, so wrapped lines align.
 *
 * Unlike Experience (where the role title leads and the bullets are muted),
 * the bullets are this section's main content, so they are set in `fg`.
 */
export function BuiltList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("measure space-y-4", className)}>
      {items.map((item) => (
        <li
          key={item}
          className="pl-5 -indent-5 text-pretty before:mr-2.5 before:inline-block before:h-px before:w-2.5 before:bg-graphic before:align-middle"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
