import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { findCaseStudy } from "@/components/case-study/case-study-data";
import { CaseStudyPager } from "@/components/case-study/CaseStudyPager";
import { caseStudies } from "@/content/projects";
import { caseStudyPath, pageMetadata } from "@/lib/seo";

/*
 * /work/[slug]: one prerendered page per featured case study. The root
 * layout's ensureStatic = "navigation" requires generateStaticParams.
 * `dynamicParams` is not exported (Cache Components rejects it): an unknown
 * slug renders, hits notFound() and gets the static 404.
 */

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) notFound();

  return pageMetadata({
    title: study.name,
    description: study.cardSummary,
    path: caseStudyPath(study.slug),
    type: "article",
  });
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) notFound();

  return (
    <>
      <CaseStudy study={study} />
      <CaseStudyPager current={study.slug} />
    </>
  );
}
