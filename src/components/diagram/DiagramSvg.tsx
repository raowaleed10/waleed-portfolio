import type { CSSProperties, Ref, SVGProps } from "react";
import type { Diagram } from "@/content/types";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";
import {
  GROUP,
  NODE,
  TYPE,
  buildGeometry,
  type DiagramGeometry,
  type SegmentGeometry,
} from "./geometry";
import type { DiagramLayout } from "./types";

export type DiagramVariant = "full" | "thumbnail";

export interface DiagramSvgProps {
  diagram: Diagram;
  layout: DiagramLayout;
  /** Precomputed geometry (client components memoize it). */
  geometry?: DiagramGeometry;
  /** "thumbnail" draws boxes, lines and dots only: no text, decorative. */
  variant?: DiagramVariant;
  /** Render the stacked amber layers and state labels for diagram.failover. */
  failover?: boolean;
  className?: string;
  svgRef?: Ref<SVGSVGElement>;
  /** Interactive diagrams: props for each node's <g> (role, tabIndex, handlers). */
  nodeProps?: (id: string) => SVGProps<SVGGElement>;
  /** Node whose tooltip is open; it keeps its hover outline. */
  activeId?: string | null;
}

/*
 * Every line is a 1px hairline whatever the scale (non-scaling stroke).
 * data-draw and --draw-i are inert hooks: they only take effect under the
 * draw-in class from DiagramMotion (step 7).
 */
const HAIRLINE = { strokeWidth: 1, vectorEffect: "non-scaling-stroke" } as const;

function drawHooks(kind: string, step: number, enabled: boolean) {
  return enabled
    ? { "data-draw": kind, style: { "--draw-i": step } as CSSProperties }
    : undefined;
}

function Segment({ seg, hooks }: { seg: SegmentGeometry; hooks: boolean }) {
  return (
    <line
      x1={seg.x1}
      y1={seg.y1}
      x2={seg.x2}
      y2={seg.y2}
      className="stroke-graphic"
      strokeLinecap="square"
      shapeRendering="crispEdges"
      {...HAIRLINE}
      {...drawHooks(seg.dir, seg.step, hooks)}
    />
  );
}

/**
 * The complete static diagram as one SVG. Works as a Server Component (the
 * prerendered HTML holds the whole drawing) and inside the client wrapper.
 *
 * Layers, bottom to top: group frames and edges · packet pool · nodes ·
 * annotations (failover state labels).
 */
