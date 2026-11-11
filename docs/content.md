# Site Content — Rao Waleed

Source: Rao Waleed's CV (November 2026). Every fact below comes from it.
Lines marked `TODO(waleed)` need Waleed's input. The site skips them until they are filled in.

---

## Meta

- Name: Rao Waleed
- Role: Full-Stack Developer
- Location: Lahore, Pakistan (UTC+5)
- Availability: Open to remote roles. Already works US/Canada Eastern business hours from Pakistan (5 PM – 2 AM PKT).
- Email: raowaleed.codemachine@gmail.com
- LinkedIn: https://linkedin.com/in/rao-waleed-0204922a5
- GitHub: https://github.com/raowaleed10
- Résumé download: /Rao-Waleed-CV.pdf (use a copy of the CV without the phone number)
- Site title: Rao Waleed — Full-Stack Developer
- Meta description: Full-stack developer building multi-tenant, AI-integrated SaaS with Django, React and PostgreSQL, from schema design to production. Open to remote roles and already working US Eastern hours.
- TODO(waleed): domain name

---

## Section labels

- 01 / Selected work
- 02 / Incident log
- 03 / Experience
- 04 / Stack
- 05 / About
- 06 / Contact

---

## Hero

- Eyebrow (mono): FULL-STACK DEVELOPER · LAHORE, PK · WORKING US EASTERN HOURS
- Headline: I build multi-tenant, AI-powered SaaS — and keep it *running* in production.
  - Italic serif on the word "running"
- Subheadline: 3+ years shipping Django and React products end to end: PostgreSQL schemas, API contracts, React frontends, deployment — and the production incidents in between.
- Primary CTA: View my work → #work
- Secondary CTA: Get in touch → #contact
- Tertiary link: Download résumé
- Status line: ● Open to remote roles · Already working US & Canada Eastern hours
- Live clock (next to the status line, mono): shows the current time in Lahore and in New York (ET), computed in the browser with `Intl` and the time zones `Asia/Karachi` and `America/New_York`, so daylight saving is handled automatically.
  - During Waleed's working window (5 PM – 2 AM Pakistan time): "● Online now — overlapping ET business hours"
  - Outside it: "● Off hours — online from 5 PM PKT (<that time converted to ET>)"
  - Example of the conversion: in winter 5 PM – 2 AM PKT = 7 AM – 4 PM ET; in summer (US daylight saving) it = 8 AM – 5 PM ET.

### Hero diagram — node tooltips

- Browser / React: React 19 and Next.js with TypeScript, Redux Toolkit, RTK Query, ReactFlow, Tailwind
- Django API: Django REST Framework, Django Channels for WebSockets, OpenAPI docs
- PostgreSQL: Schema design, targeted indexes, production-safe migrations, pgvector
- Redis: Celery pipelines and the Django Channels layer
- Celery workers: Backfills, scheduled jobs and webhook delivery with exponential-backoff retry
- LLM providers: Anthropic Claude and OpenAI, with multi-provider failover
- Stripe: Subscriptions, PaymentIntent credit purchases, idempotent webhook handling
- Webhooks: HMAC signature verification, per-tenant routing

---

## Metrics strip

- 3+ — years shipping production web apps
- 7 — products shipped since Feb 2026
- 337 — tests gating every merge
- 8 — live customer sites on UChatbots
- 40% — lower API response times on DityTruck

---

## 01 / Selected work

Intro: Products I've built and run in production.

### UChatbots (featured)

