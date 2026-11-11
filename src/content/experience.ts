import type { Role } from "./types";

export const experience = [
  {
    title: "Full-Stack Developer",
    org: "Xtreeme Tech",
    place: "Lahore",
    start: { label: "Feb 2026", iso: "2026-02" },
    bullets: [
      "Ship AI-integrated B2B products end to end on Django 5 and React 19 — 7 delivered since Feb 2026 — owning API contracts, PostgreSQL schema design, async workflows and deployment.",
      "Build some products solo from an empty repository to production; work with a product team on larger platforms like UChatbots and ExcevoAI.",
      "Keep client data strictly separated across 30+ models with scoped querysets, RBAC and Fernet-encrypted connector credentials, plus per-tenant HMAC webhook routing that avoids a full-table credential decrypt.",
      "Run historical backfills, scheduled jobs and outbound webhook delivery through Celery and Redis pipelines with exponential-backoff retry, keeping request paths fast under load.",
      "Gate every merge behind a 337-test suite (pytest, factory-boy) in GitHub Actions; deploy with Docker, OpenAPI docs and Sentry monitoring.",
    ],
  },
  {
    title: "Junior Python Developer",
    org: "Code Todo",
    place: "Remote",
    start: { label: "Sep 2024", iso: "2024-09" },
    end: { label: "Oct 2025", iso: "2025-10" },
    bullets: [
      "Built the DityTruck backend from scratch: 15+ DRF endpoints for a production truck-rental marketplace.",
      "Cut endpoint response times by 40% through schema design around real access patterns, targeted indexes and query restructuring on live traffic.",
      "Built 3 Playwright and Selenium scrapers aggregating 500+ listings daily, and automated reservation flows with Selenium WebDriver.",
      "Secured the admin panel with JWT authentication and role-based access control; deployed and ran the stack on Ubuntu with Nginx and Gunicorn.",
    ],
  },
  {
    title: "Freelance Full-Stack Developer",
    org: "Self-employed",
    place: "Lahore",
    start: { label: "Jun 2023", iso: "2023-06" },
    end: { label: "Sep 2024", iso: "2024-09" },
    bullets: [
      "Sole engineer on custom web systems for local businesses — inventory management, booking, admin dashboards — on Django/DRF with React, including authentication, role-based admin panels, payments and email.",
      "Replaced hours of manual data entry with Python scripts, scrapers and scheduled jobs; deployed on Linux VPS environments with Nginx and Gunicorn.",
    ],
  },
] as const satisfies readonly Role[];

/** Label used when a role has no end date. */
export const presentLabel = "Present";
