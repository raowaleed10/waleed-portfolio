import { useSyncExternalStore } from "react";

/**
 * A shared, client-only clock for useSyncExternalStore.
 *
 * - Server (and hydration) snapshot: null, so the server HTML and the first
 *   client render are identical and never read the time during prerendering.
 * - Client snapshot: one cached timestamp, stable between ticks.
 * - Ticks land on every :00 and :30 second, so a new minute shows up on time
 *   rather than up to 30s late. Paused while the tab is hidden; refreshed the
 *   moment it becomes visible again.
 */

const TICK_MS = 30_000;

let now: number | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function update() {
  now = Date.now();
  for (const listener of listeners) listener();
}

function stop() {
  clearTimeout(timer);
  timer = undefined;
}

function schedule() {
  stop();
  // Recomputed every tick, so an early or late timer corrects itself.
  timer = setTimeout(
    () => {
      update();
      schedule();
    },
    TICK_MS - (Date.now() % TICK_MS),
  );
}

function onVisibilityChange() {
  if (document.visibilityState === "visible") {
    update();
    schedule();
  } else {
    stop();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    document.addEventListener("visibilitychange", onVisibilityChange);
    // A remount (e.g. navigating back to the page) must not show a stale time.
    onVisibilityChange();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    }
  };
}

function getSnapshot(): number {
  now ??= Date.now();
  return now;
}

function getServerSnapshot(): null {
  return null;
}

/** The current time in ms, refreshed every 30s; null on the server and during hydration. */
export function useNow(): number | null {
  return useSyncExternalStore<number | null>(subscribe, getSnapshot, getServerSnapshot);
}
