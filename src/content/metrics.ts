import type { Metric } from "./types";

export const metrics = [
  { value: 3, suffix: "+", label: "years shipping production web apps" },
  { value: 7, label: "products shipped since Feb 2026" },
  { value: 337, label: "tests gating every merge" },
  { value: 8, label: "live customer sites on UChatbots" },
  { value: 40, suffix: "%", label: "lower API response times on DityTruck" },
] as const satisfies readonly Metric[];
