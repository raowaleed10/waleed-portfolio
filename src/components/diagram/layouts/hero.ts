import type { heroDiagram } from "@/content/diagrams";
import type { LayoutFor } from "../types";

type HeroLayout = LayoutFor<typeof heroDiagram>;

/*
 * Desktop, 480 Ã— 332 (shown at 480â€“672px wide, so 1 unit â‰¥ 1px).
 *
 *              â”Œ Browser â”€â”€â”€â”€â”€â”€â”
 *  â”Œ Stripe â”  â”‚ React/Next.js â”‚       â”Œ LLM providers â”€â”
 *  â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚ â”Œ Claude â”€â”€â”€â”€â” â”‚
 *      â–¼              â–¼            â”Œâ”€â”€â–¶â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
 *  â”Œ Webhooks â”â”€â–¶â”Œ Django API â”â”€â”€â—†â”€â”¤   â”‚ â”Œ OpenAI â”€â”€â”€â”€â” â”‚
 *  â””â”€â”€â”€â”€â–²â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”˜    â””â”€â”€â–¶â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
 *       â”‚           â”‚     â””â”€â”€â”€â”€â”€â”€â”     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *       â”‚           â–¼            â–¼
 *       â”‚      â”Œ Redis â”€â”€â”€â”€â”€â”  â”Œ PostgreSQL â”
 *       â”‚      â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *       â”‚            â–¼
 *       â””â”€â”€â”€â”€â”€â”€â”¤ Celery workers â”
 *
 * Columns: 0â€“104 Â· 132â€“268 (spine x = 200) Â· group 312â€“480 (nodes 322â€“470).
 * Rows: 0/6 Â· 108 Â· 204 Â· 300, a 64-unit gap between each row.
 */
export const heroDesktop = {
  width: 480,
  height: 332,
  nodes: {
    browser: { x: 132, y: 0, w: 136, h: 44 },
    stripe: { x: 0, y: 6, w: 104, h: 32 },
    webhooks: { x: 0, y: 108, w: 104, h: 32 },
    api: { x: 132, y: 108, w: 136, h: 32 },
    claude: { x: 322, y: 88, w: 148, h: 32 },
    openai: { x: 322, y: 128, w: 148, h: 32 },
    redis: { x: 132, y: 204, w: 136, h: 32 },
    postgres: { x: 322, y: 204, w: 148, h: 32 },
    celery: { x: 132, y: 300, w: 136, h: 32 },
  },
  groups: {
    llm: { x: 312, y: 60, w: 168, h: 108 },
  },
  junctions: [{ id: "llm-fork", x: 290, y: 124 }],
  edges: [
    {
      from: "browser",
      to: "api",
      points: [
        { x: 200, y: 44 },
        { x: 200, y: 108 },
      ],
    },
    {
      from: "api",
      to: "postgres",
      points: [
        { x: 252, y: 140 },
        { x: 252, y: 186 },
        { x: 396, y: 186 },
        { x: 396, y: 204 },
      ],
    },
    {
      from: "api",
      to: "redis",
      points: [
        { x: 200, y: 140 },
        { x: 200, y: 204 },
      ],
    },
    {
      from: "redis",
      to: "celery",
      points: [
        { x: 200, y: 236 },
        { x: 200, y: 300 },
      ],
    },
    {
      from: "api",
      to: "claude",
      via: "llm-fork",
      points: [
        { x: 268, y: 124 },
        { x: 290, y: 124 },
        { x: 290, y: 104 },
        { x: 322, y: 104 },
      ],
    },
    {
      from: "api",
      to: "openai",
      via: "llm-fork",
      points: [
        { x: 268, y: 124 },
        { x: 290, y: 124 },
        { x: 290, y: 144 },
        { x: 322, y: 144 },
      ],
    },
    {
      from: "stripe",
      to: "webhooks",
      points: [
        { x: 52, y: 38 },
        { x: 52, y: 108 },
      ],
    },
    {
      from: "webhooks",
      to: "api",
      points: [
        { x: 104, y: 124 },
        { x: 132, y: 124 },
      ],
    },
    {
      from: "celery",
      to: "webhooks",
      points: [
        { x: 132, y: 316 },
        { x: 52, y: 316 },
        { x: 52, y: 140 },
      ],
    },
  ],
} as const satisfies HeroLayout;

