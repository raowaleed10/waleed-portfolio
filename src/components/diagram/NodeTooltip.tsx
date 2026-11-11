import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { TooltipPlacement } from "./geometry";

/** Gap between the node (or group frame) and its tooltip. */
const OFFSET = "8px";

function placementStyle(p: TooltipPlacement): CSSProperties {
  return {
    // Never wider than the room on its side of the anchor, so it stays inside
    // the diagram (and the viewport) at any width.
    maxWidth: `min(32ch, ${p.maxWidth}%)`,
    ...(p.align === "end" ? { right: `${p.x}%` } : { left: `${p.x}%` }),
    ...(p.side === "below"
      ? { top: `calc(${p.y}% + ${OFFSET})` }
      : { bottom: `calc(${p.y}% + ${OFFSET})` }),
    // Shared fade-rise keyframes, shortened for a tooltip; it slides in from
    // the anchor's side.
    animationDuration: "var(--dur-fast)",
    ...({ "--rise": p.side === "below" ? "-4px" : "4px" } as CSSProperties),
  };
}

/**
 * One node's (or one group's) tooltip: crisp HTML text over the SVG,
 * positioned in percent of the diagram so it tracks any rendered size.
 * Always in the DOM so aria-describedby resolves; `hidden` until open.
 */
export function NodeTooltip({
  id,
  text,
  placement,
  open,
  onPointerEnter,
  onPointerLeave,
}: {
  id: string;
  text: string;
  placement: TooltipPlacement;
  open: boolean;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  return (
    <div
      id={id}
      role="tooltip"
      hidden={!open}
      style={placementStyle(placement)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={cn(
        "absolute z-(--z-tooltip) w-max animate-fade-rise rounded-md border border-border-strong bg-raised px-3 py-2 text-sm text-pretty text-fg",
        placement.align === "center" && "-translate-x-1/2",
      )}
    >
      {text}
    </div>
  );
}
