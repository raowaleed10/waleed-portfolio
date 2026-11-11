import { describe, expect, it } from "vitest";
import { diagrams } from "@/content/diagrams";
import type { Diagram, DiagramId } from "@/content/types";
import { ui } from "@/content/ui";
import {
  ARROW,
  GROUP,
  MAX_DRAW_STEP,
  NODE,
  TYPE,
  buildGeometry,
  direction,
  edgeKey,
  monoWidth,
  tooltipPlacement,
} from "./geometry";
import { diagramLayouts } from "./layouts";
import type { Box, DiagramLayout, Point } from "./types";

/*
 * Geometry checks for every layout, so a coordinate typo fails CI instead of
 * shipping a line through a box. Text widths assume Geist Mono (0.6em).
 */

/** Narrowest render width of each layout kind, in CSS px. */
const MIN_RENDER_WIDTH = {
  hero: { desktop: 479, mobile: 320 },
  project: { desktop: 690, mobile: 320 },
} as const;

const NODE_GAP = 12;
const GROUP_MEMBER_GAP = 8;
const LINE_CLEARANCE = 8;
const LABEL_CLEARANCE = 4;
const CORNER_CLEARANCE = 8;

interface Seg {
  readonly edge: string;
  readonly a: Point;
  readonly b: Point;
}

const span = (p: number, q: number) => [Math.min(p, q), Math.max(p, q)] as const;

/** Distance between two closed intervals, 0 if they touch or overlap. */
const intervalGap = (a1: number, a2: number, b1: number, b2: number) =>
  Math.max(0, Math.max(a1, b1) - Math.min(a2, b2));

const boxGap = (a: Box, b: Box) =>
  Math.max(
    intervalGap(a.x, a.x + a.w, b.x, b.x + b.w),
    intervalGap(a.y, a.y + a.h, b.y, b.y + b.h),
  );

/** Shortest distance from an axis-aligned segment to a box (0 when they touch). */
function segBoxGap(s: Seg, box: Box): number {
  const [x1, x2] = span(s.a.x, s.b.x);
  const [y1, y2] = span(s.a.y, s.b.y);
  return Math.max(
    intervalGap(x1, x2, box.x, box.x + box.w),
    intervalGap(y1, y2, box.y, box.y + box.h),
  );
}

/** True when the segment enters the box's open interior. */
function segEntersBox(s: Seg, box: Box): boolean {
  const [x1, x2] = span(s.a.x, s.b.x);
  const [y1, y2] = span(s.a.y, s.b.y);
  return x2 > box.x && x1 < box.x + box.w && y2 > box.y && y1 < box.y + box.h;
}

/** Intersection of two axis-aligned segments as a box (null when disjoint). */
function segOverlap(s: Seg, t: Seg): Box | null {
  const [sx1, sx2] = span(s.a.x, s.b.x);
  const [sy1, sy2] = span(s.a.y, s.b.y);
  const [tx1, tx2] = span(t.a.x, t.b.x);
  const [ty1, ty2] = span(t.a.y, t.b.y);
  const x1 = Math.max(sx1, tx1);
  const x2 = Math.min(sx2, tx2);
  const y1 = Math.max(sy1, ty1);
  const y2 = Math.min(sy2, ty2);
  return x1 <= x2 && y1 <= y2 ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
}

const sameSeg = (s: Seg, t: Seg) =>
  s.a.x === t.a.x && s.a.y === t.a.y && s.b.x === t.b.x && s.b.y === t.b.y;

/** Which side of the box a border point is on, away from the corners. */
function borderSide(p: Point, box: Box): "top" | "bottom" | "left" | "right" | null {
  const onX = p.x >= box.x + CORNER_CLEARANCE && p.x <= box.x + box.w - CORNER_CLEARANCE;
  const onY = p.y >= box.y + CORNER_CLEARANCE && p.y <= box.y + box.h - CORNER_CLEARANCE;
  if (p.y === box.y && onX) return "top";
  if (p.y === box.y + box.h && onX) return "bottom";
  if (p.x === box.x && onY) return "left";
  if (p.x === box.x + box.w && onY) return "right";
  return null;
}

const OUTWARD = { top: "u", bottom: "d", left: "l", right: "r" } as const;
const INWARD = { top: "d", bottom: "u", left: "r", right: "l" } as const;

function textBox(x: number, y: number, text: string, size: number, anchor: string): Box {
  const w = monoWidth(text, size);
  const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
  return { x: left, y: y - size * 0.75, w, h: size };
}

const cases = (Object.keys(diagramLayouts) as DiagramId[]).flatMap((id) =>
  (["desktop", "mobile"] as const).map((kind) => ({
    id,
    kind,
    diagram: diagrams[id] as Diagram,
    layout: diagramLayouts[id][kind] as DiagramLayout,
  })),
);

