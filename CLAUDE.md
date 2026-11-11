# Waleed's Portfolio — Project Rules

Personal portfolio for **Rao Waleed**, full-stack developer (Django + React/Next.js, multi-tenant AI SaaS).
Goal: get hired for **remote full-stack roles** at international companies.
Audience: recruiters (30-second skim) and engineers (who will read the case studies and the code in this repo).

All site copy lives in `docs/content.md`. Read it fully before any UI work.

---

## Non-negotiables

- **No invented facts.** Use only what is in `docs/content.md`. Never add metrics, clients, technologies, dates, testimonials or claims.
- Lines marked `TODO(waleed)` are **not rendered**. Skip them and list them in your summary so I can fill them in.
- No lorem ipsum, no stock photos, no placeholder testimonials, no fake logos.
- **Employer confidentiality:** no screenshots or internal UI of Xtreeme Tech or Code Todo products. Show projects through original SVG architecture diagrams and the text in content.md only.
- **No phone number anywhere on the site.**
- Do not add dependencies beyond the approved stack below without asking me first.

---

## Stack

- Next.js (latest stable, App Router), TypeScript strict mode, ESLint
- Tailwind CSS; design tokens as CSS variables on `:root` / `[data-theme]`
- `motion` (Motion for React, formerly Framer Motion) for UI animation
- Lenis for smooth scrolling (disabled under reduced motion)
- GSAP + ScrollTrigger only if a pinned scroll section genuinely needs it (ask first)
- `next/font` (self-hosted fonts), `next/image`, `next/og` for the OG image
- `lucide-react` for icons
- Content as typed data in `src/content/` (converted from docs/content.md). No CMS, no backend.
- Every page statically generated

---

## Design direction: "Production-grade"

The site should feel like it was built by someone who runs real systems: precise, calm, technical, with a few moments that make people stop scrolling. Editorial typography meets a monitoring dashboard.

Avoid generic "AI portfolio" looks: purple/blue gradients, glassmorphism everywhere, floating blobs, emoji, everything centered, skill-logo walls.

### Palette (starting point — refine it, keep the concept)

- **Dark theme (default):** background `#0A0B0D`, surface `#111317`, border `#1F2329`, text `#ECE8E1` (warm off-white), muted `#8B8F98`
- **Accent "operational":** signal lime `#C8F04A` — used sparingly (status dots, key highlights, focus rings, active states)
- **Accent "incident":** amber `#FFB020` — only inside the incident log and the hero failover moment
- **Light theme:** warm paper `#F5F3EE` background, near-black text; darken both accents until they pass WCAG AA
- Theme toggle in the nav; follow `prefers-color-scheme` on first visit; no flash of the wrong theme

### Typography

- **Geist Sans** for UI and body; **Geist Mono** for labels, metadata, IDs and code-like details
- **Instrument Serif (italic)** for one emphasized word in big headlines only
- Big, confident display sizes on desktop; a strict type scale; comfortable body line-height

### Layout

- 12-column grid, generous whitespace, left-aligned editorial layout
- Thin 1px borders and hairline dividers; mono section labels like `01 / SELECTED WORK`
- Must look excellent at 375px wide, not just "work"

---

## Signature moments

1. **Hero — live architecture diagram.** An SVG system diagram beside the headline:
   Browser → React/Next.js → Django API → PostgreSQL, Redis, Celery workers, LLM providers (Claude, OpenAI), Stripe, Webhooks.
   - Small "packets" travel along the edges in a loop.
   - Every ~8s one LLM provider node flips amber ("degraded"), traffic visibly reroutes to the other provider, then it recovers — a nod to the multi-provider failover work.
   - Hover/tap a node to show its one-line tooltip from content.md.
   - Staggered draw-in on load. Mobile: simplified vertical version. Reduced motion: static diagram, no loops.
2. **Status line + live dual clock** under the hero (mono): pulsing lime dot, "Open to remote roles · Already working US & Canada Eastern hours", and live times for Lahore and New York (ET). Compute with `Intl.DateTimeFormat` using `Asia/Karachi` and `America/New_York` (never hard-code offsets — daylight saving must just work). Show "Online now" inside the 5 PM – 2 AM Pakistan-time window, otherwise "Off hours" with the next start time in ET. Render a static fallback on the server to avoid hydration mismatch, then update on the client every 30s.
3. **Metrics strip:** numbers count up once when scrolled into view.
4. **Incident log:** styled like a postmortem / monitoring log. Each entry: ID (INC-01…), product, severity, expandable Symptom → Root cause → Fix → Impact. The status dot starts amber and turns lime ("resolved") as the entry enters the viewport. This is the strongest differentiator — give it the most care.
5. **Case study pages** `/work/[slug]`, each with its own architecture diagram in the same visual language as the hero.

---

## Motion rules

- Animate only `transform` and `opacity`.
- Durations 200–700ms; custom easing such as `cubic-bezier(0.22, 1, 0.36, 1)`; subtle staggers.
- No loading screen, no scroll-jacking, no cursor-follower gimmicks, nothing that delays reading the hero text.
- Every animation has a `prefers-reduced-motion` fallback.
- Below-the-fold animated components are lazy-loaded.

---

## Pages and sections

- `/` — Hero, metrics strip, selected work (3 featured case studies + 1 smaller project), incident log, experience, stack, about, contact
- `/work/[slug]` — one page per featured case study
- Nav: name, section links, theme toggle, "Résumé" button (links to `/Rao-Waleed-CV.pdf` once I add it to `/public`)
- Footer: email, GitHub, LinkedIn, "Built with Next.js · Source on GitHub" linking to this repo

---

## Quality bar (check before every commit)

- `npm run lint` and `npm run build` pass with zero errors
- Use the **Playwright MCP** to screenshot every changed page at 375px, 768px and 1440px, in dark and light themes. Fix anything broken or ugly before moving on.
- Lighthouse (mobile) targets: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100
- LCP < 2s, CLS < 0.05; images via next/image; fonts via next/font
- Semantic HTML, visible focus states, full keyboard navigation, AA contrast in both themes
- SEO: per-page metadata, OG image via next/og, sitemap.xml, robots.txt, JSON-LD `Person` schema

---

## Workflow

- Use the **frontend-design** skill for all UI work.
- Build in small steps; one commit per step with conventional commits (`feat:`, `fix:`, `style:`, `chore:`).
- After each step, give me a 3-line summary: what changed, what you checked in screenshots, anything I need to decide.
- Keep components small and typed; keep copy out of components (it lives in `src/content/`).
