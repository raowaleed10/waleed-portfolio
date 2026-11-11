import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { selectedWork } from "@/content/projects";
import { ui } from "@/content/ui";
import { SelectedWork } from "./SelectedWork";

const html = renderToStaticMarkup(createElement(SelectedWork));

/** Visible text: tags stripped, entities decoded, whitespace collapsed. */
const text = html
  .replace(/<[^>]+>/g, " ")
  .replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ");

describe("SelectedWork server HTML", () => {
  it("contains every word of the featured case studies", () => {
    expect(text).toContain(selectedWork.intro);
    for (const project of selectedWork.featured) {
      for (const copy of [
        project.name,
        project.oneLiner,
        project.status,
        project.company,
        project.cardSummary,
        ...project.stack,
      ]) {
        expect(text).toContain(copy);
      }
    }
  });

  it("links each row to its case study and its live product", () => {
    for (const project of selectedWork.featured) {
      expect(html).toContain(`href="/work/${project.slug}"`);
      expect(html).toContain(`href="${project.liveUrl}"`);
    }
    expect(text.split(ui.work.readCaseStudy)).toHaveLength(selectedWork.featured.length + 1);
  });

  it("gives each row one keyboard stop for its case study", () => {
    for (const project of selectedWork.featured) {
      const links = html.match(new RegExp(`<a [^>]*href="/work/${project.slug}"[^>]*>`, "g")) ?? [];
      expect(links.filter((tag) => !tag.includes('tabindex="-1"'))).toHaveLength(1);
    }
  });

  it("draws a static sketch per row and none for the small project", () => {
    expect(html.match(/data-layer="nodes"/g)).toHaveLength(selectedWork.featured.length);
  });

  it("contains the small project without placeholders", () => {
    const { small } = selectedWork;
    for (const copy of [small.name, small.oneLiner, small.company, small.summary, small.also, ...small.stack]) {
      expect(text).toContain(copy);
    }
    // Case-sensitive: "Code Todo" is a company name.
    expect(html).not.toMatch(/TODO/);
  });
});
