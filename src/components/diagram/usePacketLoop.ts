import { useEffect, type RefObject } from "react";
import type { Diagram } from "@/content/types";
import { durationMs } from "@/lib/motion";
import type { PacketFlow } from "./flows";
import type { DiagramLayout, EdgeRoute, Point } from "./types";
import { failingAt } from "./useFailoverCycle";
import type { MotionRun } from "./useMotionGate";

/*
 * Packets (step 7): small lime circles that travel the edges. Plain WAAPI,
 * one linear animation per journey, `transform: translate()` and `opacity`
 * only. A deterministic scheduler spawns them from a fixed pool.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const PACKET_RADIUS = 2.5;
/** Travel speed in viewBox units per ms; long hops speed up to stay ≤ 700ms. */
const SPEED = 0.28;
const MAX_HOP_MS = durationMs.slower;
/** Time spent crossing a node, hidden under its box. */
const DWELL_MS = durationMs.fast;
const FADE_MS = 120;
/** First run after mount waits for the CSS draw-in to finish. */
const DRAW_IN_MS = 1100;

interface Stop {
  readonly t: number;
  readonly x: number;
  readonly y: number;
}

export interface Journey {
  readonly keyframes: Keyframe[];
  readonly duration: number;
  /** True when a hop avoided a degraded node at the fork. */
  readonly rerouted: boolean;
  /** Milliseconds from spawn until the packet reaches a failover fork, if it does. */
  readonly forkAtMs: number | null;
}

const distance = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function polylineLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
  return total;
}

