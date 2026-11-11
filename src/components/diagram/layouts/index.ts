import type { DiagramId } from "@/content/types";
import type { DiagramLayouts } from "../types";
import { accountabuddyDesktop, accountabuddyMobile } from "./accountabuddy";
import { excevoaiDesktop, excevoaiMobile } from "./excevoai";
import { heroDesktop, heroMobile } from "./hero";
import { uchatbotsDesktop, uchatbotsMobile } from "./uchatbots";

/** Every diagram's layouts, keyed like `diagrams` in src/content/diagrams.ts. */
export const diagramLayouts = {
  hero: { desktop: heroDesktop, mobile: heroMobile },
  uchatbots: { desktop: uchatbotsDesktop, mobile: uchatbotsMobile },
  excevoai: { desktop: excevoaiDesktop, mobile: excevoaiMobile },
  accountabuddy: { desktop: accountabuddyDesktop, mobile: accountabuddyMobile },
} as const satisfies Record<DiagramId, DiagramLayouts>;
