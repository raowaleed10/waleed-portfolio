import type { ReactNode } from "react";
import type { SectionMeta } from "@/content/types";
import { cn } from "@/lib/cn";
import { Container } from "./Container";
import { SectionLabel } from "./SectionLabel";

/**
 * A homepage section: anchor id from content, a hairline on top, the mono
 * section label as its <h2>, and the shared vertical rhythm.
 */
export function Section({
  meta,
  children,
  className,
}: {
  meta: SectionMeta;
  children: ReactNode;
  className?: string;
}) {
  const labelId = `${meta.id}-label`;
  return (
    <section
      id={meta.id}
      aria-labelledby={labelId}
      tabIndex={-1}
      className={cn("border-t border-border py-(--section-pad) outline-none", className)}
    >
      <Container>
        <SectionLabel meta={meta} id={labelId} className="mb-10 md:mb-16" />
        {children}
      </Container>
    </section>
  );
}
