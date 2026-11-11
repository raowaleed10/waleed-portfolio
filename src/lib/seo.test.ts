import { describe, expect, it } from "vitest";
import { about } from "@/content/about";
import { caseStudies } from "@/content/projects";
import { site } from "@/content/site";
import { googleFontCssUrl, parseFontUrl, splitWords, titleFontSize } from "./og";
import {
  caseStudyPath,
  formatTitle,
  knowsAboutTopics,
  pageMetadata,
  parseLocation,
  personJsonLd,
  rootMetadata,
  serializeJsonLd,
  stripParenthetical,
  websiteJsonLd,
} from "./seo";
import { absoluteUrl } from "./site-url";

describe("titles", () => {
  it("suffixes the site name", () => {
    expect(formatTitle("UChatbots")).toBe("UChatbots — Rao Waleed");
  });

  it("uses the same template in the root metadata", () => {
    expect(rootMetadata.title).toEqual({
      default: site.title,
      template: "%s — Rao Waleed",
    });
  });
});

describe("rootMetadata", () => {
  it("leaves images to the opengraph-image file convention", () => {
    expect(rootMetadata.openGraph).not.toHaveProperty("images");
    expect(rootMetadata.twitter).not.toHaveProperty("images");
  });

  it("turns off telephone auto-linking", () => {
    expect(rootMetadata.formatDetection).toEqual({ telephone: false });
  });
});

describe("pageMetadata", () => {
  const meta = pageMetadata({
    title: "UChatbots",
    description: "Multi-tenant AI chatbot builder SaaS",
    path: caseStudyPath("uchatbots"),
    type: "article",
  });

  it("sets an absolute title so templates can't double the suffix", () => {
    expect(meta.title).toEqual({ absolute: "UChatbots — Rao Waleed" });
  });

  it("keeps canonical, og:url and titles consistent", () => {
    expect(meta.alternates).toEqual({ canonical: "/work/uchatbots" });
    expect(meta.openGraph).toMatchObject({
      type: "article",
      url: "/work/uchatbots",
      title: "UChatbots — Rao Waleed",
      description: "Multi-tenant AI chatbot builder SaaS",
      siteName: site.name,
      locale: "en_US",
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: "UChatbots — Rao Waleed",
    });
  });

  it("sets no images key (a sibling opengraph-image supplies it)", () => {
    expect(meta.openGraph).not.toHaveProperty("images");
    expect(meta.twitter).not.toHaveProperty("images");
  });

  it("defaults to type website", () => {
    const plain = pageMetadata({ title: "X", description: "Y", path: "/x" });
    expect(plain.openGraph).toMatchObject({ type: "website" });
  });
});

describe("content helpers", () => {
  it("strips parentheticals", () => {
    expect(
      stripParenthetical("PostgreSQL (indexing, query tuning, production-safe migrations)"),
    ).toBe("PostgreSQL");
    expect(stripParenthetical("Gunicorn / Uvicorn (ASGI)")).toBe("Gunicorn / Uvicorn");
    expect(stripParenthetical("Redis")).toBe("Redis");
  });

  it("parses the location into locality and country code", () => {
    expect(parseLocation("Lahore, Pakistan")).toEqual({ locality: "Lahore", country: "PK" });
    expect(parseLocation("Lahore")).toEqual({ locality: "Lahore" });
  });

  it("builds knowsAbout from the stack without parentheticals or duplicates", () => {
    const topics = knowsAboutTopics();
    expect(topics).toContain("PostgreSQL");
    expect(topics).toContain("Gunicorn");
    expect(topics).toContain("Uvicorn");
    expect(topics.filter((topic) => topic === "TypeScript")).toHaveLength(1);
    expect(topics.some((topic) => topic.includes("("))).toBe(false);
  });

  it("lists every case study path", () => {
    expect(caseStudies.map((study) => caseStudyPath(study.slug))).toEqual([
      "/work/uchatbots",
      "/work/excevoai",
      "/work/accountabuddy",
    ]);
  });
});

