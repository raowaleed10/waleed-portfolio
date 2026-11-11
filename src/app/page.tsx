import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container, GRID } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { about, hero, incidents, sections, site, ui } from "@/content";

// Temporary design-token preview. Replaced by the homepage in Phase 2.

const swatches = [
  ["bg", "bg-bg", "#0A0B0D", "#F5F3EE"],
  ["surface", "bg-surface", "#111317", "#FBFAF7"],
  ["surface-raised", "bg-raised", "#171A1F", "#FFFFFF"],
  ["border", "bg-border", "#1F2329", "#DDD8CE"],
  ["border-strong", "bg-border-strong", "#2E333B", "#C9C3B7"],
  ["graphic", "bg-graphic", "#6B7079", "#7D786E"],
  ["muted", "bg-muted", "#8B8F98", "#5C6068"],
  ["fg", "bg-fg", "#ECE8E1", "#16171A"],
  ["signal", "bg-signal", "#C8F04A", "#557A00"],
  ["incident", "bg-incident", "#FFB020", "#A35F00"],
] as const;

const typeScale = [
  ["display", "text-display"],
  ["3xl", "text-3xl"],
  ["2xl", "text-2xl"],
  ["xl", "text-xl"],
  ["lg", "text-lg"],
  ["base", "text-base"],
  ["sm", "text-sm"],
  ["xs", "text-xs"],
] as const;

export default function TokenPreview() {
  return (
    <div className="pb-32">
      <Container className="pt-16">
        <p className="label text-muted">{hero.eyebrow}</p>
        <h1 className="mt-6 max-w-[18ch] text-display">
          {hero.headline.before}
          <em className="font-serif font-normal tracking-normal">{hero.headline.emphasis}</em>
          {hero.headline.after}
        </h1>
        <p className="measure mt-8 text-lg text-muted">{hero.subheadline}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ButtonLink>
          <ButtonLink href={hero.secondaryCta.href} variant="secondary">
            {hero.secondaryCta.label}
          </ButtonLink>
          <ButtonLink href={site.resumeHref} variant="tertiary">
            {hero.resumeLabel}
          </ButtonLink>
        </div>
        <p className="mt-10 flex items-center gap-3 font-mono text-sm text-muted">
          <StatusDot pulse />
          {hero.status}
        </p>
      </Container>

      <Container className="mt-24 border-t border-border pt-10">
        <SectionLabel meta={sections.work} />
        <div className={`${GRID} mt-10 gap-y-3`}>
          {swatches.map(([name, cls, dark, light]) => (
            <div key={name} className="flex items-center gap-4 md:col-span-6 lg:col-span-4">
              <span className={`size-10 shrink-0 rounded-sm border border-border ${cls}`} />
              <span className="font-mono text-xs">
                <span className="block text-fg">--{name}</span>
                <span className="text-muted">
                  {dark} / {light}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-24 border-t border-border pt-10">
        <SectionLabel meta={sections.incidents} />
        <div className="mt-10 space-y-6">
          {typeScale.map(([name, cls]) => (
            <div key={name} className={`${GRID} items-baseline`}>
              <span className="label text-muted md:col-span-2">{name}</span>
              <p className={`${cls} md:col-span-10`}>{incidents[0].rootCause}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-24 border-t border-border pt-10">
        <SectionLabel meta={sections.about} />
        <div className={`${GRID} mt-10 gap-y-10`}>
          <p className="measure md:col-span-7">{about.paragraphs[0]}</p>
          <div className="space-y-6 md:col-span-5">
            <div className="flex flex-wrap items-center gap-3">
              <Tag>{incidents[0].id}</Tag>
              <Tag tone="incident">{incidents[0].type}</Tag>
              <Tag tone="signal">{ui.incidents.resolved}</Tag>
            </div>
            <div className="flex items-center gap-6 font-mono text-xs text-muted">
              <span className="flex items-center gap-2">
                <StatusDot /> signal
              </span>
              <span className="flex items-center gap-2">
                <StatusDot tone="incident" /> incident
              </span>
              <span className="flex items-center gap-2">
                <StatusDot tone="muted" /> muted
              </span>
            </div>
            <div className="flex gap-3">
              <span className="block size-12 rounded-xs border border-border-strong" />
              <span className="block size-12 rounded-sm border border-border-strong" />
              <span className="block size-12 rounded-md border border-border-strong" />
              <span className="block size-12 rounded-full border border-border-strong" />
            </div>
            <ExternalLink href={site.github}>GitHub</ExternalLink>
          </div>
        </div>
      </Container>
    </div>
  );
}
