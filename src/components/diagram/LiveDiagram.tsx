"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type SVGProps,
} from "react";
import type { Diagram } from "@/content/types";
import { cn } from "@/lib/cn";
import { DiagramMotion, drawInClassName } from "./DiagramMotion";
import { DiagramSvg } from "./DiagramSvg";
import {
  buildGeometry,
  neighborInDirection,
  tooltipPlacement,
  type Direction,
  type TooltipPlacement,
} from "./geometry";
import { NodeTooltip } from "./NodeTooltip";
import type { DiagramLayout } from "./types";

export interface LiveDiagramProps {
  diagram: Diagram;
  layout: DiagramLayout;
  interactive: boolean;
  animated: boolean;
  failover: boolean;
  className?: string;
}

/** Why a tooltip is open; hover closes on pointer leave, the rest stay. */
type Mode = "hover" | "focus" | "pinned";

interface Active {
  readonly id: string;
  readonly mode: Mode;
}

interface TooltipSource {
  readonly key: string;
  readonly text: string;
  readonly placement: TooltipPlacement;
}

const ARROW_KEYS: Readonly<Record<string, Direction>> = {
  ArrowRight: "r",
  ArrowLeft: "l",
  ArrowDown: "d",
  ArrowUp: "u",
};

/** Grace period so the pointer can travel from a node onto its tooltip. */
const HIDE_DELAY_MS = 120;

/**
 * Tooltip sources: a group with a tooltip shares one tooltip (anchored to
 * its frame) between its members; other nodes anchor their own.
 */
function tooltipSources(diagram: Diagram, layout: DiagramLayout) {
  const sources: TooltipSource[] = [];
  const sourceOf = new Map<string, string>();
  const place = (box: { x: number; y: number; w: number; h: number }) =>
    tooltipPlacement(box, layout.width, layout.height);

  for (const group of diagram.groups ?? []) {
    const frame = layout.groups?.[group.id];
    if (group.tooltip && frame) {
      sources.push({ key: `group-${group.id}`, text: group.tooltip, placement: place(frame) });
    }
  }
  for (const node of diagram.nodes) {
    const groupKey = `group-${node.group}`;
    if (node.tooltip) {
      sources.push({ key: `node-${node.id}`, text: node.tooltip, placement: place(layout.nodes[node.id]) });
      sourceOf.set(node.id, `node-${node.id}`);
    } else if (node.group && sources.some((s) => s.key === groupKey)) {
      sourceOf.set(node.id, groupKey);
    }
  }
  return { sources, sourceOf };
}

function createTimer() {
  let handle: ReturnType<typeof setTimeout> | undefined;
  return {
    start(callback: () => void, ms: number) {
      clearTimeout(handle);
      handle = setTimeout(callback, ms);
    },
    cancel() {
      clearTimeout(handle);
    },
  };
}

/**
 * Client wrapper for diagrams that respond to people (tooltips, keyboard) or
 * move (draw-in, packets, failover). The SVG itself is the same static
 * render as the server one, so the prerendered HTML is complete.
 *
 * Keyboard: the whole diagram is one tab stop (roving tabindex). Arrow keys
 * move to the nearest node in that direction, Home/End jump to the first and
 * last node, focus shows the tooltip, Enter/Space pins or unpins it, Esc
 * closes it. Pointer: hover shows it; a click or tap pins it; a click or tap
 * outside closes it.
 */