function positionAt(stops: readonly Stop[], t: number): Point {
  for (let i = 1; i < stops.length; i++) {
    const [a, b] = [stops[i - 1], stops[i]];
    if (t <= b.t) {
      const k = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
  }
  const last = stops[stops.length - 1];
  return { x: last.x, y: last.y };
}

const round = (n: number) => Math.round(n * 10) / 10;

/** The waypoints for one hop, reversed for the far direction of a two-way edge. */
function hopPoints(diagram: Diagram, layout: DiagramLayout, from: string, to: string) {
  const forward = layout.edges.find((r) => r.from === from && r.to === to);
  if (forward) return forward;
  const backward = layout.edges.find((r) => r.from === to && r.to === from);
  const twoWay = diagram.edges.some((e) => e.from === to && e.to === from && e.bidirectional);
  if (!backward || !twoWay) return null;
  return { ...backward, from, to, points: [...backward.points].reverse(), via: undefined };
}

/** Index of the route's junction point, or -1. */
function forkIndex(layout: DiagramLayout, route: EdgeRoute): number {
  const junction = layout.junctions?.find((j) => j.id === route.via);
  return junction ? route.points.findIndex((p) => p.x === junction.x && p.y === junction.y) : -1;
}

export interface PlanContext {
  readonly diagram: Diagram;
  readonly layout: DiagramLayout;
  /** diagram.failover: hops to either node are decided at the fork. */
  readonly pair: readonly [string, string] | undefined;
  /** Whether the failover cycle is running (otherwise packets just alternate). */
  readonly degrade: boolean;
  /** Alternates 0, 1, 0… for packets that split normally. */
  readonly nextSplit: () => 0 | 1;
}

/**
 * Plans one packet's whole journey as timed stops, then turns it into WAAPI
 * keyframes. Each hop runs from the source box's border to the target's;
 * between hops the packet crosses the node under its opaque box, which reads
 * as a short processing pause.
 */
export function planJourney(flow: PacketFlow, ctx: PlanContext, spawnedAt: number): Journey | null {
  const stops: Stop[] = [];
  let t = 0;
  let firstHopMs = 0;
  let lastHopMs = 0;
  let rerouted = false;
  let forkAtMs: number | null = null;

  for (let i = 0; i < flow.path.length - 1; i++) {
    const from = flow.path[i];
    let route = hopPoints(ctx.diagram, ctx.layout, from, flow.path[i + 1]);
    if (!route) return null;
    if (i > 0) t += DWELL_MS;

    let hopMs = Math.min(polylineLength(route.points) / SPEED, MAX_HOP_MS);
    const fork = forkIndex(ctx.layout, route);
    if (ctx.pair && fork >= 0 && ctx.pair.includes(route.to)) {
      // Decide the branch for the moment the packet reaches the fork.
      const toFork = polylineLength(route.points.slice(0, fork + 1));
      forkAtMs = t + (toFork / polylineLength(route.points)) * hopMs;
      const failing = ctx.degrade ? failingAt(spawnedAt + forkAtMs) : null;
      const choice = failing === null ? ctx.nextSplit() : failing === 0 ? 1 : 0;
      rerouted = rerouted || failing !== null;
      route = hopPoints(ctx.diagram, ctx.layout, from, ctx.pair[choice]) ?? route;
      hopMs = Math.min(polylineLength(route.points) / SPEED, MAX_HOP_MS);
    }

    const speed = polylineLength(route.points) / hopMs;
    stops.push({ t, ...route.points[0] });
    for (let p = 1; p < route.points.length; p++) {
      t += distance(route.points[p - 1], route.points[p]) / speed;
      stops.push({ t, ...route.points[p] });
    }
    if (i === 0) firstHopMs = hopMs;
    lastHopMs = hopMs;
  }

  const total = t;
  if (stops.length < 2 || total <= 0) return null;

  // Fade in over the start of the first hop and out over the end of the last.
  const fadeIn = Math.min(FADE_MS, firstHopMs * 0.45);
  const fadeOut = Math.min(FADE_MS, lastHopMs * 0.45);
  const times = [...new Set([...stops.map((s) => s.t), fadeIn, total - fadeOut])].sort(
    (a, b) => a - b,
  );
  const keyframes = times.map((time): Keyframe => {
    const p = positionAt(stops, time);
    const opacity = Math.max(0, Math.min(1, time / fadeIn, (total - time) / fadeOut));
    return {
      offset: Math.min(1, time / total),
      transform: `translate(${round(p.x)}px, ${round(p.y)}px)`,
      opacity: round(opacity),
    };
  });
  return { keyframes, duration: total, rerouted, forkAtMs };
}

export interface PacketLoopOptions {
  svgRef: RefObject<SVGSVGElement | null>;
  diagram: Diagram;
  layout: DiagramLayout;
  flows: readonly PacketFlow[];
  /** Spawn cadence; during a failover the rerouted flow spawns twice as often. */
  everyMs: number;
  pool: number;
  /** The failover cycle is running: steer packets away from the degraded node. */
  degrade: boolean;
  run: MotionRun | null;
}

/**
 * Spawns packets while `run` is set. A tick fires every everyMs/2: even ticks
 * spawn the next flow by smooth weighted round-robin (deterministic); odd
 * ticks add an extra packet on the failover flow only while it would reach
 * the fork during a degraded window, so the reroute reads clearly. Circles
 * are created on start and removed on stop, so the server markup has an
 * empty packet layer.
 */
export function usePacketLoop({
  svgRef,
  diagram,
  layout,
  flows,
  everyMs,
  pool,
  degrade,
  run,
}: PacketLoopOptions): void {
  useEffect(() => {
    const layer = svgRef.current?.querySelector('[data-layer="packets"]');
    if (!run || !layer || flows.length === 0) return;

    const slots = Array.from({ length: pool }, () => {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("r", String(PACKET_RADIUS));
      circle.setAttribute("opacity", "0");
      circle.setAttribute("class", "fill-signal");
      layer.appendChild(circle);
      return { circle, animation: null as Animation | null };
    });

    let split: 0 | 1 = 1;
    const ctx: PlanContext = {
      diagram,
      layout,
      pair: diagram.failover,
      degrade,
      nextSplit: () => {
        split = split === 0 ? 1 : 0;
        return split;
      },
    };

    // Smooth weighted round-robin: an even, repeatable interleaving.
    const credit = flows.map(() => 0);
    const totalWeight = flows.reduce((sum, f) => sum + f.weight, 0);
    const nextFlow = () => {
      let best = 0;
      flows.forEach((flow, i) => {
        credit[i] += flow.weight;
        if (credit[i] > credit[best]) best = i;
      });
      credit[best] -= totalWeight;
      return flows[best];
    };
    const pair = diagram.failover;
    const failoverFlow =
      degrade && pair ? flows.find((f) => f.path.some((id) => pair.includes(id))) : undefined;

    const spawn = (flow: PacketFlow, elapsed: number, onlyIfRerouted: boolean) => {
      const slot = slots.find((s) => s.animation === null);
      if (!slot) return;
      const journey = planJourney(flow, ctx, elapsed);
      if (!journey || (onlyIfRerouted && !journey.rerouted)) return;
      const animation = slot.circle.animate(journey.keyframes, {
        duration: journey.duration,
        easing: "linear",
      });
      slot.animation = animation;
      animation.onfinish = () => {
        slot.animation = null;
      };
    };

    const half = everyMs / 2;
    const start = run.epoch + (run.first ? DRAW_IN_MS : 0);
    let tick = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const elapsed = performance.now() - run.epoch;
      if (tick % 2 === 0) spawn(nextFlow(), elapsed, false);
      else if (failoverFlow) spawn(failoverFlow, elapsed, true);
      tick += 1;
      timer = setTimeout(step, Math.max(0, start + tick * half - performance.now()));
    };
    timer = setTimeout(step, Math.max(0, start - performance.now()));

    return () => {
      clearTimeout(timer);
      for (const slot of slots) {
        slot.animation?.cancel();
        slot.circle.remove();
      }
    };
  }, [svgRef, diagram, layout, flows, everyMs, pool, degrade, run]);
}