- Slug: uchatbots
- One-liner: Multi-tenant AI chatbot builder SaaS
- Company: Xtreeme Tech · built with a product team
- Status: Live on 8 customer sites
- Live URL: https://app.uchatbots.com
- Stack: Django REST Framework, WebSockets, React, ReactFlow, pnpm + Turborepo monorepo, Stripe, OAuth2
- TODO(waleed): confirm the full stack (TypeScript? PostgreSQL? Redis? Celery?) and your exact scope on the team
- Card summary: A chatbot builder with a visual flow editor, multi-provider AI orchestration and credit-based billing, taken from zero to production.
- Context: Businesses design and run AI chatbots on one shared multi-tenant platform, with a visual editor for conversation flows and credits that pay for AI usage.
- What I built:
  - A backend with 82 REST endpoints plus WebSocket, organized as a 10-app Django REST Framework project inside a pnpm/Turborepo monorepo.
  - Multi-provider AI orchestration that keeps the product serving when one vendor fails, with user credits deducted atomically under concurrency.
  - A visual flow editor in ReactFlow with 11 node types, including an autonomous ReAct agent, and a runtime engine that supports multi-turn pause/resume by serializing execution state.
  - Stripe subscription billing and PaymentIntent credit purchases.
  - Moved Google sign-in from a client-side id_token to a server-side OAuth2 authorization-code flow for stronger XSS resistance.
  - A client auth layer with a queue-based Axios token-refresh interceptor and BroadcastChannel cross-tab session sync.
- Hard problems: see INC-03 and INC-04
- Outcome: In production on 8 live customer sites; 4 broken production paths recovered.
- Architecture diagram nodes: Customer websites → Chat (WebSocket / REST) → DRF backend (10 apps) → Flow runtime (serialized pause/resume state) → AI orchestration → Provider A / Provider B (failover). Side nodes: ReactFlow editor → DRF backend; Stripe → credits; Google OAuth2 (server-side code flow) → auth.

### ExcevoAI (featured)

- Slug: excevoai
- One-liner: Multi-tenant AI customer-support platform
- Company: Xtreeme Tech · built with a product team
- Status: Used daily by a 10+ agent support team; multi-tenant version live with pilot customers
- Live URL: https://ai.excevo.co.uk
- Stack: Django REST Framework, React 19, TypeScript, Anthropic Claude API, LangChain, pgvector, sentence-transformers, Celery, Shopify Admin API, Freshdesk, Gorgias
- Card summary: AI-drafted support replies grounded in each client's own knowledge base, with guardrails that stop risky promises before they reach customers.
- Context: Started as a private portal for Axparis, whose support team works in Freshdesk, then grew into a multi-tenant product for other support teams.
- What I built:
  - AI-generated ticket replies through the Anthropic Claude API and LangChain, integrated with Freshdesk and Gorgias.
  - A per-client RAG knowledge base on pgvector with sentence-transformers embeddings, plus a document-approval workflow that feeds reply generation.
  - Shopify order integration: webhook-driven real-time capture plus an async Celery backfill of historical orders.
  - A multi-stage AI guardrail engine that blocks risky automated commitments, such as unverified refund promises, and escalates ambiguous cases to human review.
- Hard problems: see INC-05
- Outcome: Used daily by Axparis's 10+ agent support team; the multi-tenant version is live with pilot customers.
- Architecture diagram nodes: Freshdesk / Gorgias tickets → DRF API → RAG retrieval (pgvector) → Claude via LangChain → Guardrail engine → approved reply or human review. Side nodes: Shopify webhooks → order capture; Celery → historical backfill; knowledge documents → approval workflow → embeddings.

### Accountabuddy (featured)

- Slug: accountabuddy
- One-liner: Real-time virtual coworking platform
- Company: Xtreeme Tech · sole engineer
- Status: Live with paying subscribers
- Live URL: https://app.accountabuddy.net
- Stack: Django REST Framework, Django Channels, React, Redux Toolkit, custom WebSocket client, Celery, django-celery-beat, Stripe, Docker Compose, Nginx, Uvicorn (ASGI)
- Card summary: Live-video coworking with auto-paired sessions and synchronized timers, built and run solo.
- Context: A live-video coworking product where users are auto-paired into sessions with timers that stay in sync for everyone in real time.
- What I built:
  - The whole product as sole engineer: DRF backend and React + Redux Toolkit frontend.
  - Real-time synchronized timers over Django Channels with a custom WebSocket client.
  - Automated session pairing, reminder emails and nightly calculations with Celery and django-celery-beat.
  - Stripe subscriptions across 3 tiers.
  - Deployment with Docker Compose, Nginx and Uvicorn ASGI workers.
