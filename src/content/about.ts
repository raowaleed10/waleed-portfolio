import type { About } from "./types";

export const about = {
  paragraphs: [
    "I’m a full-stack developer in Lahore with 3+ years shipping production web apps on Django and React. I like owning a product end to end — schema, APIs, frontend, deployment — and I’m at my best when something breaks in production and needs a calm root cause rather than a guess.",
    "Lately I’ve been building multi-tenant, AI-integrated B2B platforms where tenant isolation and security aren’t optional. I’m looking for a remote full-stack role with a team that cares about shipping reliable software.",
    // TODO(waleed): optional one personal line (what you do outside code).
  ],
  educationHeading: "Education and certification",
  education: [
    {
      title: "BS Computer Science",
      org: "University of Central Punjab, Lahore",
      detail: "graduated Feb 2026",
    },
    {
      title: "AWS Academy Cloud Foundations",
      org: "Amazon Web Services",
      detail: "2024",
    },
  ],
} as const satisfies About;
