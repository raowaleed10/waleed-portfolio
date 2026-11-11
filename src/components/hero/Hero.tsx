import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container, GRID } from "@/components/ui/Container";
import { hero } from "@/content/hero";
import { cn } from "@/lib/cn";
import { hasResume, resumeHref } from "@/lib/resume";
import { StatusBar } from "./StatusBar";
import { KeepHyphenated, SeparatedText } from "./text";

const HEADING_ID = "hero-heading";

/**
 * The homepage hero: eyebrow, the page's only <h1>, subheadline, CTAs, the
 * status bar with the live clocks, and a slot for the architecture diagram.
 *
 * Nothing here animates in: the <h1> is the LCP element and paints with the
 * first frame. The diagram is the one bold element; everything else stays calm.
 *
 * DOM order (and focus order) is always text → status bar → diagram.
 * - < xl: that order, top to bottom; the diagram is capped at max-w-2xl.
 * - xl:   text in columns 1–7 and the diagram in 8–12 share the first row
 *         (placed with grid lines, not `order`); the status bar spans the
 *         full width below both.
 */
export function Hero({ diagram }: { diagram?: ReactNode }) {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="pt-12 pb-16 md:pt-20 md:pb-20 xl:pt-24 xl:pb-24"
    >
      <Container className={cn(GRID, "gap-y-12 md:gap-y-16")}>
        <div className="xl:col-span-7 xl:row-start-1">
          <p className="label text-muted">
            <SeparatedText text={hero.eyebrow} />
          </p>

          {/* max-w-[10em] holds the same four-line shape at every width; at xl
              the 7-column track is narrower still and takes over. */}
          <h1 id={HEADING_ID} className="mt-6 max-w-[10em] text-display text-balance">
            <KeepHyphenated text={hero.headline.before} />
            {/* Instrument Serif's x-height is 0.51em and Geist's 0.53em, so
                1.04em lines the two up. Line-height 0 stops the larger glyphs
                from opening up that one line; display tracking is too tight
                for the serif, so it goes back to normal. */}
            <em className="font-serif text-[1.04em] leading-[0] font-normal tracking-normal">
              {hero.headline.emphasis}
            </em>
            <KeepHyphenated text={hero.headline.after} />
          </h1>

          <p className="measure mt-6 text-lg text-pretty text-muted md:mt-8">{hero.subheadline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
            <ButtonLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="secondary">
              {hero.secondaryCta.label}
            </ButtonLink>
            {hasResume ? (
              <ButtonLink href={resumeHref} variant="tertiary" download className="sm:ml-3">
                {hero.resumeLabel}
              </ButtonLink>
            ) : null}
          </div>
        </div>

        <StatusBar className="xl:row-start-2" />

        {diagram ? (
          // xl:mt-10 = the eyebrow's line (16px) + the h1's mt-6 (24px), so the
          // diagram's top edge lines up with the headline's.
          <div className="max-w-2xl min-w-0 xl:col-span-5 xl:col-start-8 xl:row-start-1 xl:mt-10 xl:max-w-none xl:self-start">
            {diagram}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
