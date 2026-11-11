import type { excevoaiDiagram } from "@/content/diagrams";
import type { LayoutFor } from "../types";

type ExcevoaiLayout = LayoutFor<typeof excevoaiDiagram>;

/*
 * Desktop, 720 × 268. The knowledge pipeline runs along the top and feeds
 * RAG retrieval from above; the ticket pipeline runs left to right, then turns
 * down into the guardrail's decision (◆). The two integration pairs sit
 * bottom left.
 *
 *  ┌ Knowledge documents ┐─▶┌ Approval workflow ┐─▶┌ Embeddings ┐
 *                                                      ▼
 *  ┌ Freshdesk / Gorgias ┐─▶┌ DRF API ┐─▶┌ RAG retrieval ┐─▶┌ Claude ───────┐
 *  └ tickets ────────────┘              └ pgvector ─────┘  └ via LangChain ┘
 *                                                                  ▼
 *  ┌ Shopify webhooks ┐─▶┌ Order capture ┐            ┌ Guardrail engine ┐
 *                                                     ┌────────◆────────┐
 *  ┌ Celery ┐─▶┌ Historical backfill ┐     ┌ Approved reply ┐  ┌ Human review ┐
 */
export const excevoaiDesktop = {
  width: 720,
  height: 268,
  nodes: {
    documents: { x: 0, y: 0, w: 172, h: 32 },
    approval: { x: 208, y: 0, w: 160, h: 32 },
    embeddings: { x: 404, y: 0, w: 112, h: 32 },
    tickets: { x: 0, y: 72, w: 172, h: 44 },
    api: { x: 208, y: 78, w: 96, h: 32 },
    rag: { x: 340, y: 72, w: 132, h: 44 },
    llm: { x: 508, y: 72, w: 132, h: 44 },
    guardrail: { x: 498, y: 156, w: 152, h: 32 },
    reply: { x: 430, y: 236, w: 136, h: 32 },
    review: { x: 582, y: 236, w: 136, h: 32 },
    shopify: { x: 0, y: 156, w: 152, h: 32 },
    orders: { x: 188, y: 156, w: 132, h: 32 },
    celery: { x: 0, y: 236, w: 96, h: 32 },
    backfill: { x: 132, y: 236, w: 172, h: 32 },
  },
  junctions: [{ id: "guardrail-fork", x: 574, y: 212 }],
  edges: [
    {
      from: "tickets",
      to: "api",
      points: [
        { x: 172, y: 94 },
        { x: 208, y: 94 },
      ],
    },
    {
      from: "api",
      to: "rag",
      points: [
        { x: 304, y: 94 },
        { x: 340, y: 94 },
      ],
    },
    {
      from: "rag",
      to: "llm",
      points: [
        { x: 472, y: 94 },
        { x: 508, y: 94 },
      ],
    },
    {
      from: "llm",
      to: "guardrail",
      points: [
        { x: 574, y: 116 },
        { x: 574, y: 156 },
      ],
    },
    {
      from: "guardrail",
      to: "reply",
      via: "guardrail-fork",
      points: [
        { x: 574, y: 188 },
        { x: 574, y: 212 },
        { x: 498, y: 212 },
        { x: 498, y: 236 },
      ],
    },
    {
      from: "guardrail",
      to: "review",
      via: "guardrail-fork",
      points: [
        { x: 574, y: 188 },
        { x: 574, y: 212 },
        { x: 650, y: 212 },
        { x: 650, y: 236 },
      ],
    },
    {
      from: "shopify",
      to: "orders",
      points: [
        { x: 152, y: 172 },
        { x: 188, y: 172 },
      ],
    },
    {
      from: "celery",
      to: "backfill",
      points: [
        { x: 96, y: 252 },
        { x: 132, y: 252 },
      ],
    },
    {
      from: "documents",
      to: "approval",
      points: [
        { x: 172, y: 16 },
        { x: 208, y: 16 },
      ],
    },
    {
      from: "approval",
      to: "embeddings",
      points: [
        { x: 368, y: 16 },
        { x: 404, y: 16 },
      ],
    },
    {
      from: "embeddings",
      to: "rag",
      points: [
        { x: 440, y: 32 },
        { x: 440, y: 72 },
      ],
    },
  ],
} as const satisfies ExcevoaiLayout;

/*
 * Mobile, 335 × 612. The ticket pipeline is a centered spine (x = 86); the
 * knowledge pipeline comes down the right column (x = 255) and joins RAG
 * retrieval from the side. The decision forks straight down to "Approved
 * reply" and across to "Human review"; the integration pairs close it out.
 */
export const excevoaiMobile = {
  width: 335,
  height: 612,
  nodes: {
    documents: { x: 163, y: 0, w: 172, h: 32 },
    tickets: { x: 0, y: 64, w: 172, h: 44 },
    api: { x: 38, y: 140, w: 96, h: 32 },
    approval: { x: 175, y: 140, w: 160, h: 32 },
    rag: { x: 20, y: 204, w: 132, h: 44 },
    embeddings: { x: 199, y: 210, w: 112, h: 32 },
    llm: { x: 20, y: 280, w: 132, h: 44 },
    guardrail: { x: 10, y: 356, w: 152, h: 32 },
    reply: { x: 18, y: 436, w: 136, h: 32 },
    review: { x: 170, y: 436, w: 136, h: 32 },
    shopify: { x: 0, y: 508, w: 152, h: 32 },
    orders: { x: 188, y: 508, w: 132, h: 32 },
    celery: { x: 0, y: 580, w: 96, h: 32 },
    backfill: { x: 132, y: 580, w: 172, h: 32 },
  },
  junctions: [{ id: "guardrail-fork", x: 86, y: 412 }],
  edges: [
    {
      from: "tickets",
      to: "api",
      points: [
        { x: 86, y: 108 },
        { x: 86, y: 140 },
      ],
    },
    {
      from: "api",
      to: "rag",
      points: [
        { x: 86, y: 172 },
        { x: 86, y: 204 },
      ],
    },
    {
      from: "rag",
      to: "llm",
      points: [
        { x: 86, y: 248 },
        { x: 86, y: 280 },
      ],
    },
    {
      from: "llm",
      to: "guardrail",
      points: [
        { x: 86, y: 324 },
        { x: 86, y: 356 },
      ],
    },
    {
      from: "guardrail",
      to: "reply",
      via: "guardrail-fork",
      points: [
        { x: 86, y: 388 },
        { x: 86, y: 412 },
        { x: 86, y: 436 },
      ],
    },
    {
      from: "guardrail",
      to: "review",
      via: "guardrail-fork",
      points: [
        { x: 86, y: 388 },
        { x: 86, y: 412 },
        { x: 238, y: 412 },
        { x: 238, y: 436 },
      ],
    },
    {
      from: "shopify",
      to: "orders",
      points: [
        { x: 152, y: 524 },
        { x: 188, y: 524 },
      ],
    },
    {
      from: "celery",
      to: "backfill",
      points: [
        { x: 96, y: 596 },
        { x: 132, y: 596 },
      ],
    },
    {
      from: "documents",
      to: "approval",
      points: [
        { x: 255, y: 32 },
        { x: 255, y: 140 },
      ],
    },
    {
      from: "approval",
      to: "embeddings",
      points: [
        { x: 255, y: 172 },
        { x: 255, y: 210 },
      ],
    },
    {
      from: "embeddings",
      to: "rag",
      points: [
        { x: 199, y: 226 },
        { x: 152, y: 226 },
      ],
    },
  ],
} as const satisfies ExcevoaiLayout;
