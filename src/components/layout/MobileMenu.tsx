"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { navSections } from "@/content/site";
import type { SectionId } from "@/content/types";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";
import { hasResume, resumeHref } from "@/lib/resume";
import { ariaCurrent, sectionHref } from "./nav-links";

/** Tailwind's `lg` breakpoint. The inline nav takes over from here. */
const LG_QUERY = "(min-width: 64rem)";

/**
 * The nav below 1024px: a "Menu" / "Close" disclosure button and a panel
 * that covers the page under the nav bar. It closes on a link click, Esc
 * (focus returns to the button), a click or focus outside, and when the
 * viewport reaches `lg`. While open, the page behind it does not scroll.
 */
export function MobileMenu({ currentSection }: { currentSection?: SectionId }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const root = rootRef.current;
    const isOutside = (target: EventTarget | null) =>
      root !== null && target instanceof Node && !root.contains(target);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) setOpen(false);
    };
    // Keyboard equivalent of an outside click: tabbing past the panel.
    const onFocusIn = (event: FocusEvent) => {
      if (isOutside(event.target)) setOpen(false);
    };
    const media = window.matchMedia(LG_QUERY);
    const onBreakpoint = () => {
      if (media.matches) setOpen(false);
    };

    // The panel covers the page, so lock the page scroll. The reserved
    // gutter keeps a classic scrollbar's width from shifting the layout.
    const html = document.documentElement;
    const previous = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
    html.style.overflow = "hidden";
    html.style.scrollbarGutter = "stable";

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    media.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      media.removeEventListener("change", onBreakpoint);
      html.style.overflow = previous.overflow;
      html.style.scrollbarGutter = previous.gutter;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="label -mr-3 inline-flex h-11 items-center gap-2.5 rounded-sm px-3 text-muted hover:text-fg aria-expanded:text-fg"
      >
        {/* Both words share one grid cell, so the button keeps the width of the
            longer one and nothing beside it shifts. The hidden word is
            visibility:hidden, so the accessible name is the visible word. */}
        <span className="grid justify-items-end">
          <span className={cn("col-start-1 row-start-1", open && "invisible")}>
            {ui.nav.menuOpen}
          </span>
          <span className={cn("col-start-1 row-start-1", !open && "invisible")}>
            {ui.nav.menuClose}
          </span>
        </span>
        <MenuGlyph open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            key="panel"
            id={panelId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={reduceMotion ? { duration: 0 } : { duration: duration.fast, ease: ease.out }}
            // For Lenis (step 13): let the panel scroll natively.
            data-lenis-prevent=""
            className="fixed inset-x-0 top-(--nav-height) bottom-0 overflow-y-auto overscroll-contain bg-bg"
          >
            <Container className="pb-12">
              <ul>
                {navSections.map((section) => (
                  <li key={section.id} className="border-b border-border">
                    <Link
                      href={sectionHref(section.id)}
                      onClick={close}
                      aria-current={ariaCurrent(section.id === currentSection)}
                      data-nav-section={section.id}
                      className="group -mx-2 flex h-14 items-center gap-4 rounded-sm px-2 text-xl text-fg focus-visible:-outline-offset-2"
                    >
                      <span
                        aria-hidden
                        className="label w-6 text-muted group-aria-[current=true]:text-signal-text"
                      >
                        {section.index}
                      </span>
                      {section.navLabel}
                    </Link>
                  </li>
                ))}
              </ul>
              {hasResume && (
                <ButtonLink
                  href={resumeHref}
                  variant="secondary"
                  onClick={close}
                  className="mt-8 w-full"
                >
                  {ui.nav.resume}
                </ButtonLink>
              )}
            </Container>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Two hairlines that rotate into an X. Transform only; the global
 * reduced-motion rule makes the change instant.
 */
function MenuGlyph({ open }: { open: boolean }) {
  const line =
    "absolute inset-x-0 top-1/2 h-px bg-current transition-transform duration-(--dur-fast) ease-out";
  return (
    <span aria-hidden className="relative block size-3.5">
      <span className={cn(line, open ? "rotate-45" : "-translate-y-1")} />
      <span className={cn(line, open ? "-rotate-45" : "translate-y-1")} />
    </span>
  );
}
