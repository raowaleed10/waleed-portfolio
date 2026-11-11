import { useEffect, useState, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** One uninterrupted stretch of motion. A new run restarts every loop. */
export interface MotionRun {
  /** performance.now() when the run started; every timeline counts from it. */
  readonly epoch: number;
  /** First run since mount: the CSS draw-in may still be playing. */
  readonly first: boolean;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Motion runs only while the element is on screen, the tab is visible and
 * the visitor has not asked for reduced motion. Each time all three become
 * true a new run starts; when any turns false the run ends (loops clean up
 * and the diagram rests in its static, all-lime state).
 *
 * The hidden desktop/mobile copy is display:none, never intersects, and so
 * never animates.
 */
export function useMotionGate(targetRef: RefObject<Element | null>): MotionRun | null {
  const [run, setRun] = useState<MotionRun | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const media = window.matchMedia(REDUCED_MOTION);
    let inView = false;
    let running = false;
    let started = false;

    const update = () => {
      const next = inView && !document.hidden && !prefersReducedMotion();
      if (next === running) return;
      running = next;
      setRun(next ? { epoch: performance.now(), first: !started } : null);
      if (next) started = true;
    };

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(target);
    document.addEventListener("visibilitychange", update);
    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      media.removeEventListener("change", update);
    };
  }, [targetRef]);

  return run;
}
