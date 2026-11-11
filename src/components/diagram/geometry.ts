import type { Diagram } from "@/content/types";
import type { Box, DiagramLayout, Point, TextAnchor } from "./types";

/*
 * Pure geometry for a diagram + layout: line segments, arrowheads, text
 * positions, draw-in order and tooltip anchors. No React, no DOM, so the
 * renderer, the interaction layer, the packet loop and the layout tests all
 * share one source of truth.
 */

/** Type sizes in viewBox units. Layouts are sized so 1 unit renders at ≥ ~0.96px. */
export const TYPE = {
  /** Node labels. */
  label: 12,
  /** Sublabels, group labels, edge labels and state labels. */
  small: 11.5,
} as const;

/** Geist Mono's advance width in em (every glyph is 0.6em wide). */
export const MONO_ADVANCE = 0.6;

export const NODE = {
  /** Corner radius (4px nodes). */
  radius: 4,
  /** Status dot: center offset from the box's left edge, and radius. */
  dotX: 12,
  dotR: 3,
  /** Text starts this far from the box's left edge. */
  textX: 22,
  /** Minimum space between text and the box's right edge. */
  padRight: 10,
} as const;

export const GROUP = {
  /** 6px panel radius. */
  radius: 6,
  /** Group label position from the frame's top-left corner. */
  labelX: 10,
  labelBaseline: 18,
} as const;

export const ARROW = { length: 6, halfWidth: 3.5 } as const;

/** Half the diagonal of the ◆ junction marker. */
export const JUNCTION_SIZE = 4.5;

/** Draw-in steps are capped so the whole sequence ends in about 1.1s. */
export const MAX_DRAW_STEP = 14;

export type Direction = "r" | "l" | "d" | "u";

export interface SegmentGeometry {
  readonly key: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  /** Direction of travel: the draw-in grows the segment from its start. */
  readonly dir: Direction;
  readonly step: number;
}

export interface MarkGeometry {
  readonly key: string;
  /** SVG path data. */
  readonly d: string;
  readonly step: number;
}

export interface EdgeLabelGeometry {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly anchor: TextAnchor;
  readonly step: number;
}

export interface EdgeGeometry {
  /** "from->to" */
  readonly key: string;
  readonly from: string;
  readonly to: string;
  /** Segments that belong to this edge alone (shared trunks live in `shared`). */
  readonly segments: readonly SegmentGeometry[];
  readonly arrows: readonly MarkGeometry[];
  readonly label?: EdgeLabelGeometry;
}

export interface NodeGeometry {
  readonly id: string;
  readonly box: Box;
  readonly cx: number;
  readonly cy: number;
  readonly label: string;
  readonly sublabel?: string;
  readonly group?: string;
  readonly dot: Point;
  readonly textX: number;
  readonly labelY: number;
  readonly sublabelY?: number;
  /** Right-aligned state label ("degraded" / "recovered") on the first line. */
  readonly stateX: number;
  readonly stateY: number;
  readonly step: number;
}

export interface FrameGeometry {
  readonly id: string;
  readonly box: Box;
  readonly label: string;
  readonly labelX: number;
  readonly labelY: number;
  readonly step: number;
}

export interface JunctionGeometry {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly d: string;
  readonly step: number;
}

export interface DiagramGeometry {
  readonly width: number;
  readonly height: number;
  readonly frames: readonly FrameGeometry[];
  /** Segments used by more than one edge (a fork's trunk), drawn once. */
  readonly shared: readonly SegmentGeometry[];
  readonly edges: readonly EdgeGeometry[];
  readonly junctions: readonly JunctionGeometry[];
  /** In diagram order (reading order for assistive tech). */
  readonly nodes: readonly NodeGeometry[];
}

export function edgeKey(from: string, to: string): string {
  return `${from}->${to}`;
}

export function direction(a: Point, b: Point): Direction {
  if (b.x > a.x) return "r";
  if (b.x < a.x) return "l";
  return b.y > a.y ? "d" : "u";
}

