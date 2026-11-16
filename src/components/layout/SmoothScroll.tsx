"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Absolute scroll position that puts `target` just below the sticky nav, the
 * same spot a native anchor jump reaches via html scroll-padding-top. Computed
 * from live layout so it stays right wherever the scroll starts from.
 */
function anchorY(target: HTMLElement): number {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - padding);
}

/** Moves focus to an anchor target without scrolling again, so keyboard users continue from there. */
function focusTarget(target: HTMLElement) {
  if (!target.hasAttribute("tabindex") && !target.matches("a, button, input, select, textarea")) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });
}

/** Same-page hash link → its target element, or null. */
function sameDocumentTarget(link: HTMLAnchorElement): HTMLElement | null {
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return null;
  return document.getElementById(decodeURIComponent(url.hash.slice(1)));
}

/**
 * Lenis smooth scrolling, site-wide. Off under prefers-reduced-motion (native
 * scrolling and CSS scroll-padding take over), and touch scrolling stays native.
 * Same-page anchor links scroll smoothly to just below the sticky nav (the
 * html scroll-padding-top, as a native jump would), update the URL
 * hash, and move focus to the target.
 */
export function SmoothScroll() {
  useEffect(() => {
    let lenis: Lenis | null = null;

    const start = () => {
      if (lenis || prefersReducedMotion()) return;
      lenis = new Lenis({ autoRaf: true, lerp: 0.12 });
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const target = sameDocumentTarget(link);
      if (!target) return;

      event.preventDefault();
      const hash = `#${target.id}`;
      if (location.hash !== hash) history.pushState(null, "", hash);

      if (lenis) {
        // Lenis may have started on this very click and not measured the page
        // yet (its scroll limit would still be 0): measure synchronously first.
        lenis.resize();
        lenis.scrollTo(anchorY(target), { onComplete: () => focusTarget(target) });
      } else {
        target.scrollIntoView({ block: "start" });
        focusTarget(target);
      }
    };

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => (media.matches ? stop() : start());

    // Start on the visitor's first input, not at load: smooth scrolling only
    // matters once someone scrolls, and this keeps Lenis's full-page
    // measurement out of the load-time critical path. Until then, anchor
    // links use the native jump (same landing spot).
    const firstInput = ["wheel", "pointerdown", "keydown", "touchstart"] as const;
    const onFirstInput = () => {
      for (const type of firstInput) window.removeEventListener(type, onFirstInput);
      start();
    };
    for (const type of firstInput) window.addEventListener(type, onFirstInput, { passive: true });
    // Capture phase: runs before next/link's own handler, which then skips the
    // already-handled (defaultPrevented) same-page click.
    document.addEventListener("click", onClick, true);
    media.addEventListener("change", onMotionChange);
    return () => {
      for (const type of firstInput) window.removeEventListener(type, onFirstInput);
      document.removeEventListener("click", onClick, true);
      media.removeEventListener("change", onMotionChange);
      stop();
    };
  }, []);

  return null;
}
