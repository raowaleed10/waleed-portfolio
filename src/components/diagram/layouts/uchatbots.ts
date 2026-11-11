import type { uchatbotsDiagram } from "@/content/diagrams";
import type { LayoutFor } from "../types";

type UchatbotsLayout = LayoutFor<typeof uchatbotsDiagram>;

/*
 * Desktop, 704 × 336. The DRF backend is a bus: the chat path and the three
 * side inputs drop into it from above, the flow runtime leaves from below.
 *
 *  ┌ Customer websites ┐  ┌ ReactFlow editor ┐  ┌ Stripe ┐  ┌ Google OAuth2 ────────┐
 *  └────────┬──────────┘  └────────┬─────────┘  └───┬────┘  └ server-side code flow ┘
 *           ▼                      │                │ credits           │ auth
 *  ┌ Chat ─────────────┐           │                │                   │
 *  └ WebSocket / REST ─┘           │                │                   │
 *           ▼                      ▼                ▼                   ▼
 *  ┌ DRF backend · 10 apps ─────────────────────────────────────────────────────┐
 *  └───────┬────────────────────────────────────────────────────────────────────┘
 *          ▼                                            ┌ failover ─────────┐
 *  ┌ Flow runtime ─────────────────┐  ┌ AI orchestration ┐ ┌──▶│ Provider A │ │
 *  └ serialized pause/resume state ┘─▶└──────────────────┘─◆   │ Provider B │ │
 *                                                          └──▶└────────────┘
 */
export const uchatbotsDesktop = {
  width: 704,
  height: 336,
  nodes: {
    sites: { x: 0, y: 6, w: 160, h: 32 },
    editor: { x: 200, y: 6, w: 152, h: 32 },
    stripe: { x: 388, y: 6, w: 96, h: 32 },
    oauth: { x: 520, y: 0, w: 184, h: 44 },
    chat: { x: 0, y: 84, w: 160, h: 44 },
    backend: { x: 0, y: 168, w: 704, h: 44 },
    runtime: { x: 0, y: 270, w: 240, h: 44 },
    orchestration: { x: 276, y: 276, w: 152, h: 32 },
    providerA: { x: 478, y: 256, w: 180, h: 32 },
    providerB: { x: 478, y: 296, w: 180, h: 32 },
  },
  groups: {
    providers: { x: 468, y: 228, w: 200, h: 108 },
  },
  junctions: [{ id: "provider-fork", x: 448, y: 292 }],
  edges: [
    {
      from: "sites",
      to: "chat",
      points: [
        { x: 80, y: 38 },
        { x: 80, y: 84 },
      ],
    },
    {
      from: "chat",
      to: "backend",
      points: [
        { x: 80, y: 128 },
        { x: 80, y: 168 },
      ],
    },
    {
      from: "editor",
      to: "backend",
      points: [
        { x: 276, y: 38 },
        { x: 276, y: 168 },
      ],
    },
    {
      from: "stripe",
      to: "backend",
      label: { x: 444, y: 110, anchor: "start" },
      points: [
        { x: 436, y: 38 },
        { x: 436, y: 168 },
      ],
    },
    {
      from: "oauth",
      to: "backend",
      label: { x: 620, y: 110, anchor: "start" },
      points: [
        { x: 612, y: 44 },
        { x: 612, y: 168 },
      ],
    },
    {
      from: "backend",
      to: "runtime",
      points: [
        { x: 120, y: 212 },
        { x: 120, y: 270 },
      ],
    },
    {
      from: "runtime",
      to: "orchestration",
      points: [
        { x: 240, y: 292 },
        { x: 276, y: 292 },
      ],
    },
    {
      from: "orchestration",
      to: "providerA",
      via: "provider-fork",
      points: [
        { x: 428, y: 292 },
        { x: 448, y: 292 },
        { x: 448, y: 272 },
        { x: 478, y: 272 },
      ],
    },
    {
      from: "orchestration",
      to: "providerB",
      via: "provider-fork",
      points: [
        { x: 428, y: 292 },
        { x: 448, y: 292 },
        { x: 448, y: 312 },
        { x: 478, y: 312 },
      ],
    },
  ],
} as const satisfies UchatbotsLayout;

/*
 * Mobile, 335 × 580. Same bus idea: chat and the editor drop in from above,
 * Stripe from the right, Google OAuth2 comes up from below; the pipeline
 * then runs down the left edge and forks into the providers.
 */
export const uchatbotsMobile = {
  width: 335,
  height: 580,
  nodes: {
    sites: { x: 0, y: 6, w: 160, h: 32 },
    editor: { x: 183, y: 6, w: 152, h: 32 },
    chat: { x: 0, y: 84, w: 160, h: 44 },
    stripe: { x: 239, y: 90, w: 96, h: 32 },
    backend: { x: 0, y: 168, w: 335, h: 44 },
    oauth: { x: 151, y: 252, w: 184, h: 44 },
    runtime: { x: 0, y: 336, w: 240, h: 44 },
    orchestration: { x: 0, y: 420, w: 152, h: 32 },
    providerA: { x: 125, y: 500, w: 200, h: 32 },
    providerB: { x: 125, y: 540, w: 200, h: 32 },
  },
  groups: {
    providers: { x: 115, y: 472, w: 220, h: 108 },
  },
  junctions: [{ id: "provider-fork", x: 76, y: 516 }],
  edges: [
    {
      from: "sites",
      to: "chat",
      points: [
        { x: 80, y: 38 },
        { x: 80, y: 84 },
      ],
    },
    {
      from: "chat",
      to: "backend",
      points: [
        { x: 80, y: 128 },
        { x: 80, y: 168 },
      ],
    },
    {
      from: "editor",
      to: "backend",
      points: [
        { x: 205, y: 38 },
        { x: 205, y: 168 },
      ],
    },
    {
      from: "stripe",
      to: "backend",
      label: { x: 281, y: 150, anchor: "end" },
      points: [
        { x: 287, y: 122 },
        { x: 287, y: 168 },
      ],
    },
    {
      from: "oauth",
      to: "backend",
      label: { x: 251, y: 236, anchor: "start" },
      points: [
        { x: 243, y: 252 },
        { x: 243, y: 212 },
      ],
    },
    {
      from: "backend",
      to: "runtime",
      points: [
        { x: 120, y: 212 },
        { x: 120, y: 336 },
      ],
    },
    {
      from: "runtime",
      to: "orchestration",
      points: [
        { x: 76, y: 380 },
        { x: 76, y: 420 },
      ],
    },
    {
      from: "orchestration",
      to: "providerA",
      via: "provider-fork",
      points: [
        { x: 76, y: 452 },
        { x: 76, y: 516 },
        { x: 125, y: 516 },
      ],
    },
    {
      from: "orchestration",
      to: "providerB",
      via: "provider-fork",
      points: [
        { x: 76, y: 452 },
        { x: 76, y: 516 },
        { x: 76, y: 556 },
        { x: 125, y: 556 },
      ],
    },
  ],
} as const satisfies UchatbotsLayout;
