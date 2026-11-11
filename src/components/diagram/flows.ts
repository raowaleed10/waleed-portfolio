import type { DiagramId } from "@/content/types";

/**
 * Packet traffic per diagram (step 7). A flow is a path of node ids where
 * every consecutive pair is a diagram edge (or the reverse of a
 * bidirectional one). A hop to either node of diagram.failover is decided at
 * the fork: packets alternate between the pair, or avoid a degraded one.
 * Weights set how often the scheduler picks each flow.
 */
export interface PacketFlow {
  readonly path: readonly string[];
  readonly weight: number;
}

export const packetFlows = {
  hero: [
    { path: ["browser", "api", "postgres"], weight: 3 },
    { path: ["browser", "api", "claude"], weight: 3 },
    { path: ["redis", "celery", "webhooks"], weight: 2 },
    { path: ["stripe", "webhooks", "api"], weight: 2 },
    { path: ["browser", "api", "redis"], weight: 1 },
  ],
  uchatbots: [
    { path: ["sites", "chat", "backend", "runtime", "orchestration", "providerA"], weight: 3 },
    { path: ["editor", "backend"], weight: 1 },
    { path: ["stripe", "backend"], weight: 1 },
    { path: ["oauth", "backend"], weight: 1 },
  ],
  excevoai: [
    { path: ["tickets", "api", "rag", "llm", "guardrail", "reply"], weight: 3 },
    { path: ["documents", "approval", "embeddings", "rag"], weight: 2 },
    { path: ["tickets", "api", "rag", "llm", "guardrail", "review"], weight: 1 },
    { path: ["shopify", "orders"], weight: 1 },
    { path: ["celery", "backfill"], weight: 1 },
  ],
  accountabuddy: [
    { path: ["browser", "nginx", "uvicorn", "channels", "redis"], weight: 3 },
    { path: ["redis", "channels"], weight: 1 },
    { path: ["nginx", "browser"], weight: 1 },
    { path: ["browser", "nginx", "uvicorn", "api"], weight: 1 },
    { path: ["celery", "jobs"], weight: 1 },
    { path: ["stripe", "api", "handler"], weight: 1 },
  ],
} as const satisfies Record<DiagramId, readonly PacketFlow[]>;

/** Spawn cadence and pool size. Project diagrams are gentler than the hero. */
export const packetTuning = {
  hero: { everyMs: 450, pool: 12 },
  uchatbots: { everyMs: 650, pool: 8 },
  excevoai: { everyMs: 650, pool: 8 },
  accountabuddy: { everyMs: 650, pool: 8 },
} as const satisfies Record<DiagramId, { everyMs: number; pool: number }>;
