import type { Footer, SectionId, SectionMeta, SiteMeta } from "./types";

// TODO(waleed): domain name. Until it exists, lib/site-url.ts falls back to
// NEXT_PUBLIC_SITE_URL, then the Vercel production URL, then localhost.
export const site = {
  name: "Rao Waleed",
  role: "Full-Stack Developer",
  location: "Lahore, Pakistan",
  availability:
    "Open to remote roles. Already works US/Canada Eastern business hours from Pakistan (5 PM – 2 AM PKT).",
  email: "raowaleed.codemachine@gmail.com",
  linkedin: "https://linkedin.com/in/rao-waleed-0204922a5",
  github: "https://github.com/raowaleed10",
  sourceRepo: "https://github.com/raowaleed10/waleed-portfolio",
  resumeHref: "/Rao-Waleed-CV.pdf",
  title: "Rao Waleed — Full-Stack Developer",
  description:
    "Full-stack developer building multi-tenant, AI-integrated SaaS with Django, React and PostgreSQL, from schema design to production. Open to remote roles and already working US Eastern hours.",
} as const satisfies SiteMeta;

export const sections = {
  work: { id: "work", index: "01", label: "Selected work", navLabel: "Work" },
  incidents: { id: "incidents", index: "02", label: "Incident log", navLabel: "Incidents" },
  experience: { id: "experience", index: "03", label: "Experience", navLabel: "Experience" },
  stack: { id: "stack", index: "04", label: "Stack", navLabel: "Stack" },
  about: { id: "about", index: "05", label: "About", navLabel: "About" },
  contact: { id: "contact", index: "06", label: "Contact", navLabel: "Contact" },
} as const satisfies Record<SectionId, SectionMeta>;

/** Nav order matches page order. */
export const navSections: readonly SectionMeta[] = [
  sections.work,
  sections.incidents,
  sections.experience,
  sections.stack,
  sections.about,
  sections.contact,
];

export const footer = {
  copyright: "© 2026 Rao Waleed",
  builtWith: "Built with Next.js",
  source: { label: "Source on GitHub", href: site.sourceRepo },
} as const satisfies Footer;
