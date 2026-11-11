import { describe, expect, it } from "vitest";
import { diagrams } from "@/content/diagrams";
import type { Diagram, DiagramId } from "@/content/types";
import { packetFlows } from "./flows";
import { diagramLayouts } from "./layouts";
import type { DiagramLayout } from "./types";
import { FAILOVER, failingAt } from "./useFailoverCycle";
import { planJourney, type PlanContext } from "./usePacketLoop";

/* Step 7: packet journeys and the failover timeline. */

function context(diagram: Diagram, layout: DiagramLayout, degrade = false): PlanContext {
  let split: 0 | 1 = 1;
  return {
    diagram,
    layout,
    pair: diagram.failover,
    degrade,
    nextSplit: () => {
      split = split === 0 ? 1 : 0;
      return split;
    },
  };
}

/** The packet's final position, parsed from the last keyframe. */
function endPoint(keyframes: Keyframe[]) {
  const match = /translate\(([\d.]+)px, ([\d.]+)px\)/.exec(String(keyframes.at(-1)?.transform));
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
}

describe("failingAt", () => {
  it("degrades the first provider, then the second, then the first again", () => {
    expect(failingAt(0)).toBeNull();
    expect(failingAt(FAILOVER.degradeAtMs - 1)).toBeNull();
    expect(failingAt(FAILOVER.degradeAtMs)).toBe(0);
    expect(failingAt(FAILOVER.recoverAtMs - 1)).toBe(0);
    expect(failingAt(FAILOVER.recoverAtMs)).toBeNull();
    expect(failingAt(FAILOVER.cycleMs + FAILOVER.degradeAtMs)).toBe(1);
    expect(failingAt(2 * FAILOVER.cycleMs + FAILOVER.degradeAtMs)).toBe(0);
  });
});

const cases = (Object.keys(diagramLayouts) as DiagramId[]).flatMap((id) =>
  (["desktop", "mobile"] as const).map((kind) => ({
    id,
    kind,
    diagram: diagrams[id] as Diagram,
    layout: diagramLayouts[id][kind] as DiagramLayout,
  })),
);

describe.each(cases)("$id $kind packets", ({ id, diagram, layout }) => {
  it("plans every flow as a valid, fading WAAPI journey", () => {
    for (const flow of packetFlows[id]) {
      const journey = planJourney(flow, context(diagram, layout), 0);
      expect(journey, flow.path.join("→")).not.toBeNull();
      if (!journey) continue;
      const offsets = journey.keyframes.map((k) => Number(k.offset));
      expect(offsets[0]).toBe(0);
      expect(offsets.at(-1)).toBe(1);
      for (let i = 1; i < offsets.length; i++) {
        expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1]);
      }
      expect(journey.keyframes[0].opacity).toBe(0);
      expect(journey.keyframes.at(-1)?.opacity).toBe(0);
      expect(Math.max(...journey.keyframes.map((k) => Number(k.opacity)))).toBe(1);
      // Each hop is capped at 700ms, plus a 200ms crossing per node in between.
      expect(journey.duration).toBeLessThanOrEqual((flow.path.length - 1) * 700 + (flow.path.length - 2) * 200);
    }
  });

  if (diagram.failover) {
    const [a, b] = diagram.failover;
    const flow = packetFlows[id].find((f) => f.path.some((n) => n === a || n === b));
    const entry = (node: string) =>
      layout.edges.find((r) => r.to === node)?.points.at(-1) ?? null;

    it("splits between both providers while nominal", () => {
      const ctx = context(diagram, layout, true);
      const ends = [0, 450].map((t) => endPoint(planJourney(flow!, ctx, t)!.keyframes));
      expect(ends).toContainEqual(entry(a));
      expect(ends).toContainEqual(entry(b));
    });

    it("sends every packet reaching the fork to the healthy provider", () => {
      const ctx = context(diagram, layout, true);
      const lead = planJourney(flow!, context(diagram, layout), 0)!.forkAtMs;
      expect(lead).not.toBeNull();
      // Spawned so they reach the fork inside the window: cycle 0 fails A, cycle 1 fails B.
      for (const [window, healthy] of [
        [FAILOVER.degradeAtMs, b],
        [FAILOVER.cycleMs + FAILOVER.degradeAtMs, a],
      ] as const) {
        for (let i = 0; i < 8; i++) {
          const journey = planJourney(flow!, ctx, window + 100 + i * 225 - lead!)!;
          expect(journey.rerouted).toBe(true);
          expect(endPoint(journey.keyframes)).toEqual(entry(healthy));
        }
      }
      // Arriving just after recovery, traffic splits again.
      const after = planJourney(flow!, ctx, FAILOVER.recoverAtMs + 50 - lead!)!;
      expect(after.rerouted).toBe(false);
    });
  }
});
