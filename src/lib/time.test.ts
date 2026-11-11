import { describe, expect, it } from "vitest";
import { clock } from "@/content/hero";
import {
  formatHour,
  formatTime,
  getClockState,
  getRemoteWindow,
  isWithinWindow,
  maxMessageLength,
  MAX_TIME_LENGTH,
  zonedTimeToInstant,
} from "./time";

/*
 * The literal strings from docs/content.md. Asserting them here (not via the
 * clock config) means a content edit that breaks the wording fails a test.
 */
const ONLINE = "Online now — overlapping ET business hours";
const offline = (time: string) => `Off hours — online from 5 PM PKT (${time} ET)`;

/**
 * An instant from a Lahore wall-clock time. Pakistan is UTC+5 with no daylight
 * saving; only the tests spell that out. The code under test reads every
 * offset from Intl.
 */
const pkt = (wall: string) => new Date(`${wall}:00+05:00`);
const utc = (iso: string) => new Date(iso);

describe("getClockState", () => {
  it("formats both clocks with Intl, using plain spaces", () => {
    const state = getClockState(utc("2026-01-15T10:00:00Z"));
    expect(state.homeTime).toBe("3:00 PM");
    expect(state.remoteTime).toBe("5:00 AM");
    expect(state.iso).toBe("2026-01-15T10:00:00.000Z");
    expect(`${state.homeTime}${state.remoteTime}`).not.toMatch(/[  ]/);
  });

  it("uses the exact online wording from content", () => {
    const state = getClockState(pkt("2026-01-15T21:30"));
    expect(state.online).toBe(true);
    expect(state.message).toBe(ONLINE);
  });

  it("is off hours on a winter morning, back at 7 AM ET", () => {
    const state = getClockState(utc("2026-01-15T10:00:00Z"));
    expect(state.online).toBe(false);
    expect(state.message).toBe(offline("7 AM"));
  });

  it("is off hours on a summer morning, back at 8 AM ET", () => {
    const state = getClockState(utc("2026-07-15T10:00:00Z"));
    expect(state.online).toBe(false);
    expect(state.message).toBe(offline("8 AM"));
  });
});

describe("window boundaries (PKT)", () => {
  it.each([
    ["2026-01-15T00:00", "12:00 AM", true],
    ["2026-01-15T01:59", "1:59 AM", true],
    ["2026-01-15T02:00", "2:00 AM", false],
    ["2026-01-15T16:59", "4:59 PM", false],
    ["2026-01-15T17:00", "5:00 PM", true],
    ["2026-01-15T23:59", "11:59 PM", true],
  ])("%s PKT", (wall, homeTime, online) => {
    const state = getClockState(pkt(wall));
    expect(state.homeTime).toBe(homeTime);
    expect(state.online).toBe(online);
    expect(state.message).toBe(online ? ONLINE : offline("7 AM"));
  });

  it("treats a window that wraps past midnight correctly", () => {
    expect(isWithinWindow(17, clock.window)).toBe(true);
    expect(isWithinWindow(1, clock.window)).toBe(true);
    expect(isWithinWindow(2, clock.window)).toBe(false);
    expect(isWithinWindow(16, clock.window)).toBe(false);
    // A daytime window that doesn't wrap.
    expect(isWithinWindow(9, { startHour: 9, endHour: 17 })).toBe(true);
    expect(isWithinWindow(17, { startHour: 9, endHour: 17 })).toBe(false);
  });
});

