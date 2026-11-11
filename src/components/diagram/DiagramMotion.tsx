"use client";

import type { RefObject } from "react";
import type { Diagram } from "@/content/types";
import styles from "./diagram-motion.module.css";
import { packetFlows, packetTuning } from "./flows";
import type { DiagramLayout } from "./types";
import { useFailoverCycle } from "./useFailoverCycle";
import { useMotionGate } from "./useMotionGate";
import { usePacketLoop } from "./usePacketLoop";

/** Class for the diagram's <svg>: turns on the CSS draw-in. */
export const drawInClassName = styles.drawIn;

/**
 * Step 7's single entry point: packets and the failover cycle. Renders
 * nothing; it drives the SVG that LiveDiagram rendered. Everything pauses
 * off screen, in a hidden tab and under reduced motion (useMotionGate).
 */
export function DiagramMotion({
  rootRef,
  svgRef,
  diagram,
  layout,
  failover,
}: {
  rootRef: RefObject<HTMLElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  diagram: Diagram;
  layout: DiagramLayout;
  failover: boolean;
}) {
  const run = useMotionGate(rootRef);
  const tuning = packetTuning[diagram.id];

  usePacketLoop({
    svgRef,
    diagram,
    layout,
    flows: packetFlows[diagram.id],
    everyMs: tuning.everyMs,
    pool: tuning.pool,
    degrade: failover,
    run,
  });
  useFailoverCycle(svgRef, failover ? diagram.failover : undefined, run);

  return null;
}
