/**
 * Time-zone logic for the hero's live dual clock.
 *
 * Every function here is a pure function of an instant and the clock config,
 * so it runs the same in Node (tests) and the browser. No UTC offset is ever
 * hard-coded: each one is read from Intl at the instant in question, so
 * daylight saving in either zone needs no special cases.
 */
import { clock as defaultClock } from "@/content/hero";
import type { Clock } from "@/content/types";

/** Longest string `formatTime` returns ("12:59 AM"); the UI reserves this many `ch`. */
export const MAX_TIME_LENGTH = "12:59 AM".length;

/** Placeholder in `clock.offline` for the next start time. */
const TIME_SLOT = "{time}";

export interface WallTime {
  readonly year: number;
  /** 1–12 */
  readonly month: number;
  readonly day: number;
  /** 0–23 */
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

export interface ClockState {
  /** The instant shown, for `<time dateTime>`. */
  readonly iso: string;
  /** Home-zone time, e.g. "9:04 PM". */
  readonly homeTime: string;
  /** Remote-zone time, e.g. "11:04 AM". */
  readonly remoteTime: string;
  /** Inside the home-zone working window. */
  readonly online: boolean;
  /** `clock.online`, or `clock.offline` with the next start time filled in. */
  readonly message: string;
}

/* ------------------------------------------------------------ formatting */

// Building a DateTimeFormat is slow; the clock re-renders every 30s.
const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const wallFormatters = new Map<string, Intl.DateTimeFormat>();

function timeFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = timeFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" });
    timeFormatters.set(timeZone, formatter);
  }
  return formatter;
}

function wallFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = wallFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    wallFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/**
 * Newer ICU versions put a narrow no-break space (U+202F) before "AM"/"PM",
 * older ones a regular space; some use U+00A0. Normalizing keeps Node and
 * every browser identical. The UI prevents wrapping with CSS instead.
 */
function normalizeSpaces(text: string): string {
  return text.replace(/[  ]/g, " ");
}

/** The time in `timeZone`, e.g. "9:04 PM". */
export function formatTime(date: Date, timeZone: string): string {
  return normalizeSpaces(timeFormatter(timeZone).format(date));
}

/** Like `formatTime`, without ":00" on whole hours: "7 AM", but "7:30 AM". */
export function formatHour(date: Date, timeZone: string): string {
  return formatTime(date, timeZone).replace(/:00(?= )/, "");
}

/* ------------------------------------------------------------- zone math */

/** The 24-hour wall-clock reading in `timeZone` at `date`. */
export function getWallTime(date: Date, timeZone: string): WallTime {
  const parts = wallFormatter(timeZone).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

/** The UTC offset of `timeZone` at `date` in ms (positive east of UTC), as Intl reports it. */
function offsetAt(date: Date, timeZone: string): number {
  const wall = getWallTime(date, timeZone);
  const wallAsUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  const wholeSeconds = Math.floor(date.getTime() / 1000) * 1000;
  return wallAsUtc - wholeSeconds;
}

/**
 * The instant at which the wall clock in `timeZone` reads the given time.
 *
 * Reads the wall time as if it were UTC, subtracts the zone's offset at that
 * guess, then refines once with the offset at the result. The second pass
 * matters on transition days, where the offset at the guess and the offset
 * at the answer differ by an hour.
 */
export function zonedTimeToInstant(
  wall: Pick<WallTime, "year" | "month" | "day" | "hour"> & { readonly minute?: number },
  timeZone: string,
): Date {
  const wallAsUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute ?? 0);
  const firstGuess = wallAsUtc - offsetAt(new Date(wallAsUtc), timeZone);
  return new Date(wallAsUtc - offsetAt(new Date(firstGuess), timeZone));
}

/** `wall`'s calendar date moved by `days`, as an hour on that date. */
function onDay(wall: WallTime, days: number, hour: number) {
  const date = new Date(Date.UTC(wall.year, wall.month - 1, wall.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour,
  };
}

/* ---------------------------------------------------------------- window */

/** Whether a home-zone hour (0–23) is inside the working window. Handles windows that wrap past midnight. */
export function isWithinWindow(hour: number, window: Clock["window"]): boolean {
  const { startHour, endHour } = window;
  return startHour <= endHour
    ? hour >= startHour && hour < endHour
    : hour >= startHour || hour < endHour;
}

/** The next instant the working window opens, strictly after an off-hours `now`. */
function nextWindowStart(now: Date, config: Clock): Date {
  const { timeZone } = config.home;
  const { startHour } = config.window;
  const wall = getWallTime(now, timeZone);
  const days = wall.hour < startHour ? 0 : 1;
  return zonedTimeToInstant(onDay(wall, days, startHour), timeZone);
}

/**
 * The working window that opens on the home-zone calendar day of `date`, in
 * remote-zone times: { start: "7 AM", end: "4 PM" } for 5 PM – 2 AM PKT in
 * winter, { start: "8 AM", end: "5 PM" } during US daylight saving.
 */
export function getRemoteWindow(
  date: Date,
  config: Clock = defaultClock,
): { start: string; end: string } {
  const { home, remote, window } = config;
  const wall = getWallTime(date, home.timeZone);
  const endDays = window.endHour <= window.startHour ? 1 : 0;
  const start = zonedTimeToInstant(onDay(wall, 0, window.startHour), home.timeZone);
  const end = zonedTimeToInstant(onDay(wall, endDays, window.endHour), home.timeZone);
  return {
    start: formatHour(start, remote.timeZone),
    end: formatHour(end, remote.timeZone),
  };
}

/* ----------------------------------------------------------------- state */

/** Everything the dual clock renders for the instant `now`. */
export function getClockState(now: Date, config: Clock = defaultClock): ClockState {
  const { home, remote, window } = config;
  const online = isWithinWindow(getWallTime(now, home.timeZone).hour, window);
  const message = online
    ? config.online
    : config.offline.replace(TIME_SLOT, formatHour(nextWindowStart(now, config), remote.timeZone));

  return {
    iso: now.toISOString(),
    homeTime: formatTime(now, home.timeZone),
    remoteTime: formatTime(now, remote.timeZone),
    online,
    message,
  };
}

/** The longest message `getClockState` can return, in characters; the UI reserves this many `ch`. */
export function maxMessageLength(config: Clock = defaultClock): number {
  return Math.max(
    config.online.length,
    config.offline.length - TIME_SLOT.length + MAX_TIME_LENGTH,
  );
}