const UNIT: Record<Direction, Point> = {
  r: { x: 1, y: 0 },
  l: { x: -1, y: 0 },
  d: { x: 0, y: 1 },
  u: { x: 0, y: -1 },
};

const OPPOSITE: Record<Direction, Direction> = { r: "l", l: "r", d: "u", u: "d" };

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function move(p: Point, dir: Direction, by: number): Point {
  return { x: p.x + UNIT[dir].x * by, y: p.y + UNIT[dir].y * by };
}

/** A filled arrowhead whose tip sits on `tip`, pointing in `dir`. */
function arrowPath(tip: Point, dir: Direction): string {
  const base = move(tip, OPPOSITE[dir], ARROW.length);
  const side = dir === "r" || dir === "l" ? { x: 0, y: 1 } : { x: 1, y: 0 };
  const a = { x: base.x + side.x * ARROW.halfWidth, y: base.y + side.y * ARROW.halfWidth };
  const b = { x: base.x - side.x * ARROW.halfWidth, y: base.y - side.y * ARROW.halfWidth };
  return `M${round(tip.x)} ${round(tip.y)}L${round(a.x)} ${round(a.y)}L${round(b.x)} ${round(b.y)}Z`;
}

function diamondPath({ x, y }: Point): string {
  const s = JUNCTION_SIZE;
  return `M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z`;
}

function segmentKey(a: Point, b: Point): string {
  return `${a.x},${a.y}:${b.x},${b.y}`;
}

/**
 * Breadth-first depth of every node from the graph's entry points (nodes
 * with no incoming edge). The draw-in follows this order, so the diagram
 * "boots" outward from its clients.
 */
function nodeDepths(diagram: Diagram): Map<string, number> {
  const incoming = new Set(diagram.edges.map((e) => e.to));
  const depth = new Map<string, number>();
  const queue: string[] = [];
  const visit = (id: string, d: number) => {
    if (depth.has(id)) return;
    depth.set(id, d);
    queue.push(id);
  };
  for (const node of diagram.nodes) if (!incoming.has(node.id)) visit(node.id, 0);
  // Nodes only reachable through a cycle start a new wave at depth 0.
  for (const start of [...queue, ...diagram.nodes.map((n) => n.id)]) {
    visit(start, 0);
    while (queue.length > 0) {
      const id = queue.shift() as string;
      const d = depth.get(id) ?? 0;
      for (const edge of diagram.edges) if (edge.from === id) visit(edge.to, d + 1);
    }
  }
  return depth;
}