/*
 * Mobile, 335 Ã— 428 (designed for 335px at a 375px viewport; text stays
 * â‰¥ 11px down to a 320px-wide render).
 *
 *  â”Œ Browser Â· React / Next.js â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 *  â””â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *      â”‚               â”Œ LLM providers â”€â”
 *      â–¼           â”Œâ”€â”€â–¶â”‚ Claude         â”‚
 * â”Œâ–¶â”Œ Django API â”â”€â—†â”¤  â”‚ OpenAI         â”‚
 * â”‚ â””â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”˜ â””â”€â”€â–¶â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 * â”‚   â–¼       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 * â”‚ â”Œ PostgreSQL â”      â”Œ Redis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 * â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 * â”‚                             â–¼
 * â””â”€â”¤ Webhooks â”â—€â”€â”€â”€â”€â”€â”€â”€â”€â”¤ Celery workers â”
 *   â””â”€â”€â”€â”€â–²â”€â”€â”€â”€â”€â”˜
 *   â”Œ Stripe â”€â”€â”
 *
 * Left rail x = 6 Â· left column 20â€“128 (x = 74) Â· fork x = 145 Â·
 * right column 172â€“324 inside the group frame 162â€“334.
 */
export const heroMobile = {
  width: 335,
  height: 428,
  nodes: {
    browser: { x: 20, y: 0, w: 304, h: 44 },
    api: { x: 20, y: 108, w: 108, h: 32 },
    claude: { x: 172, y: 88, w: 152, h: 32 },
    openai: { x: 172, y: 128, w: 152, h: 32 },
    postgres: { x: 20, y: 204, w: 108, h: 32 },
    redis: { x: 172, y: 204, w: 152, h: 32 },
    webhooks: { x: 20, y: 300, w: 108, h: 32 },
    celery: { x: 172, y: 300, w: 152, h: 32 },
    stripe: { x: 20, y: 396, w: 108, h: 32 },
  },
  groups: {
    llm: { x: 162, y: 60, w: 172, h: 108 },
  },
  junctions: [{ id: "llm-fork", x: 145, y: 124 }],
  edges: [
    {
      from: "browser",
      to: "api",
      points: [
        { x: 74, y: 44 },
        { x: 74, y: 108 },
      ],
    },
    {
      from: "api",
      to: "postgres",
      points: [
        { x: 74, y: 140 },
        { x: 74, y: 204 },
      ],
    },
    {
      from: "api",
      to: "redis",
      points: [
        { x: 110, y: 140 },
        { x: 110, y: 186 },
        { x: 248, y: 186 },
        { x: 248, y: 204 },
      ],
    },
    {
      from: "redis",
      to: "celery",
      points: [
        { x: 248, y: 236 },
        { x: 248, y: 300 },
      ],
    },
    {
      from: "api",
      to: "claude",
      via: "llm-fork",
      points: [
        { x: 128, y: 124 },
        { x: 145, y: 124 },
        { x: 145, y: 104 },
        { x: 172, y: 104 },
      ],
    },
    {
      from: "api",
      to: "openai",
      via: "llm-fork",
      points: [
        { x: 128, y: 124 },
        { x: 145, y: 124 },
        { x: 145, y: 144 },
        { x: 172, y: 144 },
      ],
    },
    {
      from: "stripe",
      to: "webhooks",
      points: [
        { x: 74, y: 396 },
        { x: 74, y: 332 },
      ],
    },
    {
      from: "webhooks",
      to: "api",
      points: [
        { x: 20, y: 316 },
        { x: 6, y: 316 },
        { x: 6, y: 124 },
        { x: 20, y: 124 },
      ],
    },
    {
      from: "celery",
      to: "webhooks",
      points: [
        { x: 172, y: 316 },
        { x: 128, y: 316 },
      ],
    },
  ],
} as const satisfies HeroLayout;
