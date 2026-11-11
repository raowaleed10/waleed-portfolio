import type { Contact } from "./types";

/** Email, LinkedIn, GitHub and résumé links come from `site`. */
export const contact = {
  heading: "Let’s build something that stays up.",
  // Non-breaking spaces keep "(5 PM – 2 AM" from splitting across lines.
  body: "I’m open to remote full-stack roles. I already work US and Canada Eastern hours from Lahore (5 PM – 2 AM Pakistan time), so your team gets a full working day of real-time overlap. Email is the fastest way to reach me.",
  links: { linkedin: "LinkedIn", github: "GitHub", resume: "Résumé" },
} as const satisfies Contact;
