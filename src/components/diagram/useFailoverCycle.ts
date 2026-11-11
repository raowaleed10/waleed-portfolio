import { useEffect, type RefObject } from "react";
import { durationMs, easeCss } from "@/lib/motion";
import type { MotionRun } from "./useMotionGate";

/*
 * The failover cycle (step 7). Every 8s one provider degrades, traffic
 * reroutes to the other, and it recovers; the next cycle fails the other one.
 *
 *   0–5.0s    nominal: packets split at the fork
 *   5.0s      degraded: amber outline and dot fade in (320ms), the fork's
 *             branch to it dims to 0.25, "degraded" fades in beside it
 *   5.0–7.2s  every packet reaching the fork turns to the healthy provider
 *   7.2s      recovering: amber fades out (700ms), the branch restores,
 *             "degraded" crossfades to "recovered", which then fades out
 *   8.0s      next cycle, other provider
 */
export const FAILOVER = {
  cycleMs: 8000,
  degradeAtMs: 5000,
  recoverAtMs: 7200,
} as const;

/**
 * Which node of the failover pair is degraded `elapsedMs` into a run:
 * 0 or 1 (an index into diagram.failover), or null when both are healthy.
 * The packet loop asks this for the moment a packet reaches the fork.
 */
export function failingAt(elapsedMs: number): 0 | 1 | null {
  if (elapsedMs < 0) return null;
  const cycle = Math.floor(elapsedMs / FAILOVER.cycleMs);
  const t = elapsedMs - cycle * FAILOVER.cycleMs;
  if (t < FAILOVER.degradeAtMs || t >= FAILOVER.recoverAtMs) return null;
  return cycle % 2 === 0 ? 0 : 1;
}

/** [time in ms within one provider's 16s period, opacity, easing to the next point] */
type Track = ReadonlyArray<readonly [number, number, string?]>;

const PERIOD = FAILOVER.cycleMs * 2;
const DOWN = FAILOVER.degradeAtMs;
const UP = FAILOVER.recoverAtMs;
const IN = durationMs.base;
const OUT = durationMs.slower;

/** Amber outline and dot. */
const ALERT: Track = [
  [DOWN, 0, easeCss.out],
  [DOWN + IN, 1],
  [UP, 1, easeCss.inOut],
  [UP + OUT, 0],
];
/** The lime dot underneath crossfades the other way. */
const OK: Track = [
  [DOWN, 1, easeCss.out],
  [DOWN + IN, 0],
  [UP, 0, easeCss.inOut],
  [UP + OUT, 1],
];
/** The fork's branch to the degraded node. */
const BRANCH: Track = [
  [DOWN, 1, easeCss.out],
  [DOWN + IN, 0.25],
  [UP, 0.25, easeCss.inOut],
  [UP + OUT, 1],
];
const DEGRADED_LABEL: Track = [
  [DOWN, 0, easeCss.out],
  [DOWN + IN, 1],
  [UP, 1, easeCss.inOut],
  [UP + IN, 0],
];
const RECOVERED_LABEL: Track = [
  [UP, 0, easeCss.out],
  [UP + IN, 1],
  [FAILOVER.cycleMs, 1, easeCss.inOut],
  [FAILOVER.cycleMs + IN, 0],
];

function keyframes(track: Track): Keyframe[] {
  const frames: Keyframe[] = [{ offset: 0, opacity: track[0][1] }];
  for (const [ms, opacity, easing] of track) {
    frames.push({ offset: ms / PERIOD, opacity, ...(easing ? { easing } : {}) });
  }
  frames.push({ offset: 1, opacity: track[track.length - 1][1] });
  return frames;
}

/**
 * Runs the failover visuals as infinite WAAPI animations (opacity only)
 * aligned to the run's epoch. The second provider uses the same 16s
 * keyframes delayed by one cycle, so the two alternate. Cancelling restores
 * the static markup: amber layers and labels at 0, lime dots and edges at 1.
 */
export function useFailoverCycle(
  svgRef: RefObject<SVGSVGElement | null>,
  pair: readonly [string, string] | undefined,
  run: MotionRun | null,
): void {
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !pair || !run) return;

    const animations: Animation[] = [];
    pair.forEach((id, index) => {
      const targets: ReadonlyArray<readonly [string, Track]> = [
        [`[data-node="${id}"] [data-fx="alert"]`, ALERT],
        [`[data-node="${id}"] [data-fx="ok"]`, OK],
        [`[data-edge-to="${id}"]`, BRANCH],
        [`[data-fx="degraded"][data-for="${id}"]`, DEGRADED_LABEL],
        [`[data-fx="recovered"][data-for="${id}"]`, RECOVERED_LABEL],
      ];
      for (const [selector, track] of targets) {
        for (const element of svg.querySelectorAll(selector)) {
          const animation = element.animate(keyframes(track), {
            duration: PERIOD,
            delay: index * FAILOVER.cycleMs,
            iterations: Infinity,
          });
          animation.startTime = run.epoch;
          animations.push(animation);
        }
      }
    });

    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [svgRef, pair, run]);
}
