import { describe, expect, it } from "vitest";
import { incidentLog, incidentsById } from "@/content/incidents";
import {
  areAllOpen,
  FLIP_DELAY_MS,
  FLIP_STAGGER_MS,
  flipDelayMs,
  incidentDomIds,
  incidentIdFromHash,
  initialDisclosure,
  isEntryOpen,
  samePageHash,
  setAllEntries,
  setEntry,
  traceSteps,
  typeTone,
} from "./IncidentLogic";

const entries = incidentLog.entries;
const ids = entries.map((entry) => entry.id);

describe("traceSteps", () => {
  it("runs symptom → root cause → fix → impact when the fix is known", () => {
    const steps = traceSteps(incidentsById["INC-01"], { includeSymptom: true });
    expect(steps.map((step) => step.kind)).toEqual(["symptom", "rootCause", "fix", "impact"]);
    expect(steps[2]?.text).toBe(incidentsById["INC-01"].fix);
  });

  it("leaves the fix out entirely while it is TODO", () => {
    for (const id of ["INC-03", "INC-04", "INC-05"] as const) {
      const steps = traceSteps(incidentsById[id], { includeSymptom: true });
      expect(steps.map((step) => step.kind)).toEqual(["symptom", "rootCause", "impact"]);
    }
  });

  it("starts at the root cause in the log, where the row shows the symptom", () => {
    expect(traceSteps(incidentsById["INC-02"], { includeSymptom: false }).map((s) => s.kind)).toEqual([
      "rootCause",
      "fix",
      "impact",
    ]);
    expect(traceSteps(incidentsById["INC-04"], { includeSymptom: false }).map((s) => s.kind)).toEqual([
      "rootCause",
      "impact",
    ]);
  });

  it("uses the content text unchanged", () => {
    const incident = incidentsById["INC-05"];
    const text = traceSteps(incident, { includeSymptom: true }).map((step) => step.text);
    expect(text).toEqual([incident.symptom, incident.rootCause, incident.impact]);
  });
});

describe("ids and tags", () => {
  it("derives every DOM id from the anchor", () => {
    expect(incidentDomIds("inc-03")).toEqual({
      entry: "inc-03",
      button: "inc-03-button",
      panel: "inc-03-details",
      heading: "inc-03-heading",
    });
  });

  it("gives every entry a unique anchor", () => {
    expect(new Set(entries.map((entry) => entry.anchor)).size).toBe(entries.length);
  });

  it("uses the amber tag for Critical only", () => {
    expect(typeTone("Critical")).toBe("incident");
    expect(entries.filter((entry) => typeTone(entry.type) === "incident").map((e) => e.id)).toEqual([
      "INC-01",
    ]);
  });
});

describe("incidentIdFromHash", () => {
  it("matches an incident anchor", () => {
    expect(incidentIdFromHash("#inc-03", entries)).toBe("INC-03");
    expect(incidentIdFromHash("inc-05", entries)).toBe("INC-05");
  });

  it("ignores empty, unknown and differently cased fragments", () => {
    expect(incidentIdFromHash("", entries)).toBeNull();
    expect(incidentIdFromHash("#", entries)).toBeNull();
    expect(incidentIdFromHash("#incidents", entries)).toBeNull();
    expect(incidentIdFromHash("#INC-03", entries)).toBeNull();
  });

  it("decodes percent-encoding and survives malformed input", () => {
    expect(incidentIdFromHash("#inc%2D02", entries)).toBe("INC-02");
    expect(incidentIdFromHash("#%E0%A4%A", entries)).toBeNull();
  });
});

describe("samePageHash", () => {
  const here = "https://example.com/?x=1#work";

  it("returns the fragment of a link to this page", () => {
    expect(samePageHash("https://example.com/?x=1#inc-03", here)).toBe("#inc-03");
    expect(samePageHash("#inc-02", "https://example.com/")).toBe("#inc-02");
    expect(samePageHash("/#inc-04", "https://example.com/")).toBe("#inc-04");
  });

  it("ignores other pages, other origins and links without a fragment", () => {
    expect(samePageHash("https://example.com/work/uchatbots#inc-03", here)).toBeNull();
    expect(samePageHash("https://other.example/?x=1#inc-03", here)).toBeNull();
    expect(samePageHash("https://example.com/?x=1", here)).toBeNull();
    expect(samePageHash("/?x=2#inc-03", here)).toBeNull();
  });
});

describe("disclosure state", () => {
  it("starts with only the given entries open, without animation", () => {
    const state = initialDisclosure(["INC-01"]);
    expect(ids.filter((id) => isEntryOpen(state, id))).toEqual(["INC-01"]);
    expect(state["INC-01"]?.animate).toBe(false);
  });

  it("returns the same object when nothing changes", () => {
    const state = initialDisclosure(["INC-01"]);
    expect(setEntry(state, "INC-01", true, true)).toBe(state);
    expect(setEntry(state, "INC-02", false, true)).toBe(state);
  });

  it("animates only entries that actually open", () => {
    const state = setEntry(initialDisclosure([]), "INC-02", true, true);
    expect(state["INC-02"]).toEqual({ open: true, animate: true });
    expect(setEntry(state, "INC-02", false, true)["INC-02"]).toEqual({ open: false, animate: false });
  });

  it("expands all without replaying entries that were already open", () => {
    const expanded = setAllEntries(initialDisclosure(["INC-01"]), ids, true, true);
    expect(areAllOpen(expanded, ids)).toBe(true);
    expect(expanded["INC-01"]?.animate).toBe(false);
    expect(expanded["INC-03"]?.animate).toBe(true);
  });

  it("collapses all", () => {
    const collapsed = setAllEntries(setAllEntries({}, ids, true, true), ids, false, true);
    expect(ids.some((id) => isEntryOpen(collapsed, id))).toBe(false);
    expect(areAllOpen(collapsed, ids)).toBe(false);
  });
});

describe("flipDelayMs", () => {
  it("waits 250ms, then staggers rows that arrive together", () => {
    expect(flipDelayMs(0)).toBe(FLIP_DELAY_MS);
    expect(FLIP_DELAY_MS).toBe(250);
    expect(flipDelayMs(2)).toBe(FLIP_DELAY_MS + 2 * FLIP_STAGGER_MS);
    expect(flipDelayMs(-1)).toBe(FLIP_DELAY_MS);
  });
});
