"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { navSections } from "@/content/site";

/** A section counts as current once its top passes this share of the viewport. */
const LINE = 0.35;

/**
 * Scroll-spy for the nav. Sets aria-current="true" on the [data-nav-section]
 * link of the section being read (desktop links and the mobile menu's, which
 * only exist while the menu is open), and clears it everywhere else. The Nav
 * styles its active state purely from that attribute.
 */
export function ActiveSection() {
  // The layout persists across navigations: re-scan sections on every route.
  const pathname = usePathname();

  useEffect(() => {
    const sections = navSections
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) {
      // Pages without homepage sections: no link is current.
      for (const link of document.querySelectorAll("[data-nav-section]")) link.removeAttribute("aria-current");
      return;
    }

    let current: string | null = null;
    let frame = 0;

    const apply = () => {
      for (const link of document.querySelectorAll<HTMLElement>("[data-nav-section]")) {
        if (link.dataset.navSection === current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    };

    const update = () => {
      frame = 0;
      const line = window.innerHeight * LINE;
      let next: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) next = section.id;
      }
      // The last section may never reach the line: treat the page bottom as reaching it.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        next = sections[sections.length - 1].id;
      }
      if (next !== current) {
        current = next;
        apply();
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Re-apply when the mobile menu mounts its links.
    const header = document.querySelector("header");
    const observer = new MutationObserver(apply);
    if (header) observer.observe(header, { childList: true, subtree: true });

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return null;
}