describe("personJsonLd", () => {
  const person = personJsonLd();

  it("describes the person from content only", () => {
    expect(person).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": absoluteUrl("/#person"),
      name: "Rao Waleed",
      jobTitle: "Full-Stack Developer",
      url: absoluteUrl("/"),
      email: "mailto:raowaleed.codemachine@gmail.com",
      sameAs: [site.linkedin, site.github],
      address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
    });
  });

  it("names the university and the AWS certificate", () => {
    expect(person.alumniOf).toEqual([
      {
        "@type": "CollegeOrUniversity",
        name: "University of Central Punjab",
        address: { "@type": "PostalAddress", addressLocality: "Lahore" },
      },
    ]);
    expect(person.hasCredential).toEqual([
      {
        "@type": "EducationalOccupationalCredential",
        name: "AWS Academy Cloud Foundations",
        credentialCategory: "certificate",
        recognizedBy: { "@type": "Organization", name: "Amazon Web Services" },
        dateCreated: "2024",
      },
    ]);
    expect(about.education).toHaveLength(2);
  });

  it("contains no phone number or TODO", () => {
    const json = JSON.stringify(person);
    expect(json).not.toMatch(/telephone|TODO/i);
    expect(json).not.toMatch(/\+?\d[\d\s-]{8,}\d/);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so a value can't close the script element", () => {
    const json = serializeJsonLd({ "@type": "Thing", name: "</script><script>alert(1)" });
    expect(json).not.toContain("<");
    expect(json).toContain("\\u003c/script>");
    expect(JSON.parse(json)).toEqual({ "@type": "Thing", name: "</script><script>alert(1)" });
  });

  it("wraps several nodes in one @graph and drops their own @context", () => {
    const document = JSON.parse(serializeJsonLd([personJsonLd(), websiteJsonLd()]));
    expect(document["@context"]).toBe("https://schema.org");
    expect(document["@graph"]).toHaveLength(2);
    for (const node of document["@graph"]) expect(node).not.toHaveProperty("@context");
    expect(document["@graph"][1]).toMatchObject({
      "@type": "WebSite",
      author: { "@id": absoluteUrl("/#person") },
    });
  });
});

describe("og template helpers", () => {
  it("marks the emphasized run inside a word", () => {
    expect(splitWords("keep it running in production.", "running")).toEqual([
      [{ text: "keep", emphasis: false }],
      [{ text: "it", emphasis: false }],
      [{ text: "running", emphasis: true }],
      [{ text: "in", emphasis: false }],
      [{ text: "production.", emphasis: false }],
    ]);
    expect(splitWords("keep it running.", "running")[2]).toEqual([
      { text: "running", emphasis: true },
      { text: ".", emphasis: false },
    ]);
  });

  it("ignores an emphasis that isn't in the text", () => {
    expect(splitWords("UChatbots", "running")).toEqual([[{ text: "UChatbots", emphasis: false }]]);
  });

  it("sizes short names large and long headlines small", () => {
    expect(titleFontSize("UChatbots")).toBe(136);
    expect(titleFontSize("Accountabuddy")).toBe(136);
    expect(
      titleFontSize("I build multi-tenant, AI-powered SaaS — and keep it running in production."),
    ).toBe(76);
  });

  it("builds Google Fonts URLs per face", () => {
    expect(googleFontCssUrl({ family: "Geist Mono", weight: 400, style: "normal" })).toBe(
      "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400",
    );
    expect(googleFontCssUrl({ family: "Instrument Serif", weight: 400, style: "italic" })).toBe(
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@1,400",
    );
  });

  it("picks the TrueType source and rejects WOFF2", () => {
    const ttf =
      "@font-face { src: url(https://fonts.gstatic.com/s/geist/v5/a.ttf) format('truetype'); }";
    const woff2 =
      "@font-face { src: url(https://fonts.gstatic.com/s/geist/v5/a.woff2) format('woff2'); }";
    expect(parseFontUrl(ttf)).toBe("https://fonts.gstatic.com/s/geist/v5/a.ttf");
    expect(parseFontUrl(woff2)).toBeNull();
  });
});