export function LiveDiagram({
  diagram,
  layout,
  interactive,
  animated,
  failover,
  className,
}: LiveDiagramProps) {
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hideTimer] = useState(createTimer);
  const geometry = useMemo(() => buildGeometry(diagram, layout), [diagram, layout]);
  const { sources, sourceOf } = useMemo(() => tooltipSources(diagram, layout), [diagram, layout]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [active, setActive] = useState<Active | null>(null);

  const nodes = geometry.nodes;
  const rovingId = focusId ?? nodes[0]?.id;
  const openKey = active ? sourceOf.get(active.id) : undefined;
  const tooltipId = (key: string) => `${uid}-${key}`;

  // While a tooltip is open: Esc anywhere, or a pointer down outside, closes it.
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!(event.target instanceof Node) || !rootRef.current?.contains(event.target)) {
        setActive(null);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  useEffect(() => () => hideTimer.cancel(), [hideTimer]);

  const shareTooltip = (a: string, b: string) =>
    a === b || (sourceOf.get(a) !== undefined && sourceOf.get(a) === sourceOf.get(b));

  const showOnHover = (id: string) => {
    hideTimer.cancel();
    // Hovering keeps a pinned tooltip pinned instead of downgrading it.
    setActive((a) => (a?.mode === "pinned" && shareTooltip(a.id, id) ? a : { id, mode: "hover" }));
  };

  const hideHoverSoon = () => {
    hideTimer.start(() => setActive((a) => (a?.mode === "hover" ? null : a)), HIDE_DELAY_MS);
  };

  const togglePinned = (id: string) => {
    hideTimer.cancel();
    setActive((a) => (a?.mode === "pinned" && a.id === id ? null : { id, mode: "pinned" }));
  };

  const moveFocus = (id: string | undefined) => {
    if (!id) return;
    setFocusId(id);
    setActive({ id, mode: "focus" });
    svgRef.current?.querySelector<SVGGElement>(`[data-node="${id}"]`)?.focus();
  };

  const nodeProps = interactive
    ? (id: string): SVGProps<SVGGElement> => {
        const node = nodes.find((n) => n.id === id);
        const tip = sourceOf.get(id);
        return {
          role: "button",
          tabIndex: id === rovingId ? 0 : -1,
          "aria-label": node?.sublabel ? `${node.label}, ${node.sublabel}` : node?.label,
          "aria-describedby": tip ? tooltipId(tip) : undefined,
          onPointerEnter: (event: PointerEvent<SVGGElement>) => {
            if (event.pointerType !== "touch") showOnHover(id);
          },
          onPointerLeave: (event: PointerEvent<SVGGElement>) => {
            if (event.pointerType !== "touch") hideHoverSoon();
          },
          onClick: () => togglePinned(id),
          onFocus: (event: FocusEvent<SVGGElement>) => {
            setFocusId(id);
            // Keyboard focus shows the tooltip; focus from a click or tap does not.
            if (event.currentTarget.matches(":focus-visible")) {
              setActive((a) => (a?.mode === "pinned" && a.id === id ? a : { id, mode: "focus" }));
            }
          },
          onBlur: (event: FocusEvent<SVGGElement>) => {
            const next = event.relatedTarget;
            if (next instanceof Node && rootRef.current?.contains(next)) return;
            setActive((a) => (a && a.mode !== "hover" ? null : a));
          },
          onKeyDown: (event: KeyboardEvent<SVGGElement>) => {
            const dir = ARROW_KEYS[event.key];
            if (dir) {
              event.preventDefault();
              moveFocus(neighborInDirection(nodes, id, dir) ?? undefined);
            } else if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              moveFocus(event.key === "Home" ? nodes[0]?.id : nodes[nodes.length - 1]?.id);
            } else if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              togglePinned(id);
            } else if (event.key === "Escape" && active) {
              event.preventDefault();
              setActive(null);
            }
          },
        };
      }
    : undefined;

  return (
    <figure ref={rootRef} className={cn("relative", className)}>
      <figcaption className="sr-only">{diagram.title}</figcaption>
      <DiagramSvg
        diagram={diagram}
        layout={layout}
        geometry={geometry}
        failover={failover}
        svgRef={svgRef}
        nodeProps={nodeProps}
        activeId={active?.id ?? null}
        className={animated ? drawInClassName : undefined}
      />
      {interactive
        ? sources.map((source) => (
            <NodeTooltip
              key={source.key}
              id={tooltipId(source.key)}
              text={source.text}
              placement={source.placement}
              open={openKey === source.key}
              onPointerEnter={hideTimer.cancel}
              onPointerLeave={hideHoverSoon}
            />
          ))
        : null}
      {animated ? (
        <DiagramMotion
          rootRef={rootRef}
          svgRef={svgRef}
          diagram={diagram}
          layout={layout}
          failover={failover}
        />
      ) : null}
    </figure>
  );
}