describe("US daylight saving transitions", () => {
  // DST starts 2026-03-08 07:00Z (2 AM EST becomes 3 AM EDT).
  it("starts: Mar 7 opens at 7 AM ET, Mar 8 at 8 AM ET", () => {
    const before = getClockState(utc("2026-03-07T10:00:00Z"));
    const after = getClockState(utc("2026-03-08T10:00:00Z"));
    expect(before.remoteTime).toBe("5:00 AM");
    expect(before.message).toBe(offline("7 AM"));
    expect(after.remoteTime).toBe("6:00 AM");
    expect(after.message).toBe(offline("8 AM"));
  });

  it("starts: uses the offset at the next start, not at now", () => {
    // 10 AM PKT on Mar 8 is midnight EST, but 5 PM PKT that day is already EDT.
    const state = getClockState(utc("2026-03-08T05:00:00Z"));
    expect(state.remoteTime).toBe("12:00 AM");
    expect(state.message).toBe(offline("8 AM"));
  });

  // DST ends 2026-11-01 06:00Z (2 AM EDT becomes 1 AM EST).
  it("ends: Oct 31 opens at 8 AM ET, Nov 1 at 7 AM ET", () => {
    const before = getClockState(utc("2026-10-31T10:00:00Z"));
    const after = getClockState(utc("2026-11-01T10:00:00Z"));
    expect(before.remoteTime).toBe("6:00 AM");
    expect(before.message).toBe(offline("8 AM"));
    expect(after.remoteTime).toBe("5:00 AM");
    expect(after.message).toBe(offline("7 AM"));
  });

  it("ends: uses the offset at the next start, not at now", () => {
    // 8 AM PKT on Nov 1 is 11 PM EDT on Oct 31, but 5 PM PKT that day is EST.
    const state = getClockState(utc("2026-11-01T03:00:00Z"));
    expect(state.remoteTime).toBe("11:00 PM");
    expect(state.message).toBe(offline("7 AM"));
  });
});

describe("getRemoteWindow", () => {
  it("is 7 AM – 4 PM ET in winter", () => {
    expect(getRemoteWindow(utc("2026-01-15T12:00:00Z"))).toEqual({ start: "7 AM", end: "4 PM" });
  });

  it("is 8 AM – 5 PM ET in summer", () => {
    expect(getRemoteWindow(utc("2026-07-15T12:00:00Z"))).toEqual({ start: "8 AM", end: "5 PM" });
  });
});

describe("zonedTimeToInstant", () => {
  it("converts a Lahore wall time", () => {
    expect(
      zonedTimeToInstant({ year: 2026, month: 1, day: 15, hour: 17 }, "Asia/Karachi").toISOString(),
    ).toBe("2026-01-15T12:00:00.000Z");
  });

  it("refines across spring forward (3:30 AM EDT on Mar 8)", () => {
    expect(
      zonedTimeToInstant(
        { year: 2026, month: 3, day: 8, hour: 3, minute: 30 },
        "America/New_York",
      ).toISOString(),
    ).toBe("2026-03-08T07:30:00.000Z");
  });

  it("refines across fall back (3 AM EST on Nov 1)", () => {
    expect(
      zonedTimeToInstant({ year: 2026, month: 11, day: 1, hour: 3 }, "America/New_York").toISOString(),
    ).toBe("2026-11-01T08:00:00.000Z");
  });

  it("rolls over month and year ends", () => {
    expect(
      zonedTimeToInstant({ year: 2026, month: 12, day: 32, hour: 17 }, "Asia/Karachi").toISOString(),
    ).toBe("2027-01-01T12:00:00.000Z");
  });
});

describe("formatting", () => {
  it("drops :00 only on whole hours", () => {
    expect(formatHour(utc("2026-01-15T12:00:00Z"), "America/New_York")).toBe("7 AM");
    expect(formatHour(utc("2026-01-15T12:30:00Z"), "America/New_York")).toBe("7:30 AM");
    expect(formatHour(utc("2026-01-15T05:00:00Z"), "America/New_York")).toBe("12 AM");
  });

  it("never exceeds the reserved time width", () => {
    expect(formatTime(utc("2026-01-15T05:59:00Z"), "America/New_York")).toBe("12:59 AM");
    expect(MAX_TIME_LENGTH).toBe("12:59 AM".length);
  });
});

describe("a full year, hour by hour", () => {
  it("agrees with the PKT window and stays within the reserved widths", () => {
    const start = Date.UTC(2026, 0, 1);
    const end = Date.UTC(2027, 0, 1);
    const maxLength = maxMessageLength();
    for (let t = start; t < end; t += 60 * 60 * 1000) {
      const state = getClockState(new Date(t));
      const pktHour = (new Date(t).getUTCHours() + 5) % 24;
      expect(state.online).toBe(pktHour >= 17 || pktHour < 2);
      if (!state.online) expect([offline("7 AM"), offline("8 AM")]).toContain(state.message);
      expect(state.message.length).toBeLessThanOrEqual(maxLength);
      expect(state.homeTime.length).toBeLessThanOrEqual(MAX_TIME_LENGTH);
      expect(state.remoteTime.length).toBeLessThanOrEqual(MAX_TIME_LENGTH);
    }
  });
});