- Hard problems: see INC-01 and INC-02
- Outcome: Core live-session feature restored after a total outage, and billing made reliable for paying subscribers.
- Architecture diagram nodes: Browser (React + custom WebSocket client) ⇄ Nginx → Uvicorn ASGI → Django Channels ⇄ Redis (channels_redis). Uvicorn ASGI → DRF API (the HTTP API runs on the same ASGI workers). Stripe webhooks → DRF API → idempotent handler (the handler lives in the DRF API). Side nodes: Celery + beat → pairing, reminders, nightly jobs.

### DityTruck (smaller card, no case-study page)

- One-liner: Truck-rental marketplace backend
- Company: Code Todo (remote) · small team under a team lead
- Stack: Django REST Framework, PostgreSQL, JWT, Nginx, Gunicorn, Ubuntu, Playwright, Selenium
- Summary: Built the backend from scratch, 15+ DRF endpoints for a production marketplace, and cut response times by 40% by designing the schema around real access patterns, adding targeted indexes and restructuring the heaviest queries on live traffic.
- Also: 3 Playwright and Selenium scrapers aggregating 500+ listings daily from three sources.
- TODO(waleed): public URL, if there is one

---

## 02 / Incident log

Intro: Production doesn't fail politely. A few incidents I've root-caused on live systems — symptom first, then the real cause.

### INC-01 · Accountabuddy · Critical

- Symptom: 100% of live sessions dropped five seconds after connecting.
- Root cause: Not application logic. The fixed five-second interval traced back to an unconfigured Redis socket timeout in channels_redis.
- Fix: Configured the channels_redis socket timeout correctly.
- Impact: Core live-session feature restored.

### INC-02 · Accountabuddy · Billing

- Symptom: Paying subscribers across 3 Stripe tiers were being silently double-charged.
- Root cause: A webhook parsing bug, plus event handling that wasn't idempotent against Stripe's retries.
- Fix: Fixed the parsing and made webhook event handling idempotent.
- Impact: Double-charges ended for live subscribers.

### INC-03 · UChatbots · Data integrity

- Symptom: Users' saved flows were getting corrupted.
- Root cause: A "ghost edge" bug in the flow data.
- TODO(waleed): one line on what created the ghost edges
- TODO(waleed): one line on the fix
- Impact: Saved flows working again in production.

### INC-04 · UChatbots · Billing

- Symptom: New sign-ups were landing with zero credits.
- Root cause: A race condition between the OAuth sign-up flow and billing.
- TODO(waleed): one line on the fix
- Impact: Sign-up path recovered.

### INC-05 · ExcevoAI · Integrations

- Symptom: A tenant's Shopify orders stopped being captured after their store was renamed.
- Root cause: Webhook routing broke after the rename; traced it against Shopify's canonical domain API.
- TODO(waleed): one line on the fix
- Impact: Order capture restored for the affected tenant.

---

## 03 / Experience

### Full-Stack Developer — Xtreeme Tech, Lahore

- Dates: Feb 2026 – Present
- Ship AI-integrated B2B products end to end on Django 5 and React 19 — 7 delivered since Feb 2026 — owning API contracts, PostgreSQL schema design, async workflows and deployment.
- Build some products solo from an empty repository to production; work with a product team on larger platforms like UChatbots and ExcevoAI.
- Keep client data strictly separated across 30+ models with scoped querysets, RBAC and Fernet-encrypted connector credentials, plus per-tenant HMAC webhook routing that avoids a full-table credential decrypt.
- Run historical backfills, scheduled jobs and outbound webhook delivery through Celery and Redis pipelines with exponential-backoff retry, keeping request paths fast under load.
- Gate every merge behind a 337-test suite (pytest, factory-boy) in GitHub Actions; deploy with Docker, OpenAPI docs and Sentry monitoring.

### Junior Python Developer — Code Todo (Remote)