export function DiagramSvg({
  diagram,
  layout,
  geometry,
  variant = "full",
  failover = false,
  className,
  svgRef,
  nodeProps,
  activeId = null,
}: DiagramSvgProps) {
  const geo = geometry ?? buildGeometry(diagram, layout);
  const full = variant === "full";
  const interactive = full && nodeProps !== undefined;
  const failing = new Set<string>(full && failover ? (diagram.failover ?? []) : []);
  const a11y = interactive
    ? ({ role: "group", "aria-label": ui.diagram.name } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${geo.width} ${geo.height}`}
      className={cn("block h-auto w-full overflow-visible", className)}
      {...a11y}
    >
      <g aria-hidden="true" data-layer="edges">
        {geo.frames.map((frame) => (
          <g key={frame.id} {...drawHooks("fade", frame.step, full)}>
            <rect
              x={frame.box.x}
              y={frame.box.y}
              width={frame.box.w}
              height={frame.box.h}
              rx={GROUP.radius}
              className="fill-none stroke-border-strong"
              strokeDasharray="3 3"
              {...HAIRLINE}
            />
            {full ? (
              <text
                x={frame.labelX}
                y={frame.labelY}
                fontSize={TYPE.small}
                className="fill-muted font-mono"
              >
                {frame.label}
              </text>
            ) : null}
          </g>
        ))}

        {geo.shared.map((seg) => (
          <Segment key={seg.key} seg={seg} hooks={full} />
        ))}

        {geo.edges.map((edge) => (
          <g key={edge.key} data-edge-to={edge.to}>
            {edge.segments.map((seg) => (
              <Segment key={seg.key} seg={seg} hooks={full} />
            ))}
            {full
              ? edge.arrows.map((arrow) => (
                  <path
                    key={arrow.key}
                    d={arrow.d}
                    className="fill-graphic"
                    {...drawHooks("fade", arrow.step, full)}
                  />
                ))
              : null}
          </g>
        ))}

        {geo.junctions.map((junction) => (
          <path
            key={junction.id}
            d={junction.d}
            className="fill-graphic"
            {...drawHooks("fade", junction.step, full)}
          />
        ))}

        {full
          ? geo.edges.map((edge) =>
              edge.label ? (
                <text
                  key={edge.key}
                  x={edge.label.x}
                  y={edge.label.y}
                  textAnchor={edge.label.anchor}
                  fontSize={TYPE.small}
                  className="fill-muted font-mono"
                  {...drawHooks("fade", edge.label.step, full)}
                >
                  {edge.label.text}
                </text>
              ) : null,
            )
          : null}
      </g>

      {/* Packet circles are created here by the motion layer (step 7). */}
      <g aria-hidden="true" data-layer="packets" />

      <g data-layer="nodes">
        {geo.nodes.map((node) => {
          const { x, y, w, h } = node.box;
          const alert = failing.has(node.id);
          return (
            <g
              key={node.id}
              data-node={node.id}
              data-active={interactive && activeId === node.id ? "" : undefined}
              className={interactive ? "group cursor-default outline-none" : undefined}
              {...drawHooks("node", node.step, full)}
              {...(interactive ? nodeProps?.(node.id) : undefined)}
            >
              {interactive ? (
                // Focus ring: the global outline does not follow SVG shapes.
                <rect
                  x={x - 3}
                  y={y - 3}
                  width={w + 6}
                  height={h + 6}
                  rx={GROUP.radius}
                  className="fill-none stroke-signal opacity-0 group-focus-visible:opacity-100"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={NODE.radius}
                className="fill-surface stroke-border-strong"
                {...HAIRLINE}
              />
              {interactive ? (
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={NODE.radius}
                  className="fill-none stroke-muted opacity-0 transition-opacity duration-(--dur-fast) ease-out group-hover:opacity-100 group-data-active:opacity-100"
                  {...HAIRLINE}
                />
              ) : null}
              {alert ? (
                <rect
                  data-fx="alert"
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={NODE.radius}
                  opacity={0}
                  className="fill-none stroke-incident"
                  {...HAIRLINE}
                />
              ) : null}
              <circle
                data-fx="ok"
                cx={node.dot.x}
                cy={node.dot.y}
                r={NODE.dotR}
                className="fill-signal"
              />
              {alert ? (
                <circle
                  data-fx="alert"
                  cx={node.dot.x}
                  cy={node.dot.y}
                  r={NODE.dotR}
                  opacity={0}
                  className="fill-incident"
                />
              ) : null}
              {full ? (
                <text
                  x={node.textX}
                  y={node.labelY}
                  fontSize={TYPE.label}
                  className="fill-fg font-mono"
                >
                  {node.label}
                </text>
              ) : null}
              {full && node.sublabel ? (
                <text
                  x={node.textX}
                  y={node.sublabelY}
                  fontSize={TYPE.small}
                  className="fill-muted font-mono"
                >
                  {node.sublabel}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>

      {failing.size > 0 ? (
        <g aria-hidden="true" data-layer="annotations">
          {geo.nodes
            .filter((node) => failing.has(node.id))
            .map((node) => (
              <g key={node.id} fontSize={TYPE.small} textAnchor="end" className="font-mono">
                <text
                  data-fx="degraded"
                  data-for={node.id}
                  x={node.stateX}
                  y={node.stateY}
                  opacity={0}
                  className="fill-incident-text"
                >
                  {ui.diagram.degraded}
                </text>
                <text
                  data-fx="recovered"
                  data-for={node.id}
                  x={node.stateX}
                  y={node.stateY}
                  opacity={0}
                  className="fill-signal-text"
                >
                  {ui.diagram.recovered}
                </text>
              </g>
            ))}
        </g>
      ) : null}
    </svg>
  );
}
