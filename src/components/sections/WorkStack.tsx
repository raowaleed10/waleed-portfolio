import { Tag } from "@/components/ui/Tag";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";

/**
 * A project's stack as a quiet row of neutral mono tags. There is no visible
 * heading, so the list carries the "Stack" label for screen readers.
 */
export function WorkStack({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul aria-label={ui.caseStudy.stack} className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