/** Computes everything the renderer needs. Deterministic and cheap. */
export function buildGeometry(diagram: Diagram, layout: DiagramLayout): DiagramGeometry {
  const depth = nodeDepths(diagram);
  const nodeStep = (id: string) => 3 * (depth.get(id) ?? 0);
  const edgeByKey = new Map(diagram.edges.map((e) => [edgeKey(e.from, e.to), e]));

  // Raw steps first; they are scaled to MAX_DRAW_STEP at the end.
  type Raw<T> = Omit<T, "step"> & { raw: number };
  const rawSegments: Array<Raw<SegmentGeometry> & { edge: string }> = [];
  const rawEdges: Array<{
    key: string;
    from: string;
    to: string;
    arrows: Raw<MarkGeometry>[];
    label?: Raw<EdgeLabelGeometry>;
  }> = [];
  const rawJunctions = new Map<string, Raw<JunctionGeometry>>();
  const junctions = new Map((layout.junctions ?? []).map((j) => [j.id, j]));

  for (const route of layout.edges) {
    const key = edgeKey(route.from, route.to);
    const edge = edgeByKey.get(key);
    const bidirectional = edge?.bidirectional ?? false;
    const pts = route.points;
    const start = nodeStep(route.from) + 1;
    const last = pts.length - 2;
    const arrows: Raw<MarkGeometry>[] = [];

    for (let i = 0; i <= last; i++) {
      const dir = direction(pts[i], pts[i + 1]);
      // Lines stop at the arrowheads' bases.
      const a = i === 0 && bidirectional ? move(pts[i], dir, ARROW.length) : pts[i];
      const b = i === last ? move(pts[i + 1], OPPOSITE[dir], ARROW.length) : pts[i + 1];
      rawSegments.push({
        key: segmentKey(a, b),
        edge: key,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        dir,
        raw: start + i,
      });
    }

    arrows.push({
      key: `${key}:end`,
      d: arrowPath(pts[pts.length - 1], direction(pts[last], pts[last + 1])),
      raw: start + last + 1,
    });
    if (bidirectional) {
      arrows.push({
        key: `${key}:start`,
        d: arrowPath(pts[0], OPPOSITE[direction(pts[0], pts[1])]),
        raw: start + 1,
      });
    }

    if (route.via) {
      const junction = junctions.get(route.via);
      const index = pts.findIndex((p) => junction && p.x === junction.x && p.y === junction.y);
      if (junction && index >= 0 && !rawJunctions.has(junction.id)) {
        rawJunctions.set(junction.id, {
          id: junction.id,
          x: junction.x,
          y: junction.y,
          d: diamondPath(junction),
          raw: start + index,
        });
      }
    }

    rawEdges.push({
      key,
      from: route.from,
      to: route.to,
      arrows,
      label:
        edge?.label && route.label
          ? { text: edge.label, ...route.label, raw: start + last + 1 }
          : undefined,
    });
  }

  const rawNodes: Raw<NodeGeometry>[] = [];
  for (const node of diagram.nodes) {
    const box = layout.nodes[node.id];
    if (!box) continue;
    const cy = box.y + box.h / 2;
    const line1 = node.sublabel ? cy - 7 : cy;
    rawNodes.push({
      id: node.id,
      box,
      cx: box.x + box.w / 2,
      cy,
      label: node.label,
      sublabel: node.sublabel,
      group: node.group,
      dot: { x: box.x + NODE.dotX, y: line1 },
      textX: box.x + NODE.textX,
      labelY: round(line1 + TYPE.label * 0.35),
      sublabelY: node.sublabel ? round(cy + 8 + TYPE.small * 0.35) : undefined,
      stateX: box.x + box.w - NODE.padRight,
      stateY: round(line1 + TYPE.small * 0.35),
      raw: nodeStep(node.id),
    });
  }

  const rawFrames: Raw<FrameGeometry>[] = [];
  for (const group of diagram.groups ?? []) {
    const box = layout.groups?.[group.id];
    if (!box) continue;
    const members = rawNodes.filter((n) => n.group === group.id).map((n) => n.raw);
    rawFrames.push({
      id: group.id,
      box,
      label: group.label,
      labelX: box.x + GROUP.labelX,
      labelY: box.y + GROUP.labelBaseline,
      raw: members.length > 0 ? Math.min(...members) : 0,
    });
  }

  const maxRaw = Math.max(
    1,
    ...rawSegments.map((s) => s.raw),
    ...rawEdges.flatMap((e) => e.arrows.map((a) => a.raw)),
    ...rawNodes.map((n) => n.raw),
  );
  const scale = (raw: number) =>
    maxRaw > MAX_DRAW_STEP ? Math.round((raw * MAX_DRAW_STEP) / maxRaw) : raw;

  // A segment drawn by several edges (a fork's trunk) is drawn once.
  const uses = new Map<string, number>();
  for (const s of rawSegments) uses.set(s.key, (uses.get(s.key) ?? 0) + 1);
  const shared: SegmentGeometry[] = [];
  const seen = new Set<string>();
  const toSegment = ({ raw, key, x1, y1, x2, y2, dir }: Raw<SegmentGeometry>): SegmentGeometry => ({
    key,
    x1,
    y1,
    x2,
    y2,
    dir,
    step: scale(raw),
  });
  for (const s of rawSegments) {
    if ((uses.get(s.key) ?? 0) > 1 && !seen.has(s.key)) {
      seen.add(s.key);
      shared.push(toSegment(s));
    }
  }

  return {
    width: layout.width,
    height: layout.height,
    frames: rawFrames.map(({ raw, ...f }) => ({ ...f, step: scale(raw) })),
    shared,
    edges: rawEdges.map((e) => ({
      key: e.key,
      from: e.from,
      to: e.to,
      segments: rawSegments
        .filter((s) => s.edge === e.key && (uses.get(s.key) ?? 0) === 1)
        .map(toSegment),
      arrows: e.arrows.map(({ raw, ...a }) => ({ ...a, step: scale(raw) })),
      label: e.label ? withStep(e.label, scale) : undefined,
    })),
    junctions: [...rawJunctions.values()].map(({ raw, ...j }) => ({ ...j, step: scale(raw) })),
    nodes: rawNodes.map(({ raw, ...n }) => ({ ...n, step: scale(raw) })),
  };
}

