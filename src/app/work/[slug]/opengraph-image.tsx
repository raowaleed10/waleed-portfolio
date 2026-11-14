import { findCaseStudy } from "@/components/case-study/case-study-data";
import { caseStudies } from "@/content/projects";
import { sections, site } from "@/content/site";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

// One share image per case study, prerendered at build from the shared
// template in lib/og (fonts come from its `use cache` scope).
export const alt = `${site.name} — ${sections.work.label}`;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) return new Response(null, { status: 404 });

  return renderOgImage({
    eyebrow: `${site.name} · ${sections.work.index} / ${sections.work.label}`,
    title: study.name,
    subtitle: study.oneLiner,
  });
}
