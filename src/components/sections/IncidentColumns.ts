/**
 * Column placement for the incident log table from `lg` (1024px), on the
 * 12-column grid. Shared by the header row and every log row, so the header
 * labels always sit over their cells.
 *
 *   Status 1–2 · ID 3 · Product 4–5 · Type 6–7 · Symptom 8–12
 *
 * The trace inside an open entry reuses the same tracks: step labels in the
 * Type column, step text in the Symptom column, and the trace line in the
 * gutter between them.
 *
 * Every cell names row 1, so auto-placement can never push one to row 2.
 */
export const incidentColumns = {
  status: "lg:col-span-2 lg:col-start-1 lg:row-start-1",
  id: "lg:col-span-1 lg:col-start-3 lg:row-start-1",
  product: "lg:col-span-2 lg:col-start-4 lg:row-start-1",
  type: "lg:col-span-2 lg:col-start-6 lg:row-start-1",
  symptom: "lg:col-span-5 lg:col-start-8 lg:row-start-1",
  /** The +/− glyph shares the Symptom column's last track, inside its right padding. */
  glyph: "lg:col-start-12 lg:row-start-1",
} as const;

/** Right padding of the Symptom column that keeps text clear of the glyph. */
export const SYMPTOM_COLUMN_PAD = "lg:pr-8";
