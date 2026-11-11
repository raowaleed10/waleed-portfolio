"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const LIGHT_QUERY = "(prefers-color-scheme: light)";

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function readPreferredTheme(): Theme {
  return readStoredTheme() ?? (window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark");
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Switch instantly: suppress transitions for the frame the tokens change.
  root.setAttribute("data-theme-switching", "");
  root.setAttribute("data-theme", theme);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-theme-switching")),
  );
}

/**
 * Icon button that flips between dark and light. The visible icon and the
 * accessible name are chosen by CSS from <html data-theme>, so the server
 * render never has to know the theme and hydration always matches.
 */
export function ThemeToggle({ className }: { className?: string }) {
  useLayoutEffect(() => {
    // Re-apply after React's dev-mode remount clears <html> attributes; a
    // no-op in production. Then follow OS changes until the visitor chooses.
    document.documentElement.setAttribute("data-theme", readPreferredTheme());

    const media = window.matchMedia(LIGHT_QUERY);
    const onChange = () => {
      if (!readStoredTheme()) applyTheme(media.matches ? "light" : "dark");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    const next: Theme = current === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked: the switch still applies for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-sm text-muted hover:text-fg",
        className,
      )}
    >
      <Sun aria-hidden className="size-4 light:hidden" strokeWidth={1.75} />
      <Moon aria-hidden className="hidden size-4 light:block" strokeWidth={1.75} />
      <span className="sr-only light:hidden">{ui.theme.toLight}</span>
      <span className="sr-only hidden light:inline">{ui.theme.toDark}</span>
    </button>
  );
}
