"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

/**
 * Motion for React, configured once:
 * - reducedMotion="user" makes every Motion animation honor the OS setting.
 * - LazyMotion (strict) loads animation features after hydration; use the
 *   lightweight `m.*` components from "motion/react-m", never `motion.*`.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
