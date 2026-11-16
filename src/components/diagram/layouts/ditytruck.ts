import type { ditytruckDiagram } from "@/content/diagrams";
import type { LayoutFor } from "../types";

type DitytruckLayout = LayoutFor<typeof ditytruckDiagram>;

/*
 * Desktop, 720 × 240. The request path runs along the top: customer site →
 * DRF API → PostgreSQL, with the staff-only Django admin writing reservation
 * requests into PostgreSQL from the right. The API drives one wide Scrapers
 * bar, which drops straight into the five public rental providers below it.
 *
 *  ┌ Customer site ┐─▶┌ DRF API ─┐─▶┌ PostgreSQL ┐◀─┌ Django admin ┐
 *                     └────┬─────┘   reservations     └ staff-only ┘
 *                     ┌────▼──────────────────────────────────────┐
 *                     │ Scrapers · Playwright / Selenium          │
 *                     └──┬──────┬──────┬──────┬────────┬──────────┘
 *                     U-Haul  Budget  Penske  U-Pack  SpareFoot
 */
export const ditytruckDesktop = {
  width: 720,
  height: 240,
  nodes: {
    site: { x: 0, y: 0, w: 128, h: 44 },
    api: { x: 176, y: 0, w: 96, h: 44 },
    postgres: { x: 320, y: 6, w: 112, h: 32 },
    admin: { x: 480, y: 0, w: 128, h: 44 },
    scrapers: { x: 176, y: 104, w: 528, h: 44 },
    uhaul: { x: 176, y: 208, w: 88, h: 32 },
    budget: { x: 283, y: 208, w: 88, h: 32 },
    penske: { x: 390, y: 208, w: 88, h: 32 },
    upack: { x: 497, y: 208, w: 88, h: 32 },
    sparefoot: { x: 604, y: 208, w: 100, h: 32 },
  },
  edges: [
    { from: "site", to: "api", points: [{ x: 128, y: 22 }, { x: 176, y: 22 }] },
    { from: "api", to: "postgres", points: [{ x: 272, y: 22 }, { x: 320, y: 22 }] },
    { from: "api", to: "scrapers", points: [{ x: 224, y: 44 }, { x: 224, y: 104 }] },
    { from: "scrapers", to: "uhaul", points: [{ x: 220, y: 148 }, { x: 220, y: 208 }] },
    { from: "scrapers", to: "budget", points: [{ x: 327, y: 148 }, { x: 327, y: 208 }] },
    { from: "scrapers", to: "penske", points: [{ x: 434, y: 148 }, { x: 434, y: 208 }] },
    { from: "scrapers", to: "upack", points: [{ x: 541, y: 148 }, { x: 541, y: 208 }] },
    { from: "scrapers", to: "sparefoot", points: [{ x: 654, y: 148 }, { x: 654, y: 208 }] },
    {
      from: "admin",
      to: "postgres",
      points: [{ x: 480, y: 22 }, { x: 432, y: 22 }],
      label: { x: 456, y: 62, anchor: "middle" },
    },
  ],
} as const satisfies DitytruckLayout;

/*
 * Mobile, 335 × 394. Site → API down the left; PostgreSQL beside the API with
 * the Django admin under it. The API drops into the Scrapers bar, which feeds
 * three providers in a row and two more below, between the first row's boxes.
 */
export const ditytruckMobile = {
  width: 335,
  height: 394,
  nodes: {
    site: { x: 0, y: 0, w: 128, h: 44 },
    api: { x: 0, y: 76, w: 96, h: 44 },
    postgres: { x: 136, y: 82, w: 112, h: 32 },
    admin: { x: 136, y: 146, w: 128, h: 44 },
    scrapers: { x: 0, y: 222, w: 312, h: 44 },
    uhaul: { x: 0, y: 298, w: 88, h: 32 },
    budget: { x: 112, y: 298, w: 88, h: 32 },
    penske: { x: 224, y: 298, w: 88, h: 32 },
    upack: { x: 56, y: 362, w: 88, h: 32 },
    sparefoot: { x: 162, y: 362, w: 100, h: 32 },
  },
  edges: [
    { from: "site", to: "api", points: [{ x: 48, y: 44 }, { x: 48, y: 76 }] },
    { from: "api", to: "postgres", points: [{ x: 96, y: 98 }, { x: 136, y: 98 }] },
    { from: "api", to: "scrapers", points: [{ x: 48, y: 120 }, { x: 48, y: 222 }] },
    { from: "scrapers", to: "uhaul", points: [{ x: 44, y: 266 }, { x: 44, y: 298 }] },
    { from: "scrapers", to: "budget", points: [{ x: 156, y: 266 }, { x: 156, y: 298 }] },
    { from: "scrapers", to: "penske", points: [{ x: 268, y: 266 }, { x: 268, y: 298 }] },
    { from: "scrapers", to: "upack", points: [{ x: 100, y: 266 }, { x: 100, y: 362 }] },
    { from: "scrapers", to: "sparefoot", points: [{ x: 212, y: 266 }, { x: 212, y: 362 }] },
    {
      from: "admin",
      to: "postgres",
      points: [{ x: 200, y: 146 }, { x: 200, y: 114 }],
      label: { x: 208, y: 134, anchor: "start" },
    },
  ],
} as const satisfies DitytruckLayout;
