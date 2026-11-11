/** Interface wording from the "UI labels" section of content.md. */
export const ui = {
  nav: {
    resume: "Résumé",
    menuOpen: "Menu",
    menuClose: "Close",
    skipToContent: "Skip to content",
  },
  theme: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  work: {
    readCaseStudy: "Read case study",
    liveProduct: "Live product",
  },
  caseStudy: {
    context: "Context",
    built: "What I built",
    hardProblems: "Hard problems",
    outcome: "Outcome",
    stack: "Stack",
    previous: "Previous case study",
    next: "Next case study",
  },
  incidents: {
    columns: {
      status: "Status",
      id: "ID",
      product: "Product",
      type: "Type",
      symptom: "Symptom",
    },
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    steps: {
      symptom: "Symptom",
      rootCause: "Root cause",
      fix: "Fix",
      impact: "Impact",
    },
    resolved: "Resolved",
  },
  diagram: {
    name: "Architecture diagram",
    degraded: "degraded",
    recovered: "recovered",
  },
  contact: {
    copyEmail: "Copy email",
    copied: "Copied",
  },
  notFound: {
    message: "This page doesn’t exist.",
    home: "Back to the homepage",
  },
} as const;
