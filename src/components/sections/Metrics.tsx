import { Container } from "@/components/ui/Container";
import { metrics } from "@/content/metrics";
import type { Metric } from "@/content/types";
import { cn } from "@/lib/cn";
import { CountUp, CountUpGroup } from "./CountUp";

const items: readonly Metric[] = metrics;

/*
 * Cells in the first column drop their left padding, so every first-column
 * number lines up with the page's content edge. Phones: the first cell spans
 * both columns, then two per row. md+: one row of five.
 */
function cellPadding(index: number): string {
  const firstOnPhone = index === 0 || index % 2 === 1;
  const firstFromMd = index === 0;
  return cn(
    firstOnPhone ? "pl-0" : "pl-4",
    !firstFromMd && "md:pl-4 lg:pl-6 xl:pl-8",
    index === 0 && "col-span-2 md:col-span-1",
  );
}

/**
 * The metrics strip under the hero: a full-width surface band read like a
 * monitoring panel. Hairline-separated cells, big tabular numbers, short
 * muted labels. No section label and not numbered.
 *
 * The hairlines are the 1px grid gaps showing the border color behind the
 * cells, so they meet the band's edges like table rules at every breakpoint.
 * The band draws its top hairline; the next section's top hairline closes it.
 *
 * Each cell is a dt (label) / dd (value) pair; the value is moved above the
 * label visually with `order-first`, so screen readers hear "label, value".
 */
export function Metrics() {
  return (
    <div className="border-t border-border bg-surface">
      <Container>
        <CountUpGroup>
          <dl className="grid grid-cols-2 gap-px bg-border md:grid-cols-5">
            {items.map((metric, index) => (
              <div
                key={metric.label}
                className={cn(
                  "flex flex-col bg-surface py-6 pr-4 md:py-8 lg:py-10 lg:pr-6 xl:pr-8",
                  cellPadding(index),
                )}
              >
                <dt className="mt-2 text-sm text-balance text-muted md:mt-3">{metric.label}</dt>
                <dd className="order-first text-3xl font-medium">
                  <CountUp value={metric.value} suffix={metric.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </CountUpGroup>
      </Container>
    </div>
  );
}
