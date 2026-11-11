import type { accountabuddyDiagram } from "@/content/diagrams";
import type { LayoutFor } from "../types";

type AccountabuddyLayout = LayoutFor<typeof accountabuddyDiagram>;

/*
 * Desktop, 716 × 200. The real-time path runs along the top and drops into
 * Redis; the side services sit underneath. The DRF API has no stated edges,
 * so it stands alone under Uvicorn.
 *
 *  ┌ Browser ───────────────────────┐   ┌ Nginx ┐  ┌ Uvicorn ASGI ┐  ┌ Django Channels ┐
 *  └ React + custom WebSocket client ┘◀─▶└───────┘─▶└──────────────┘─▶└────────▲────────┘
 *                                                                              ▼
 *  ┌ Stripe webhooks ┐─▶┌ Idempotent handler ┐      ┌ DRF API ┐     ┌ Redis ─────────┐
 *                                                                   └ channels_redis ┘
 *  ┌ Celery + beat ┐─▶┌ Pairing, reminders, nightly jobs ┐
 */
export const accountabuddyDesktop = {
  width: 716,
  height: 200,
  nodes: {
    browser: { x: 0, y: 0, w: 248, h: 44 },
    nginx: { x: 288, y: 6, w: 96, h: 32 },
    uvicorn: { x: 416, y: 6, w: 124, h: 32 },
    channels: { x: 572, y: 6, w: 144, h: 32 },
    redis: { x: 578, y: 84, w: 132, h: 44 },
    stripe: { x: 0, y: 90, w: 144, h: 32 },
    handler: { x: 180, y: 90, w: 164, h: 32 },
    api: { x: 430, y: 90, w: 96, h: 32 },
    celery: { x: 0, y: 168, w: 132, h: 32 },
    jobs: { x: 168, y: 168, w: 268, h: 32 },
  },
  edges: [
    {
      from: "browser",
      to: "nginx",
      points: [
        { x: 248, y: 22 },
        { x: 288, y: 22 },
      ],
    },
    {
      from: "nginx",
      to: "uvicorn",
      points: [
        { x: 384, y: 22 },
        { x: 416, y: 22 },
      ],
    },
    {
      from: "uvicorn",
      to: "channels",
      points: [
        { x: 540, y: 22 },
        { x: 572, y: 22 },
      ],
    },
    {
      from: "channels",
      to: "redis",
      points: [
        { x: 644, y: 38 },
        { x: 644, y: 84 },
      ],
    },
    {
      from: "celery",
      to: "jobs",
      points: [
        { x: 132, y: 184 },
        { x: 168, y: 184 },
      ],
    },
    {
      from: "stripe",
      to: "handler",
      points: [
        { x: 144, y: 106 },
        { x: 180, y: 106 },
      ],
    },
  ],
} as const satisfies AccountabuddyLayout;

/*
 * Mobile, 335 × 380. The real-time path is the left spine (x = 72); the side
 * services stack in the right column (x = 253), and the jobs node spans the
 * bottom.
 */
export const accountabuddyMobile = {
  width: 335,
  height: 380,
  nodes: {
    browser: { x: 0, y: 0, w: 248, h: 44 },
    nginx: { x: 24, y: 76, w: 96, h: 32 },
    uvicorn: { x: 10, y: 140, w: 124, h: 32 },
    channels: { x: 0, y: 204, w: 144, h: 32 },
    redis: { x: 6, y: 268, w: 132, h: 44 },
    api: { x: 205, y: 76, w: 96, h: 32 },
    stripe: { x: 181, y: 140, w: 144, h: 32 },
    handler: { x: 171, y: 204, w: 164, h: 32 },
    celery: { x: 187, y: 274, w: 132, h: 32 },
    jobs: { x: 67, y: 348, w: 268, h: 32 },
  },
  edges: [
    {
      from: "browser",
      to: "nginx",
      points: [
        { x: 72, y: 44 },
        { x: 72, y: 76 },
      ],
    },
    {
      from: "nginx",
      to: "uvicorn",
      points: [
        { x: 72, y: 108 },
        { x: 72, y: 140 },
      ],
    },
    {
      from: "uvicorn",
      to: "channels",
      points: [
        { x: 72, y: 172 },
        { x: 72, y: 204 },
      ],
    },
    {
      from: "channels",
      to: "redis",
      points: [
        { x: 72, y: 236 },
        { x: 72, y: 268 },
      ],
    },
    {
      from: "stripe",
      to: "handler",
      points: [
        { x: 253, y: 172 },
        { x: 253, y: 204 },
      ],
    },
    {
      from: "celery",
      to: "jobs",
      points: [
        { x: 253, y: 306 },
        { x: 253, y: 348 },
      ],
    },
  ],
} as const satisfies AccountabuddyLayout;