function withStep<T extends { raw: number }>(
  { raw, ...rest }: T,
  scale: (raw: number) => number,
): Omit<T, "raw"> & { step: number } {
  return { ...rest, step: scale(raw) };
}

/** Width of a mono string in viewBox units. */
export function monoWidth(text: string, size: number): number {
  return text.length * size * MONO_ADVANCE;
}

/* ------------------------------------------------------------ keyboard */

/** Distance between two intervals (0 when they overlap). */
function gap(a1: number, a2: number, b1: number, b2: number): number {
  return Math.max(0, Math.max(a1, b1) - Math.min(a2, b2));
}

/**
 * The node an arrow key moves to: the nearest node in that direction,
 * preferring nodes in the same row or column.
 */
export function neighborInDirection(
  nodes: readonly NodeGeometry[],
  fromId: string,
  dir: Direction,
): string | null {
  const from = nodes.find((n) => n.id === fromId);
  if (!from) return null;
  const horizontal = dir === "r" || dir === "l";
  let best: string | null = null;
  let bestScore = Infinity;
  for (const node of nodes) {
    if (node.id === fromId) continue;
    const dx = node.cx - from.cx;
    const dy = node.cy - from.cy;
    const along = dir === "r" ? dx : dir === "l" ? -dx : dir === "d" ? dy : -dy;
    if (along <= 1) continue;
    const across = horizontal
      ? gap(from.box.y, from.box.y + from.box.h, node.box.y, node.box.y + node.box.h)
      : gap(from.box.x, from.box.x + from.box.w, node.box.x, node.box.x + node.box.w);
    const score = along + 3 * across;
    if (score < bestScore) {
      bestScore = score;
      best = node.id;
    }
  }
  return best;
}

/* ------------------------------------------------------------- tooltip */

export interface TooltipPlacement {
  /** Which tooltip edge is pinned: its left edge, its center, or its right edge. */
  readonly align: "start" | "center" | "end";
  /** Percent of the diagram width: left offset (start), center (center) or right inset (end). */
  readonly x: number;
  /** Widest the tooltip may be, in percent of the diagram width, so it never overflows. */
  readonly maxWidth: number;
  readonly side: "below" | "above";
  /** Percent of the diagram height: top offset (below) or bottom inset (above). */
  readonly y: number;
}

/**
 * Anchors a tooltip to a box. Boxes in the middle third get a centered
 * tooltip; boxes near an edge align the tooltip to that edge, so it can use
 * the full width without leaving the diagram. Lower boxes open upward.
 */
export function tooltipPlacement(box: Box, width: number, height: number): TooltipPlacement {
  const pct = (n: number, of: number) => Math.round((n / of) * 10000) / 100;
  const cx = pct(box.x + box.w / 2, width);
  const below = box.y + box.h / 2 < height * 0.6;
  const side = below ? "below" : "above";
  const y = below ? pct(box.y + box.h, height) : pct(height - box.y, height);

  if (cx >= 30 && cx <= 70) {
    return { align: "center", x: cx, maxWidth: 2 * Math.min(cx, 100 - cx), side, y };
  }
  if (cx < 50) {
    const left = pct(box.x, width);
    return { align: "start", x: left, maxWidth: 100 - left, side, y };
  }
  const right = pct(width - box.x - box.w, width);
  return { align: "end", x: right, maxWidth: 100 - right, side, y };
}
