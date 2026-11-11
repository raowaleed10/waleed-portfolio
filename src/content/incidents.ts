import type { Incident, IncidentId, IncidentLog } from "./types";

export const incidents = [
  {
    id: "INC-01",
    anchor: "inc-01",
    product: "Accountabuddy",
    projectSlug: "accountabuddy",
    type: "Critical",
    symptom: "100% of live sessions dropped five seconds after connecting.",
    rootCause:
      "Not application logic. The fixed five-second interval traced back to an unconfigured Redis socket timeout in channels_redis.",
    fix: "Configured the channels_redis socket timeout correctly.",
    impact: "Core live-session feature restored.",
  },
  {
    id: "INC-02",
    anchor: "inc-02",
    product: "Accountabuddy",
    projectSlug: "accountabuddy",
    type: "Billing",
    symptom: "Paying subscribers across 3 Stripe tiers were being silently double-charged.",
    rootCause:
      "A webhook parsing bug, plus event handling that wasn’t idempotent against Stripe’s retries.",
    fix: "Fixed the parsing and made webhook event handling idempotent.",
    impact: "Double-charges ended for live subscribers.",
  },
  {
    id: "INC-03",
    anchor: "inc-03",
    product: "UChatbots",
    projectSlug: "uchatbots",
    type: "Data integrity",
    symptom: "Users’ saved flows were getting corrupted.",
    // TODO(waleed): one line on what created the ghost edges.
    rootCause: "A “ghost edge” bug in the flow data.",
    // TODO(waleed): one line on the fix.
    impact: "Saved flows working again in production.",
  },
  {
    id: "INC-04",
    anchor: "inc-04",
    product: "UChatbots",
    projectSlug: "uchatbots",
    type: "Billing",
    symptom: "New sign-ups were landing with zero credits.",
    rootCause: "A race condition between the OAuth sign-up flow and billing.",
    // TODO(waleed): one line on the fix.
    impact: "Sign-up path recovered.",
  },
  {
    id: "INC-05",
    anchor: "inc-05",
    product: "ExcevoAI",
    projectSlug: "excevoai",
    type: "Integrations",
    symptom: "A tenant’s Shopify orders stopped being captured after their store was renamed.",
    rootCause:
      "Webhook routing broke after the rename; traced it against Shopify’s canonical domain API.",
    // TODO(waleed): one line on the fix.
    impact: "Order capture restored for the affected tenant.",
  },
] as const satisfies readonly Incident[];

export const incidentLog = {
  intro:
    "Production doesn’t fail politely. A few incidents I’ve root-caused on live systems — symptom first, then the real cause.",
  entries: incidents,
} as const satisfies IncidentLog;

export const incidentsById: Readonly<Record<IncidentId, Incident>> = Object.fromEntries(
  incidents.map((incident) => [incident.id, incident]),
) as Record<IncidentId, Incident>;
