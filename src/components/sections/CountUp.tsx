"use client";

import { cubicBezier } from "motion/react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { durationMs, ease, prefersReducedMotion } from "@/lib/motion";

/** Registers a number's text span with its group; returns the cleanup. */
type Register = (element: HTMLElement, value: number) => () => void;

const CountUpContext = createContext<Register | null>(null);

/** The --ease-out token as a function, for the rAF loop. */
const easeOut = cubicBezier(...ease.out);

/** Count when this share of the group is on screen. */
const TRIGGER = 0.4;

/*
 * Intermediate steps up to the trigger, so a group taller than the viewport
 * (big text, short landscape screens) still reports in as it scrolls and can
 * fall back to "fills 40% of the viewport" (see isSeen).
 */
const THRESHOLDS = [0, 0.1, 0.2, 0.3, TRIGGER];

function isSeen(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= TRIGGER) return true;
  const viewport = entry.rootBounds?.height ?? 0;
  return viewport > 0 && entry.intersectionRect.height >= viewport * TRIGGER;
}

/**
 * Writes a number into a span React rendered. It updates the existing text
 * node in place, so React's reference to it stays valid.
 */
function write(element: HTMLElement, value: number) {
  const text = String(value);
  const node = element.firstChild;
  if (node instanceof Text) {
    if (node.data !== text) node.data = text;
  } else {
    element.textContent = text;
  }
}

/**
 * Counts every <CountUp> inside it up from 0, once, when the group is about
 * 40% visible. One observer and one rAF loop drive all the numbers, so they
 * start in the same frame and land together.
 *
 * The server HTML and the hydration render always hold the final values
 * (crawlers and no-JS visitors see the truth). After hydration:
 * - group already on screen, even partly, or reduced motion → nothing happens;
 * - group off screen → its numbers quietly drop to 0, then count up over
 *   700ms on the --ease-out curve when it scrolls into view.
 */
export function CountUpGroup({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetsRef = useRef(new Map<HTMLElement, number>());

  const register = useCallback<Register>((element, value) => {
    const targets = targetsRef.current;
    targets.set(element, value);
    return () => {
      targets.delete(element);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const targets = targetsRef.current;
    if (!root || typeof IntersectionObserver === "undefined" || prefersReducedMotion()) return;

    /** Shows every number at `progress` (0–1) of its final value. */
    const show = (progress: number) => {
      for (const [element, value] of targets) write(element, Math.round(value * progress));
    };

    let frame = 0;
    let armed = false;

    const count = () => {
      let start: number | undefined;
      const tick = (now: number) => {
        start ??= now;
        const t = Math.min((now - start) / durationMs.slower, 1);
        show(easeOut(t));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;

        // The first report describes the page as hydration left it.
        if (!armed) {
          if (entry.isIntersecting) {
            observer.disconnect();
            return;
          }
          armed = true;
          show(0);
          return;
        }

        if (!isSeen(entry)) return;
        observer.disconnect();
        if (prefersReducedMotion()) show(1);
        else count();
      },
      { threshold: THRESHOLDS },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      // Never leave a number at 0 or mid-count.
      if (armed) show(1);
    };
  }, []);

  return (
    <CountUpContext value={register}>
      <div ref={rootRef} className={className}>
        {children}
      </div>
    </CountUpContext>
  );
}

/**
 * One counting number, e.g. 337 or 40 + "%". Outside a CountUpGroup it is a
 * plain static number.
 *
 * - The visible copy is aria-hidden; screen readers get the final value from
 *   an sr-only copy, never the intermediate ones.
 * - Its box reserves the final string's width (min-width in ch, with tabular
 *   figures), so counting never moves anything around it.
 * - The suffix is muted, like a unit on a dashboard readout.
 */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const register = use(CountUpContext);
  const final = `${value}${suffix}`;

  const ref = useCallback(
    (element: HTMLSpanElement | null) =>
      element && register ? register(element, value) : undefined,
    [register, value],
  );

  return (
    <>
      <span
        aria-hidden
        style={{ "--count-w": `${final.length}ch` } as CSSProperties}
        className="inline-block min-w-(--count-w) tabular-nums"
      >
        <span ref={ref}>{value}</span>
        {suffix ? <span className="text-muted">{suffix}</span> : null}
      </span>
      <span className="sr-only">{final}</span>
    </>
  );
}
