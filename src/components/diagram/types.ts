import type { Diagram } from "@/content/types";

/**
 * Layout format for system diagrams. The graph itself (nodes, labels,
 * tooltips, edges) lives in src/content/diagrams.ts; a layout only says where
 * things go, in viewBox units, so it never contains copy.
 *
 * Conventions every layout follows (checked by layouts.test.ts):
 * - Nodes are boxes. 32 units tall for one line of text, 44 with a sublabel.
 * - Edge routes are orthogonal polylines: consecutive points share x or y.
 *   The first point sits on the source box's border, the last point on the
 *   target box's border (that is the arrow tip). Edges never cross a box or
 *   another edge.
 * - Two edges that branch from one point share their leading points up to a
 *   junction (the ◆ fork). The renderer draws shared segments once, and
 *   packets choose a branch when they reach the junction.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export type TextAnchor = "start" | "middle" | "end";

/** Where an edge's text label sits: its baseline position and alignment. */
export interface LabelPlacement extends Point {
  readonly anchor: TextAnchor;
}

/** A fork point (drawn as ◆) where one route splits into several. */
export interface Junction extends Point {
  readonly id: string;
}

export interface EdgeRoute<N extends string = string> {
  /** Matches a DiagramEdge's `from` and `to`. */
  readonly from: N;
  readonly to: N;
  /** Orthogonal waypoints from the source box border to the target box border. */
  readonly points: readonly Point[];
  /** Junction this route passes through; its point is one of `points`. */
  readonly via?: string;
  /** Placement of the edge's label, for edges that have one. */
  readonly label?: LabelPlacement;
}

export interface DiagramLayout<N extends string = string, G extends string = string> {
  /** viewBox is `0 0 width height`. */
  readonly width: number;
  readonly height: number;
  /** One box per node id. */
  readonly nodes: Readonly<Record<N, Box>>;
  /** One frame per group id; member nodes sit inside it. */
  readonly groups?: Readonly<Record<G, Box>>;
  readonly junctions?: readonly Junction[];
  /** One route per diagram edge. */
  readonly edges: readonly EdgeRoute<N>[];
}

/** Every layout a diagram ships with. Thumbnails reuse `desktop` without text. */
export interface DiagramLayouts {
  /** Shown from the `md` breakpoint up. */
  readonly desktop: DiagramLayout;
  /** Vertical layout for narrow screens, designed around 335 units wide. */
  readonly mobile: DiagramLayout;
}

/** Node ids of a diagram declared `as const`. */
export type NodeIdOf<D extends Diagram> = D["nodes"][number]["id"];

/** Group ids of a diagram declared `as const` (never when it has no groups). */
export type GroupIdOf<D extends Diagram> = NonNullable<D["groups"]>[number]["id"];

/** A layout whose node and group keys are checked against the diagram's ids. */
export type LayoutFor<D extends Diagram> = DiagramLayout<NodeIdOf<D>, GroupIdOf<D>>;
