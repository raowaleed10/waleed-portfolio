import type { CaseStudySlug, Diagram } from "@/content/types";
import type { DiagramLayout } from "../types";

/*
 * Labelled thumbnails for the homepage work rows: each project's 6 most
 * important nodes, same labels as its case-study diagram (no sublabels, no
 * group frames), in a 300-unit-wide viewBox. Thumbnails render ≥ 279px wide
 * (a 375px phone), so 12-unit labels stay ≥ 11px; on wide screens the work
 * row caps them at max-w-sm. Checked by layouts.test.ts like every layout.
 */

/** UChatbots: the request path into multi-provider orchestration. */
const uchatbots: DiagramLayout = {
  width: 300,
  height: 172,
  nodes: {
    chat: { x: 0, y: 0, w: 64, h: 32 },
    backend: { x: 100, y: 0, w: 112, h: 32 },
    runtime: { x: 0, y: 64, w: 120, h: 32 },
    orchestration: { x: 0, y: 128, w: 148, h: 32 },
    providerA: { x: 196, y: 96, w: 104, h: 32 },
    providerB: { x: 196, y: 140, w: 104, h: 32 },
  },
  junctions: [{ id: "fork", x: 172, y: 144 }],
  edges: [
    { from: "chat", to: "backend", points: [{ x: 64, y: 16 }, { x: 100, y: 16 }] },
    { from: "backend", to: "runtime", points: [{ x: 110, y: 32 }, { x: 110, y: 64 }] },
    { from: "runtime", to: "orchestration", points: [{ x: 40, y: 96 }, { x: 40, y: 128 }] },
    {
      from: "orchestration",
      to: "providerA",
      via: "fork",
      points: [{ x: 148, y: 144 }, { x: 172, y: 144 }, { x: 172, y: 112 }, { x: 196, y: 112 }],
    },
    {
      from: "orchestration",
      to: "providerB",
      via: "fork",
      points: [{ x: 148, y: 144 }, { x: 172, y: 144 }, { x: 172, y: 156 }, { x: 196, y: 156 }],
    },
  ],
};

/** ExcevoAI: retrieval, drafting and the guardrail's two outcomes. */
const excevoai: DiagramLayout = {
  width: 300,
  height: 160,
  nodes: {
    api: { x: 7, y: 0, w: 84, h: 32 },
    rag: { x: 123, y: 0, w: 128, h: 32 },
    llm: { x: 7, y: 64, w: 76, h: 32 },
    guardrail: { x: 119, y: 64, w: 148, h: 32 },
    reply: { x: 7, y: 128, w: 134, h: 32 },
    review: { x: 173, y: 128, w: 120, h: 32 },
  },
  edges: [
    { from: "api", to: "rag", points: [{ x: 91, y: 16 }, { x: 123, y: 16 }] },
    {
      from: "rag",
      to: "llm",
      points: [{ x: 131, y: 32 }, { x: 131, y: 48 }, { x: 45, y: 48 }, { x: 45, y: 64 }],
    },
    { from: "llm", to: "guardrail", points: [{ x: 83, y: 80 }, { x: 119, y: 80 }] },
    { from: "guardrail", to: "reply", points: [{ x: 131, y: 96 }, { x: 131, y: 128 }] },
    { from: "guardrail", to: "review", points: [{ x: 233, y: 96 }, { x: 233, y: 128 }] },
  ],
};

/** Accountabuddy: the real-time path, plus the DRF API on the same workers. */
const accountabuddy: DiagramLayout = {
  width: 300,
  height: 160,
  nodes: {
    browser: { x: 30, y: 0, w: 84, h: 32 },
    nginx: { x: 150, y: 0, w: 68, h: 32 },
    api: { x: 30, y: 64, w: 84, h: 32 },
    uvicorn: { x: 150, y: 64, w: 120, h: 32 },
    redis: { x: 30, y: 128, w: 68, h: 32 },
    channels: { x: 130, y: 128, w: 140, h: 32 },
  },
  edges: [
    { from: "browser", to: "nginx", points: [{ x: 114, y: 16 }, { x: 150, y: 16 }] },
    { from: "nginx", to: "uvicorn", points: [{ x: 184, y: 32 }, { x: 184, y: 64 }] },
    { from: "uvicorn", to: "api", points: [{ x: 150, y: 80 }, { x: 114, y: 80 }] },
    { from: "uvicorn", to: "channels", points: [{ x: 210, y: 96 }, { x: 210, y: 128 }] },
    { from: "channels", to: "redis", points: [{ x: 130, y: 144 }, { x: 98, y: 144 }] },
  ],
};

export const projectThumbnails: Readonly<Record<CaseStudySlug, DiagramLayout>> = {
  uchatbots,
  excevoai,
  accountabuddy,
};

/**
 * The part of a project's graph a thumbnail layout shows: only the nodes it
 * places and the edges between them, labels without sublabels or groups.
 */
export function thumbnailDiagram(diagram: Diagram, layout: DiagramLayout): Diagram {
  const ids = new Set(Object.keys(layout.nodes));
  const routed = new Set(layout.edges.map((e) => `${e.from}->${e.to}`));
  return {
    id: diagram.id,
    title: diagram.title,
    nodes: diagram.nodes
      .filter((n) => ids.has(n.id))
      .map((n) => ({ id: n.id, label: n.label })),
    edges: diagram.edges.filter(
      (e) => ids.has(e.from) && ids.has(e.to) && routed.has(`${e.from}->${e.to}`),
    ),
  };
}
