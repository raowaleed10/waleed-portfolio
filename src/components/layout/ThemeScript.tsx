/**
 * Runs during HTML parsing, before first paint: applies the stored theme, or
 * the OS preference on a first visit, so the wrong theme never flashes.
 * Keep the logic in sync with readPreferredTheme() in ThemeToggle.
 */
const script = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}d.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
