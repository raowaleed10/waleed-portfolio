import type { Clock, Hero } from "./types";

export const hero = {
  eyebrow: "FULL-STACK DEVELOPER · LAHORE, PK · WORKING US EASTERN HOURS",
  headline: {
    before: "I build multi-tenant, AI-powered SaaS — and keep it ",
    emphasis: "running",
    after: " in production.",
  },
  subheadline:
    "3+ years shipping Django and React products end to end: PostgreSQL schemas, API contracts, React frontends, deployment — and the production incidents in between.",
  primaryCta: { label: "View my work", href: "#work" },
  secondaryCta: { label: "Get in touch", href: "#contact" },
  resumeLabel: "Download résumé",
  status: "Open to remote roles · Already working US & Canada Eastern hours",
} as const satisfies Hero;

export const clock = {
  home: { label: "Lahore", timeZone: "Asia/Karachi", abbr: "PKT" },
  remote: { label: "New York", timeZone: "America/New_York", abbr: "ET" },
  window: { startHour: 17, endHour: 2 },
  online: "Online now — overlapping ET business hours",
  offline: "Off hours — online from 5 PM PKT ({time} ET)",
} as const satisfies Clock;
