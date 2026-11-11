import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { metrics } from "@/content/metrics";
import type { Metric } from "@/content/types";
import { Metrics } from "./Metrics";

const items: readonly Metric[] = metrics;
const html = renderToStaticMarkup(createElement(Metrics));

describe("Metrics server HTML", () => {
  it("renders every final value and label, so no-JS visitors see the truth", () => {
    for (const metric of items) {
      expect(html).toContain(metric.label);
      expect(html).toContain(`<span class="sr-only">${metric.value}${metric.suffix ?? ""}</span>`);
    }
  });

  it("hides the counting copy from screen readers and reserves its width", () => {
    for (const metric of items) {
      const final = `${metric.value}${metric.suffix ?? ""}`;
      expect(html).toContain(`--count-w:${final.length}ch`);
      expect(html).toMatch(new RegExp(`aria-hidden="true"[^>]*><span>${metric.value}</span>`));
    }
  });

  it("keeps one dt/dd pair per metric", () => {
    expect(html.match(/<dt /g)).toHaveLength(items.length);
    expect(html.match(/<dd /g)).toHaveLength(items.length);
  });
});
