/**
 * Motion tokens for JavaScript (Motion for React, WAAPI). Mirrors the
 * --dur-*, --ease-* and --stagger custom properties in tokens.css and
 * globals.css. Change both together.
 */

/** Durations in milliseconds (WAAPI, timers). */
export const durationMs = {
  fast: 200,
  base: 320,
  slow: 500,
  slower: 700,
} as const;

/** Durations in seconds (Motion for React). */
export const duration = {
  fast: durationMs.fast / 1000,
  base: durationMs.base / 1000,
  slow: durationMs.slow / 1000,
  slower: durationMs.slower / 1000,
} as const;

/** Cubic-bezier control points (Motion accepts the array form). */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

/** CSS strings for WAAPI `easing`. */
export const easeCss = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  linear: "linear",
} as const;

export const staggerMs = 40;
export const stagger = staggerMs / 1000;

/** True when the visitor asked the OS for reduced motion. Client-only. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