- Dates: Sep 2024 – Oct 2025
- Built the DityTruck backend from scratch: 15+ DRF endpoints for a production truck-rental marketplace.
- Cut endpoint response times by 40% through schema design around real access patterns, targeted indexes and query restructuring on live traffic.
- Built 3 Playwright and Selenium scrapers aggregating 500+ listings daily, and automated reservation flows with Selenium WebDriver.
- Secured the admin panel with JWT authentication and role-based access control; deployed and ran the stack on Ubuntu with Nginx and Gunicorn.

### Freelance Full-Stack Developer — Self-employed, Lahore

- Dates: Jun 2023 – Sep 2024
- Sole engineer on custom web systems for local businesses — inventory management, booking, admin dashboards — on Django/DRF with React, including authentication, role-based admin panels, payments and email.
- Replaced hours of manual data entry with Python scripts, scrapers and scheduled jobs; deployed on Linux VPS environments with Nginx and Gunicorn.

---

## 04 / Stack

Intro: What I use in production.

- Languages: Python, TypeScript, JavaScript, SQL
- Backend: Django, Django REST Framework, Django Channels, Celery, FastAPI, REST API design
- Frontend: React, Next.js, TypeScript, Redux Toolkit, RTK Query, ReactFlow, Tailwind CSS, Vite
- Data: PostgreSQL (indexing, query tuning, production-safe migrations), Redis, pgvector
- AI / LLM: Anthropic Claude API, OpenAI API, LangChain, RAG pipelines, sentence-transformers
- Security & auth: OAuth2 / OIDC, JWT with refresh-token rotation, RBAC, HMAC signature verification, Fernet encryption
- Infrastructure & testing: Docker, Nginx, Gunicorn / Uvicorn (ASGI), GitHub Actions CI/CD, AWS, Linux, Sentry, pytest
- Integrations: Stripe, Shopify Admin API, Freshdesk, Gorgias

---

## 05 / About

I'm a full-stack developer in Lahore with 3+ years shipping production web apps on Django and React. I like owning a product end to end — schema, APIs, frontend, deployment — and I'm at my best when something breaks in production and needs a calm root cause rather than a guess.

Lately I've been building multi-tenant, AI-integrated B2B platforms where tenant isolation and security aren't optional. I'm looking for a remote full-stack role with a team that cares about shipping reliable software.

- TODO(waleed): optional one personal line (what you do outside code)

### Education and certification

- BS Computer Science — University of Central Punjab, Lahore (graduated Feb 2026)
- AWS Academy Cloud Foundations — Amazon Web Services, 2024

---

## 06 / Contact

- Heading: Let's build something that stays up.
- Body: I'm open to remote full-stack roles. I already work US and Canada Eastern hours from Lahore (5 PM – 2 AM Pakistan time), so your team gets a full working day of real-time overlap. Email is the fastest way to reach me.
- Email button: raowaleed.codemachine@gmail.com (with copy-to-clipboard)
- Links: LinkedIn, GitHub, Résumé

---

## Footer

- © 2026 Rao Waleed · Built with Next.js · Source on GitHub

---

## UI labels

Interface wording approved during the plan review. These are labels, not facts.

- Nav links: Work · Incidents · Experience · Stack · About · Contact
- Nav button: Résumé
- Mobile menu: Menu / Close
- Skip link: Skip to content
- Theme toggle (accessible labels): Switch to light theme / Switch to dark theme
- Selected work: Read case study · Live product
- Case study sections: Context · What I built · Hard problems · Outcome · Stack
- Case study navigation: Previous case study · Next case study
- Incident log column headers: Status · ID · Product · Type · Symptom
- Incident log controls: Expand all / Collapse all
- Incident steps: Symptom · Root cause · Fix · Impact
- Incident status: Resolved
- Hero diagram accessible name: Architecture diagram
- Hero diagram states: degraded · recovered
- Clock labels: Lahore · New York
- Contact: Copy email / Copied
- 404 page: This page doesn't exist. · Back to the homepage