describe.each(cases)("$id $kind layout", ({ id, kind, diagram, layout }) => {
  const nodeIds = diagram.nodes.map((n) => n.id);
  const groupOf = new Map(diagram.nodes.map((n) => [n.id, n.group]));
  const boxes = Object.entries(layout.nodes) as Array<[string, Box]>;
  const frames = Object.entries(layout.groups ?? {}) as Array<[string, Box]>;
  const junctions = layout.junctions ?? [];
  const segs: Seg[] = layout.edges.flatMap((route) =>
    route.points.slice(1).map((b, i) => ({
      edge: edgeKey(route.from, route.to),
      a: route.points[i],
      b,
    })),
  );

  it("has exactly one box per node and one frame per group", () => {
    expect(boxes.map(([nid]) => nid).sort()).toEqual([...nodeIds].sort());
    expect(frames.map(([gid]) => gid).sort()).toEqual(
      (diagram.groups ?? []).map((g) => g.id).sort(),
    );
  });

  it("has exactly one route per edge", () => {
    expect(layout.edges.map((r) => edgeKey(r.from, r.to)).sort()).toEqual(
      diagram.edges.map((e) => edgeKey(e.from, e.to)).sort(),
    );
  });

  it("keeps everything inside the viewBox", () => {
    for (const [, box] of [...boxes, ...frames]) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.w).toBeLessThanOrEqual(layout.width);
      expect(box.y + box.h).toBeLessThanOrEqual(layout.height);
    }
    for (const p of layout.edges.flatMap((r) => r.points)) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(layout.width);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(layout.height);
    }
  });

  it("spaces boxes apart and keeps group members inside their frame", () => {
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, boxA] = boxes[i];
        const [b, boxB] = boxes[j];
        const mates = groupOf.get(a) !== undefined && groupOf.get(a) === groupOf.get(b);
        expect(boxGap(boxA, boxB), `${a} vs ${b}`).toBeGreaterThanOrEqual(
          mates ? GROUP_MEMBER_GAP : NODE_GAP,
        );
      }
    }
    for (const [gid, frame] of frames) {
      const label = diagram.groups?.find((g) => g.id === gid)?.label ?? "";
      for (const [nid, box] of boxes) {
        if (groupOf.get(nid) === gid) {
          expect(box.x - frame.x, nid).toBeGreaterThanOrEqual(8);
          expect(frame.x + frame.w - (box.x + box.w), nid).toBeGreaterThanOrEqual(8);
          expect(frame.y + frame.h - (box.y + box.h), nid).toBeGreaterThanOrEqual(8);
          // The group label sits above every member, descenders included.
          expect(box.y - (frame.y + GROUP.labelBaseline), nid).toBeGreaterThanOrEqual(6);
        } else {
          expect(boxGap(box, frame), `${nid} vs frame ${gid}`).toBeGreaterThanOrEqual(NODE_GAP);
        }
      }
      expect(GROUP.labelX + monoWidth(label, TYPE.small)).toBeLessThanOrEqual(frame.w - 8);
    }
  });

  it("routes every edge orthogonally from border to border", () => {
    for (const route of layout.edges) {
      const name = edgeKey(route.from, route.to);
      const pts = route.points;
      expect(pts.length, name).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < pts.length; i++) {
        const [a, b] = [pts[i - 1], pts[i]];
        expect(a.x === b.x || a.y === b.y, `${name} segment ${i} is diagonal`).toBe(true);
        expect(a.x !== b.x || a.y !== b.y, `${name} segment ${i} is empty`).toBe(true);
      }

      const from = layout.nodes[route.from];
      const to = layout.nodes[route.to];
      const exit = borderSide(pts[0], from);
      const entry = borderSide(pts[pts.length - 1], to);
      expect(exit, `${name} starts on ${route.from}'s border`).not.toBeNull();
      expect(entry, `${name} ends on ${route.to}'s border`).not.toBeNull();
      if (exit) expect(direction(pts[0], pts[1]), `${name} leaves outward`).toBe(OUTWARD[exit]);
      if (entry) {
        expect(direction(pts[pts.length - 2], pts[pts.length - 1]), `${name} enters inward`).toBe(
          INWARD[entry],
        );
      }

      // Room for the arrowheads plus a visible stretch of line.
      const bidirectional = diagram.edges.find(
        (e) => e.from === route.from && e.to === route.to,
      )?.bidirectional;
      const len = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      const lastLen = len(pts[pts.length - 2], pts[pts.length - 1]);
      const needed = ARROW.length + 6 + (bidirectional && pts.length === 2 ? ARROW.length : 0);
      expect(lastLen, `${name} last segment`).toBeGreaterThanOrEqual(needed);

      if (route.via) {
        const j = junctions.find((jn) => jn.id === route.via);
        expect(j, `${name} junction`).toBeDefined();
        expect(pts.some((p) => j && p.x === j.x && p.y === j.y), `${name} passes its junction`).toBe(
          true,
        );
      }
    }
  });

  it("never runs a line through a box or along another line", () => {
    for (const s of segs) {
      const [from, to] = s.edge.split("->");
      for (const [nid, box] of boxes) {
        if (nid === from || nid === to) {
          expect(segEntersBox(s, box), `${s.edge} enters ${nid}`).toBe(false);
        } else {
          expect(segBoxGap(s, box), `${s.edge} near ${nid}`).toBeGreaterThanOrEqual(LINE_CLEARANCE);
        }
      }
      for (const [gid, frame] of frames) {
        if (groupOf.get(to) === gid || groupOf.get(from) === gid) continue;
        expect(segBoxGap(s, frame), `${s.edge} near frame ${gid}`).toBeGreaterThanOrEqual(
          LINE_CLEARANCE,
        );
      }
    }

    const viaOf = new Map(layout.edges.map((r) => [edgeKey(r.from, r.to), r.via]));
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        const [s, t] = [segs[i], segs[j]];
        if (s.edge === t.edge) {
          // Within one route only neighbours may touch, at their shared point.
          const hit = segOverlap(s, t);
          const adjacent = s.b === t.a || t.b === s.a;
          if (!adjacent) expect(hit, `${s.edge} crosses itself`).toBeNull();
          continue;
        }
        if (sameSeg(s, t)) {
          expect(viaOf.get(s.edge), `${s.edge} and ${t.edge} share a trunk`).toBeDefined();
          continue;
        }
        const hit = segOverlap(s, t);
        if (!hit) continue;
        const via = viaOf.get(s.edge);
        const junction = junctions.find((jn) => jn.id === via);
        const atJunction =
          via !== undefined &&
          via === viaOf.get(t.edge) &&
          junction !== undefined &&
          hit.w === 0 &&
          hit.h === 0 &&
          hit.x === junction.x &&
          hit.y === junction.y;
        expect(atJunction, `${s.edge} touches ${t.edge}`).toBe(true);
      }
    }
  });

  it("fits every label in its box at ≥ 11px", () => {
    const minWidth = MIN_RENDER_WIDTH[id === "hero" ? "hero" : "project"][kind];
    expect(TYPE.small * (minWidth / layout.width)).toBeGreaterThanOrEqual(10.95);

    const failover = new Set<string>(diagram.failover ?? []);
    const stateWidth = Math.max(
      monoWidth(ui.diagram.degraded, TYPE.small),
      monoWidth(ui.diagram.recovered, TYPE.small),
    );
    for (const node of diagram.nodes) {
      const box = layout.nodes[node.id];
      const label = monoWidth(node.label, TYPE.label);
      const sub = node.sublabel ? monoWidth(node.sublabel, TYPE.small) : 0;
      expect(NODE.textX + Math.max(label, sub) + NODE.padRight, node.id).toBeLessThanOrEqual(box.w);
      expect(box.h, node.id).toBe(node.sublabel ? 44 : 32);
      if (failover.has(node.id)) {
        expect(NODE.textX + label + 8 + stateWidth + NODE.padRight, `${node.id} state`).toBeLessThanOrEqual(
          box.w,
        );
      }
    }
  });

  it("keeps edge labels clear of boxes and lines", () => {
    for (const route of layout.edges) {
      const edge = diagram.edges.find((e) => e.from === route.from && e.to === route.to);
      expect(Boolean(edge?.label), `${route.from}->${route.to} label`).toBe(Boolean(route.label));
      if (!edge?.label || !route.label) continue;
      const box = textBox(route.label.x, route.label.y, edge.label, TYPE.small, route.label.anchor);
      for (const [nid, nodeBox] of boxes) {
        expect(boxGap(box, nodeBox), `label ${edge.label} vs ${nid}`).toBeGreaterThanOrEqual(
          LABEL_CLEARANCE,
        );
      }
      for (const s of segs) {
        expect(segBoxGap(s, box), `label ${edge.label} vs ${s.edge}`).toBeGreaterThanOrEqual(
          LABEL_CLEARANCE,
        );
      }
    }
  });

  it("finishes the draw-in within the step budget", () => {
    const geo = buildGeometry(diagram, layout);
    const steps = [
      ...geo.nodes.map((n) => n.step),
      ...geo.shared.map((s) => s.step),
      ...geo.edges.flatMap((e) => [...e.segments, ...e.arrows].map((s) => s.step)),
    ];
    expect(Math.max(...steps)).toBeLessThanOrEqual(MAX_DRAW_STEP);
    expect(geo.nodes).toHaveLength(diagram.nodes.length);
  });

  it("anchors tooltips inside the diagram", () => {
    for (const [, box] of [...boxes, ...frames]) {
      const p = tooltipPlacement(box, layout.width, layout.height);
      expect(p.maxWidth).toBeGreaterThanOrEqual(60);
      expect(p.x).toBeGreaterThanOrEqual(0);
    }
  });
});
