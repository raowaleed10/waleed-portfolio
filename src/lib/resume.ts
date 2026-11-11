import { site } from "@/content/site";

/**
 * Whether public/Rao-Waleed-CV.pdf exists. Decided once at build time in
 * next.config.ts, so it is safe in Server and Client Components alike.
 * Résumé links render only when this is true.
 */
export const hasResume = process.env.NEXT_PUBLIC_HAS_RESUME === "1";

export const resumeHref = site.resumeHref;
