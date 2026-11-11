import type { Diagram, DiagramId } from "./types";

/**
 * System graphs for the hero and the three case studies. Nodes, labels and
 * tooltips come from content.md; edges only encode relationships it states.
 * Coordinates live separately in components/diagram/layouts.
 */

export const heroDiagram = {
  id: "hero",
  title:
    "Architecture diagram: the browser running React and Next.js calls a Django API, which uses PostgreSQL and Redis, sends AI requests to Claude or OpenAI with failover between them, and receives Stripe events through webhooks. Celery workers run jobs from Redis and deliver webhooks.",
  nodes: [
    {
      id: "browser",
      label: "Browser",
      sublabel: "React / Next.js",
      tooltip:
        "React 19 and Next.js with TypeScript, Redux Toolkit, RTK Query, ReactFlow, Tailwind",
    },
    {
      id: "api",
      label: "Django API",
      tooltip: "Django REST Framework, Django Channels for WebSockets, OpenAPI docs",
    },
    {
      id: "postgres",
      label: "PostgreSQL",
      tooltip: "Schema design, targeted indexes, production-safe migrations, pgvector",
    },
    {
      id: "redis",
      label: "Redis",
      tooltip: "Celery pipelines and the Django Channels layer",
    },
    {
      id: "celery",
      label: "Celery workers",
      tooltip:
        "Backfills, scheduled jobs and webhook delivery with exponential-backoff retry",
    },
    { id: "claude", label: "Claude", group: "llm" },
    { id: "openai", label: "OpenAI", group: "llm" },
    {
      id: "stripe",
      label: "Stripe",
      tooltip:
        "Subscriptions, PaymentIntent credit purchases, idempotent webhook handling",
    },
    {
      id: "webhooks",
      label: "Webhooks",
      tooltip: "HMAC signature verification, per-tenant routing",
    },
  ],
  groups: [
    {
      id: "llm",
      label: "LLM providers",
      tooltip: "Anthropic Claude and OpenAI, with multi-provider failover",
    },
  ],
  edges: [
    { from: "browser", to: "api" },
    { from: "api", to: "postgres" },
    { from: "api", to: "redis" },
    { from: "redis", to: "celery" },
    { from: "api", to: "claude" },
    { from: "api", to: "openai" },
    { from: "stripe", to: "webhooks" },
    { from: "webhooks", to: "api" },
    { from: "celery", to: "webhooks" },
  ],
  failover: ["claude", "openai"],
} as const satisfies Diagram;

export const uchatbotsDiagram = {
  id: "uchatbots",
  title:
    "UChatbots architecture: customer websites chat over WebSocket or REST with a 10-app DRF backend, which runs a flow runtime with serialized pause and resume state, then AI orchestration that fails over between provider A and provider B. The ReactFlow editor talks to the backend, Stripe feeds credits and Google OAuth2 feeds auth.",
  nodes: [
    { id: "sites", label: "Customer websites" },
    { id: "chat", label: "Chat", sublabel: "WebSocket / REST" },
    { id: "backend", label: "DRF backend", sublabel: "10 apps" },
    { id: "runtime", label: "Flow runtime", sublabel: "serialized pause/resume state" },
    { id: "orchestration", label: "AI orchestration" },
    { id: "providerA", label: "Provider A", group: "providers" },
    { id: "providerB", label: "Provider B", group: "providers" },
    { id: "editor", label: "ReactFlow editor" },
    { id: "stripe", label: "Stripe" },
    { id: "oauth", label: "Google OAuth2", sublabel: "server-side code flow" },
  ],
  groups: [{ id: "providers", label: "failover" }],
  edges: [
    { from: "sites", to: "chat" },
    { from: "chat", to: "backend" },
    { from: "backend", to: "runtime" },
    { from: "runtime", to: "orchestration" },
    { from: "orchestration", to: "providerA" },
    { from: "orchestration", to: "providerB" },
    { from: "editor", to: "backend" },
    { from: "stripe", to: "backend", label: "credits" },
    { from: "oauth", to: "backend", label: "auth" },
  ],
  failover: ["providerA", "providerB"],
} as const satisfies Diagram;

export const excevoaiDiagram = {
  id: "excevoai",
  title:
    "ExcevoAI architecture: Freshdesk and Gorgias tickets reach the DRF API, which retrieves context with RAG on pgvector, drafts a reply with Claude via LangChain, and passes it through a guardrail engine to either an approved reply or human review. Shopify webhooks feed order capture, Celery runs the historical backfill, and knowledge documents go through an approval workflow into embeddings.",
  nodes: [
    { id: "tickets", label: "Freshdesk / Gorgias", sublabel: "tickets" },
    { id: "api", label: "DRF API" },
    { id: "rag", label: "RAG retrieval", sublabel: "pgvector" },
    { id: "llm", label: "Claude", sublabel: "via LangChain" },
    { id: "guardrail", label: "Guardrail engine" },
    { id: "reply", label: "Approved reply" },
    { id: "review", label: "Human review" },
    { id: "shopify", label: "Shopify webhooks" },
    { id: "orders", label: "Order capture" },
    { id: "celery", label: "Celery" },
    { id: "backfill", label: "Historical backfill" },
    { id: "documents", label: "Knowledge documents" },
    { id: "approval", label: "Approval workflow" },
    { id: "embeddings", label: "Embeddings" },
  ],
  edges: [
    { from: "tickets", to: "api" },
    { from: "api", to: "rag" },
    { from: "rag", to: "llm" },
    { from: "llm", to: "guardrail" },
    { from: "guardrail", to: "reply" },
    { from: "guardrail", to: "review" },
    { from: "shopify", to: "orders" },
    { from: "celery", to: "backfill" },
    { from: "documents", to: "approval" },
    { from: "approval", to: "embeddings" },
    // "a document-approval workflow that feeds reply generation"
    { from: "embeddings", to: "rag" },
  ],
} as const satisfies Diagram;

export const accountabuddyDiagram = {
  id: "accountabuddy",
  title:
    "Accountabuddy architecture: the browser, running React with a custom WebSocket client, talks through Nginx to Uvicorn ASGI workers and Django Channels, which exchanges messages with Redis through channels_redis. Alongside: the DRF API, Celery with beat running pairing, reminders and nightly jobs, and Stripe webhooks feeding an idempotent handler.",
  nodes: [
    { id: "browser", label: "Browser", sublabel: "React + custom WebSocket client" },
    { id: "nginx", label: "Nginx" },
    { id: "uvicorn", label: "Uvicorn ASGI" },
    { id: "channels", label: "Django Channels" },
    { id: "redis", label: "Redis", sublabel: "channels_redis" },
    { id: "api", label: "DRF API" },
    { id: "celery", label: "Celery + beat" },
    { id: "jobs", label: "Pairing, reminders, nightly jobs" },
    { id: "stripe", label: "Stripe webhooks" },
    { id: "handler", label: "Idempotent handler" },
  ],
  edges: [
    { from: "browser", to: "nginx", bidirectional: true },
    { from: "nginx", to: "uvicorn" },
    { from: "uvicorn", to: "channels" },
    { from: "channels", to: "redis", bidirectional: true },
    { from: "celery", to: "jobs" },
    { from: "stripe", to: "handler" },
  ],
} as const satisfies Diagram;

export const diagrams = {
  hero: heroDiagram,
  uchatbots: uchatbotsDiagram,
  excevoai: excevoaiDiagram,
  accountabuddy: accountabuddyDiagram,
} as const satisfies Record<DiagramId, Diagram>;
