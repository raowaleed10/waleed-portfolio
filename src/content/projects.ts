import type { CaseStudy, CaseStudySlug, SelectedWork, SmallProject } from "./types";

export const uchatbots = {
  slug: "uchatbots",
  name: "UChatbots",
  oneLiner: "Multi-tenant AI chatbot builder SaaS",
  company: "Xtreeme Tech · built with a product team",
  status: "Live on 8 customer sites",
  liveUrl: "https://app.uchatbots.com",
  // TODO(waleed): confirm the full stack (TypeScript? PostgreSQL? Redis? Celery?)
  // and your exact scope on the team.
  stack: [
    "Django REST Framework",
    "WebSockets",
    "React",
    "ReactFlow",
    "pnpm + Turborepo monorepo",
    "Stripe",
    "OAuth2",
  ],
  cardSummary:
    "A chatbot builder with a visual flow editor, multi-provider AI orchestration and credit-based billing, taken from zero to production.",
  context:
    "Businesses design and run AI chatbots on one shared multi-tenant platform, with a visual editor for conversation flows and credits that pay for AI usage.",
  built: [
    "A backend with 82 REST endpoints plus WebSocket, organized as a 10-app Django REST Framework project inside a pnpm/Turborepo monorepo.",
    "Multi-provider AI orchestration that keeps the product serving when one vendor fails, with user credits deducted atomically under concurrency.",
    "A visual flow editor in ReactFlow with 11 node types, including an autonomous ReAct agent, and a runtime engine that supports multi-turn pause/resume by serializing execution state.",
    "Stripe subscription billing and PaymentIntent credit purchases.",
    "Moved Google sign-in from a client-side id_token to a server-side OAuth2 authorization-code flow for stronger XSS resistance.",
    "A client auth layer with a queue-based Axios token-refresh interceptor and BroadcastChannel cross-tab session sync.",
  ],
  incidents: ["INC-03", "INC-04"],
  outcome: "In production on 8 live customer sites; 4 broken production paths recovered.",
  diagram: "uchatbots",
} as const satisfies CaseStudy;

export const excevoai = {
  slug: "excevoai",
  name: "ExcevoAI",
  oneLiner: "Multi-tenant AI customer-support platform",
  company: "Xtreeme Tech · built with a product team",
  status:
    "Used daily by a 10+ agent support team; multi-tenant version live with pilot customers",
  liveUrl: "https://ai.excevo.co.uk",
  stack: [
    "Django REST Framework",
    "React 19",
    "TypeScript",
    "Anthropic Claude API",
    "LangChain",
    "pgvector",
    "sentence-transformers",
    "Celery",
    "Shopify Admin API",
    "Freshdesk",
    "Gorgias",
  ],
  cardSummary:
    "AI-drafted support replies grounded in each client’s own knowledge base, with guardrails that stop risky promises before they reach customers.",
  context:
    "Started as a private portal for Axparis, whose support team works in Freshdesk, then grew into a multi-tenant product for other support teams.",
  built: [
    "AI-generated ticket replies through the Anthropic Claude API and LangChain, integrated with Freshdesk and Gorgias.",
    "A per-client RAG knowledge base on pgvector with sentence-transformers embeddings, plus a document-approval workflow that feeds reply generation.",
    "Shopify order integration: webhook-driven real-time capture plus an async Celery backfill of historical orders.",
    "A multi-stage AI guardrail engine that blocks risky automated commitments, such as unverified refund promises, and escalates ambiguous cases to human review.",
  ],
  incidents: ["INC-05"],
  outcome:
    "Used daily by Axparis’s 10+ agent support team; the multi-tenant version is live with pilot customers.",
  diagram: "excevoai",
} as const satisfies CaseStudy;

export const accountabuddy = {
  slug: "accountabuddy",
  name: "Accountabuddy",
  oneLiner: "Real-time virtual coworking platform",
  company: "Xtreeme Tech · sole engineer",
  status: "Live with paying subscribers",
  liveUrl: "https://app.accountabuddy.net",
  stack: [
    "Django REST Framework",
    "Django Channels",
    "React",
    "Redux Toolkit",
    "custom WebSocket client",
    "Celery",
    "django-celery-beat",
    "Stripe",
    "Docker Compose",
    "Nginx",
    "Uvicorn (ASGI)",
  ],
  cardSummary:
    "Live-video coworking with auto-paired sessions and synchronized timers, built and run solo.",
  context:
    "A live-video coworking product where users are auto-paired into sessions with timers that stay in sync for everyone in real time.",
  built: [
    "The whole product as sole engineer: DRF backend and React + Redux Toolkit frontend.",
    "Real-time synchronized timers over Django Channels with a custom WebSocket client.",
    "Automated session pairing, reminder emails and nightly calculations with Celery and django-celery-beat.",
    "Stripe subscriptions across 3 tiers.",
    "Deployment with Docker Compose, Nginx and Uvicorn ASGI workers.",
  ],
  incidents: ["INC-01", "INC-02"],
  outcome:
    "Core live-session feature restored after a total outage, and billing made reliable for paying subscribers.",
  diagram: "accountabuddy",
} as const satisfies CaseStudy;

export const dityTruck = {
  name: "DityTruck",
  oneLiner: "Truck-rental marketplace backend",
  company: "Code Todo (remote) · small team under a team lead",
  stack: [
    "Django REST Framework",
    "PostgreSQL",
    "JWT",
    "Nginx",
    "Gunicorn",
    "Ubuntu",
    "Playwright",
    "Selenium",
  ],
  summary:
    "Built the backend from scratch, 15+ DRF endpoints for a production marketplace, and cut response times by 40% by designing the schema around real access patterns, adding targeted indexes and restructuring the heaviest queries on live traffic.",
  also: "3 Playwright and Selenium scrapers aggregating 500+ listings daily from three sources.",
  // TODO(waleed): public URL, if there is one.
} as const satisfies SmallProject;

/** Featured case studies, in page order. */
export const caseStudies: readonly CaseStudy[] = [uchatbots, excevoai, accountabuddy];

export const caseStudiesBySlug: Readonly<Record<CaseStudySlug, CaseStudy>> = {
  uchatbots,
  excevoai,
  accountabuddy,
};

export const selectedWork = {
  intro: "Products I’ve built and run in production.",
  featured: caseStudies,
  small: dityTruck,
} as const satisfies SelectedWork;
