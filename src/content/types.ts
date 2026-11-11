/**
 * Content types. Every string rendered on the site comes from `src/content/*`,
 * which mirrors `docs/content.md` (the source of truth). Fields that are still
 * `TODO(waleed)` in content.md are optional here and simply absent.
 */

export type SectionId =
  | "work"
  | "incidents"
  | "experience"
  | "stack"
  | "about"
  | "contact";

export type CaseStudySlug = "uchatbots" | "excevoai" | "accountabuddy";
export type DiagramId = "hero" | CaseStudySlug;
export type IncidentId = "INC-01" | "INC-02" | "INC-03" | "INC-04" | "INC-05";

export interface Link {
  readonly label: string;
  readonly href: string;
}

/* ------------------------------------------------------------------ site */

export interface SiteMeta {
  readonly name: string;
  readonly role: string;
  readonly location: string;
  readonly availability: string;
  readonly email: string;
  readonly linkedin: string;
  readonly github: string;
  readonly sourceRepo: string;
  /** Public path of the résumé PDF. Rendered only when the file exists (see lib/resume.ts). */
  readonly resumeHref: string;
  readonly title: string;
  readonly description: string;
}

export interface SectionMeta {
  readonly id: SectionId;
  /** "01" … "06" */
  readonly index: string;
  /** Section label, content.md casing ("Selected work"). Uppercased by CSS. */
  readonly label: string;
  /** Short label for the nav ("Work"). */
  readonly navLabel: string;
}

export interface Footer {
  readonly copyright: string;
  readonly builtWith: string;
  readonly source: Link;
}

/* ------------------------------------------------------------------ hero */

export interface Hero {
  readonly eyebrow: string;
  /** Headline split around the one italic serif word. */
  readonly headline: {
    readonly before: string;
    readonly emphasis: string;
    readonly after: string;
  };
  readonly subheadline: string;
  readonly primaryCta: Link;
  readonly secondaryCta: Link;
  /** Label only; the href is site.resumeHref and it renders only if the PDF exists. */
  readonly resumeLabel: string;
  readonly status: string;
}

export interface ClockZone {
  readonly label: string;
  readonly timeZone: string;
  /** Short zone name shown next to times ("PKT", "ET"). */
  readonly abbr: string;
}

export interface Clock {
  readonly home: ClockZone;
  readonly remote: ClockZone;
  /** Working window in home-zone wall-clock hours (24h). May wrap past midnight. */
  readonly window: { readonly startHour: number; readonly endHour: number };
  readonly online: string;
  /** Contains `{time}`, replaced with the next start time in the remote zone, e.g. "7 AM". */
  readonly offline: string;
}

/* --------------------------------------------------------------- metrics */

export interface Metric {
  readonly value: number;
  readonly suffix?: string;
  readonly label: string;
}

/* -------------------------------------------------------------- diagrams */

export interface DiagramNode {
  readonly id: string;
  readonly label: string;
  readonly sublabel?: string;
  /** One-line tooltip; only the hero diagram has tooltips. */
  readonly tooltip?: string;
  /** Id of a DiagramGroup this node sits inside. */
  readonly group?: string;
}

export interface DiagramGroup {
  readonly id: string;
  readonly label: string;
  /** Shared tooltip for every node in the group. */
  readonly tooltip?: string;
}

export interface DiagramEdge {
  readonly from: string;
  readonly to: string;
  /** Short label on the edge, e.g. "credits". */
  readonly label?: string;
  readonly bidirectional?: boolean;
}

export interface Diagram {
  readonly id: DiagramId;
  /** Accessible description of what the diagram shows. */
  readonly title: string;
  readonly nodes: readonly DiagramNode[];
  readonly groups?: readonly DiagramGroup[];
  readonly edges: readonly DiagramEdge[];
  /** Two node ids that take turns failing over to each other. */
  readonly failover?: readonly [string, string];
}

/* -------------------------------------------------------------- projects */

export interface CaseStudy {
  readonly slug: CaseStudySlug;
  readonly name: string;
  readonly oneLiner: string;
  readonly company: string;
  readonly status: string;
  readonly liveUrl: string;
  readonly stack: readonly string[];
  readonly cardSummary: string;
  readonly context: string;
  readonly built: readonly string[];
  readonly incidents: readonly IncidentId[];
  readonly outcome: string;
  readonly diagram: DiagramId;
}

export interface SmallProject {
  readonly name: string;
  readonly oneLiner: string;
  readonly company: string;
  readonly stack: readonly string[];
  readonly summary: string;
  readonly also: string;
  readonly url?: string;
}

export interface SelectedWork {
  readonly intro: string;
  readonly featured: readonly CaseStudy[];
  readonly small: SmallProject;
}

/* ------------------------------------------------------------- incidents */

export interface Incident {
  readonly id: IncidentId;
  /** DOM id / URL fragment, e.g. "inc-01". */
  readonly anchor: string;
  readonly product: string;
  readonly projectSlug: CaseStudySlug;
  /** Shown under the "Type" column header. */
  readonly type: string;
  readonly symptom: string;
  readonly rootCause: string;
  readonly fix?: string;
  readonly impact: string;
}

export interface IncidentLog {
  readonly intro: string;
  readonly entries: readonly Incident[];
}

/* ------------------------------------------------------------ experience */

export interface MonthYear {
  readonly label: string;
  /** ISO year-month for <time dateTime>, e.g. "2026-02". */
  readonly iso: string;
}

export interface Role {
  readonly title: string;
  readonly org: string;
  readonly place: string;
  readonly start: MonthYear;
  /** Absent means "Present". */
  readonly end?: MonthYear;
  readonly bullets: readonly string[];
}

/* ----------------------------------------------------------------- stack */

export interface StackGroup {
  readonly category: string;
  readonly items: readonly string[];
}

export interface Stack {
  readonly intro: string;
  readonly groups: readonly StackGroup[];
}

/* ----------------------------------------------------------------- about */

export interface Credential {
  readonly title: string;
  readonly org: string;
  readonly detail: string;
}

export interface About {
  readonly paragraphs: readonly string[];
  readonly educationHeading: string;
  readonly education: readonly Credential[];
}

/* --------------------------------------------------------------- contact */

export interface Contact {
  readonly heading: string;
  readonly body: string;
  /** Link labels from content.md's Contact → Links; hrefs come from `site`. */
  readonly links: {
    readonly linkedin: string;
    readonly github: string;
    readonly resume: string;
  };
}
