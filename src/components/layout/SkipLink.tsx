import { buttonStyles } from "@/components/ui/ButtonLink";
import { ui } from "@/content/ui";

/**
 * The first tab stop on every page. Invisible (and click-through) until it
 * receives focus, then it fades in at the top left, above the nav. The
 * target is the layout's <main id="main" tabIndex={-1}>.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className={buttonStyles(
        "primary",
        "pointer-events-none fixed top-2.5 left-(--gutter) z-(--z-skip) opacity-0 focus:pointer-events-auto focus:opacity-100",
      )}
    >
      {ui.nav.skipToContent}
    </a>
  );
}
