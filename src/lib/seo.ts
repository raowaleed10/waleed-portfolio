import type { Metadata, Viewport } from "next";
import { about } from "@/content/about";
import type { CaseStudySlug, StackGroup } from "@/content/types";
import { site } from "@/content/site";
import { stack } from "@/content/stack";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

/*
 * Site-wide SEO: root metadata and viewport, per-page metadata, and the
 * JSON-LD graph. Every value comes from src/content. Nothing here reads the
 * request or the clock, so all of it prerenders under ensureStatic.
 */

/* ------------------------------------------------------------- titles */

/** Child pages render as "UChatbots — Rao Waleed". */
export const titleTemplate = `%s — ${site.name}`;

/** Fills the title template, for places Next.js doesn't apply it (OG, Twitter). */
export function formatTitle(title: string): string {
  return titleTemplate.replace("%s", title);
}

/** Path of a case-study page. */
export function caseStudyPath(slug: CaseStudySlug): `/work/${CaseStudySlug}` {
  return `/work/${slug}`;
}

/* ----------------------------------------------------------- metadata */

const OG_LOCALE = "en_US";

/**
 * Root layout metadata. The OG/Twitter image comes from app/opengraph-image.tsx
 * through the file convention, so no `images` key is set here (setting one,
 * even to undefined, would stop Next.js from attaching the generated image).
 */
export const rootMetadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: site.title, template: titleTemplate },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: OG_LOCALE,
    url: "/",
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // No phone number anywhere on the site; stop iOS turning digits into tel: links.
  formatDetection: { telephone: false },
};

export interface PageMetadataInput {
  /** Bare page title ("UChatbots"); the " — Rao Waleed" suffix is added here. */
  readonly title: string;
  readonly description: string;
  /** Site-relative path ("/work/uchatbots"). Resolved against metadataBase. */
  readonly path: string;
  /** "article" suits case studies. Defaults to "website". */
  readonly type?: "website" | "article";
}

/**
 * Metadata for any page below the root. Next.js merges metadata shallowly,
 * so `openGraph` and `twitter` are complete objects here rather than partial
 * overrides of the root ones.
 *
 * Images are deliberately absent: a sibling `opengraph-image.tsx` in the
 * page's segment supplies og:image, and Twitter inherits it from openGraph.
 * Without one, the page would have no OG image (the root image is replaced
 * along with the root `openGraph` object).
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: PageMetadataInput): Metadata {
  const fullTitle = formatTitle(title);
  return {
    // `absolute`, so the result is the same whichever segment calls this.
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      locale: OG_LOCALE,
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/* ----------------------------------------------------------- viewport */

/**
 * Browser chrome color per OS theme: --bg in tokens.css (dark default, light
 * paper). Change both together.
 */
export const rootViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0B0D" },
    { media: "(prefers-color-scheme: light)", color: "#F5F3EE" },
  ],
  colorScheme: "dark light",
};

/* ------------------------------------------------------------ JSON-LD */

type JsonLdValue = string | number | boolean | null | JsonLdNode | readonly JsonLdValue[];

/** A JSON-LD object (a document or a node inside one). */
export interface JsonLdNode {
  readonly [key: string]: JsonLdValue;
}

const SCHEMA_CONTEXT = "https://schema.org";
const PERSON_ID = absoluteUrl("/#person");
const WEBSITE_ID = absoluteUrl("/#website");

/** ISO 3166-1 codes for the countries content uses (site.location). */
const COUNTRY_CODES: Readonly<Record<string, string>> = { Pakistan: "PK" };

/** "PostgreSQL (indexing, query tuning, …)" → "PostgreSQL". */
export function stripParenthetical(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, "").trim();
}

/** "Lahore, Pakistan" → { locality: "Lahore", country: "PK" }. */
export function parseLocation(location: string): { locality: string; country?: string } {
  const [locality, ...rest] = location.split(",").map((part) => part.trim());
  const countryName = rest.join(", ");
  if (!countryName) return { locality };
  return { locality, country: COUNTRY_CODES[countryName] ?? countryName };
}

/**
 * Topics for Person.knowsAbout: every stack item, parentheticals dropped,
 * "A / B" pairs split, duplicates (TypeScript is listed twice) removed.
 */
export function knowsAboutTopics(groups: readonly StackGroup[] = stack.groups): string[] {
  const topics = groups
    .flatMap((group) => group.items)
    .flatMap((item) => stripParenthetical(item).split(" / "))
    .map((topic) => topic.trim())
    .filter(Boolean);
  return [...new Set(topics)];
}

const isUniversity = (org: string) => /\b(University|College)\b/i.test(org);

/** "University of Central Punjab, Lahore" → name + optional city. */
function splitOrg(org: string): { name: string; locality?: string } {
  const [name, ...rest] = org.split(",").map((part) => part.trim());
  return rest.length ? { name, locality: rest.join(", ") } : { name };
}

function alumniOf(): JsonLdNode[] {
  return about.education
    .filter((entry) => isUniversity(entry.org))
    .map((entry) => {
      const { name, locality } = splitOrg(entry.org);
      return {
        "@type": "CollegeOrUniversity",
        name,
        ...(locality ? { address: { "@type": "PostalAddress", addressLocality: locality } } : {}),
      };
    });
}

/** Certifications: the education entries that aren't a university degree. */
function credentials(): JsonLdNode[] {
  return about.education
    .filter((entry) => !isUniversity(entry.org))
    .map((entry) => ({
      "@type": "EducationalOccupationalCredential",
      name: entry.title,
      credentialCategory: "certificate",
      recognizedBy: { "@type": "Organization", name: entry.org },
      // The detail is the year ("2024"); anything else is left out.
      ...(/^\d{4}$/.test(entry.detail) ? { dateCreated: entry.detail } : {}),
    }));
}

/** schema.org Person for Rao Waleed, built only from src/content. */
export function personJsonLd(): JsonLdNode {
  const { locality, country } = parseLocation(site.location);
  const credentialNodes = credentials();
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    jobTitle: site.role,
    description: site.description,
    url: absoluteUrl("/"),
    email: `mailto:${site.email}`,
    sameAs: [site.linkedin, site.github],
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      ...(country ? { addressCountry: country } : {}),
    },
    alumniOf: alumniOf(),
    ...(credentialNodes.length ? { hasCredential: credentialNodes } : {}),
    knowsAbout: knowsAboutTopics(),
  };
}

/** schema.org WebSite, linked to the Person by @id. */
export function websiteJsonLd(): JsonLdNode {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: site.name,
    alternateName: site.title,
    description: site.description,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

/**
 * JSON for a <script type="application/ld+json">. Several nodes become one
 * @graph document. "<" is escaped as < so a value can never close the
 * script element (Next.js JSON-LD guidance).
 */
export function serializeJsonLd(data: JsonLdNode | readonly JsonLdNode[]): string {
  const document: JsonLdNode = isNodeList(data)
    ? { "@context": SCHEMA_CONTEXT, "@graph": data.map(withoutContext) }
    : data;
  return JSON.stringify(document).replace(/</g, "\\u003c");
}

function isNodeList(data: JsonLdNode | readonly JsonLdNode[]): data is readonly JsonLdNode[] {
  return Array.isArray(data);
}

function withoutContext(node: JsonLdNode): JsonLdNode {
  return Object.fromEntries(Object.entries(node).filter(([key]) => key !== "@context"));
}
