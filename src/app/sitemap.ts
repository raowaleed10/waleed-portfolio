import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/projects";
import { caseStudyPath } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

// The homepage and one page per featured case study, as absolute URLs.
// No lastModified: content carries no edit dates, and the build doesn't make
// them up from the clock.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/") },
    ...caseStudies.map((study) => ({ url: absoluteUrl(caseStudyPath(study.slug)) })),
  ];
}
