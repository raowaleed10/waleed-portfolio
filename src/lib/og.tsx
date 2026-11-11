import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";

/*
 * Shared Open Graph image template (1200×630) for app/opengraph-image.tsx and
 * app/work/[slug]/opengraph-image.tsx.
 *
 * Fonts are fetched from Google Fonts inside a `use cache` scope: under Cache
 * Components an uncached fetch in an image route would stop it prerendering.
 * If a font can't be fetched (offline build), that face is skipped; if none
 * load, next/og's built-in Geist Regular is used. The build never fails on it.
 */

export const ogSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png";

/* -------------------------------------------------------------- tokens */

/** Dark-theme values from src/styles/tokens.css (satori can't read CSS variables). */
const color = {
  bg: "#0A0B0D",
  borderStrong: "#2E333B",
  fg: "#ECE8E1",
  muted: "#8B8F98",
  signal: "#C8F04A",
  signalHalo: "rgba(200, 240, 74, 0.16)",
} as const;

const family = {
  sans: "Geist",
  mono: "Geist Mono",
  serif: "Instrument Serif",
} as const;

/* --------------------------------------------------------------- fonts */

type FontWeight = 400 | 500;
type FontStyle = "normal" | "italic";

export interface OgFontSpec {
  readonly family: string;
  readonly weight: FontWeight;
  readonly style: FontStyle;
}

export interface OgFont {
  readonly name: string;
  readonly data: ArrayBuffer;
  readonly weight: FontWeight;
  readonly style: FontStyle;
}

/**
 * Only the faces the template draws: Geist 500 (the site's display weight,
 * for title and subtitle), Geist Mono 400 (eyebrow) and Instrument Serif
 * italic (the emphasized word).
 */
const OG_FONTS: readonly OgFontSpec[] = [
  { family: family.sans, weight: 500, style: "normal" },
  { family: family.mono, weight: 400, style: "normal" },
  { family: family.serif, weight: 400, style: "italic" },
];

const FONT_TIMEOUT_MS = 10_000;

/** Google Fonts CSS2 URL for one face. */
export function googleFontCssUrl({ family: name, weight, style }: OgFontSpec): string {
  const axes = style === "italic" ? `ital,wght@1,${weight}` : `wght@${weight}`;
  return `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:${axes}`;
}

/**
 * The first TrueType/OpenType source in a Google Fonts stylesheet. Satori
 * reads TTF/OTF/WOFF but not WOFF2; Google serves TTF to non-browser clients.
 */
export function parseFontUrl(css: string): string | null {
  const match = /src:\s*url\(\s*['"]?([^'")\s]+)['"]?\s*\)\s*format\(\s*['"](?:truetype|opentype)['"]\s*\)/.exec(css);
  return match ? match[1] : null;
}

/** Fetches one face's TTF. Throws on any network or format problem. */
export async function fetchGoogleFont(spec: OgFontSpec): Promise<ArrayBuffer> {
  const signal = AbortSignal.timeout(FONT_TIMEOUT_MS);
  const css = await fetch(googleFontCssUrl(spec), { signal });
  if (!css.ok) throw new Error(`stylesheet responded ${css.status}`);
  const url = parseFontUrl(await css.text());
  if (!url) throw new Error("stylesheet has no TrueType/OpenType source");
  const font = await fetch(url, { signal });
  if (!font.ok) throw new Error(`font file responded ${font.status}`);
  return font.arrayBuffer();
}

/**
 * One cache entry per face, shared by every OG image in the build
 * (cacheLife "max"; the key includes the build ID, so each build fetches
 * afresh). A failed fetch caches `null`, so an offline build warns once per
 * face instead of retrying for every image.
 */
async function loadFont(name: string, weight: FontWeight, style: FontStyle) {
  "use cache";
  cacheLife("max");
  try {
    return await fetchGoogleFont({ family: name, weight, style });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(
      `[og] Couldn't load ${name} ${weight} ${style} from Google Fonts (${reason}). Using the built-in font instead.`,
    );
    return null;
  }
}

/** Every face that loaded. Empty when Google Fonts is unreachable. */
export async function loadOgFonts(): Promise<OgFont[]> {
  const faces = await Promise.all(
    OG_FONTS.map(async (spec): Promise<OgFont | null> => {
      const data = await loadFont(spec.family, spec.weight, spec.style);
      return data ? { name: spec.family, data, weight: spec.weight, style: spec.style } : null;
    }),
  );
  return faces.filter((face): face is OgFont => face !== null);
}

/* ------------------------------------------------------------ template */

export interface OgImageProps {
  /** Mono label beside the status dot, uppercased ("01 / Selected work"). */
  readonly eyebrow: string;
  /** The headline. Its size steps down as it gets longer. */
  readonly title: string;
  /** Muted line under the hairline at the bottom (a byline or one-liner). */
  readonly subtitle?: string;
  /** A word or phrase inside `title` set in Instrument Serif italic. */
  readonly emphasis?: string;
}

export interface OgTextRun {
  readonly text: string;
  readonly emphasis: boolean;
}

/**
 * Splits text into words, each a list of runs, marking the runs inside
 * `emphasis`. A word can mix runs: "running." → [running (emphasis), "."].
 * Whitespace only separates words; it is not kept.
 */
export function splitWords(text: string, emphasis?: string): OgTextRun[][] {
  const at = emphasis ? text.indexOf(emphasis) : -1;
  const runs: OgTextRun[] =
    emphasis && at >= 0
      ? [
          { text: text.slice(0, at), emphasis: false },
          { text: emphasis, emphasis: true },
          { text: text.slice(at + emphasis.length), emphasis: false },
        ]
      : [{ text, emphasis: false }];

  const words: OgTextRun[][] = [];
  let word: OgTextRun[] = [];
  for (const run of runs) {
    for (const part of run.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        if (word.length) words.push(word);
        word = [];
      } else {
        word.push({ text: part, emphasis: run.emphasis });
      }
    }
  }
  if (word.length) words.push(word);
  return words;
}

const PAD_X = 80;
const PAD_Y = 72;
const CONTENT_WIDTH = ogSize.width - 2 * PAD_X;
const EYEBROW_SIZE = 22;
const SUBTITLE_SIZE = 32;
const TITLE_MAX = 136;
const TITLE_MIN = 76;

/**
 * Title size: a short name as large as one line allows (up to 136px); a
 * headline that has to wrap anyway stays at 76px. Geist 500 at display
 * tracking averages a little under 0.56em per character.
 */
export function titleFontSize(title: string): number {
  const fitsOneLine = Math.floor(CONTENT_WIDTH / (Math.max(title.length, 1) * 0.56));
  return Math.min(TITLE_MAX, Math.max(TITLE_MIN, fitsOneLine));
}

const graphemeSegmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

function graphemes(text: string): string[] {
  return Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);
}

/**
 * Wrapping text with even word spacing.
 *
 * Satori measures a word glyph by glyph without kerning but draws it as one
 * kerned run, so every kerned word ("Multi-tenant", "coworking") leaves a
 * wider gap after it. Giving each grapheme its own node keeps measuring and
 * drawing in step: no kerning, but uniform spacing. Each word is a flex item
 * (that is also how mixed fonts wrap, since satori has no inline formatting)
 * and carries its trailing space, so a line never starts with one.
 */
function Words({
  text,
  emphasis,
  emphasisStyle,
  style,
}: {
  text: string;
  emphasis?: string;
  emphasisStyle?: CSSProperties;
  style?: CSSProperties;
}) {
  const words = splitWords(text, emphasis);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", ...style }}>
      {words.map((runs, index) => (
        <div key={index} style={{ display: "flex", alignItems: "baseline" }}>
          {runs.map((run, runIndex) => (
            <div
              key={runIndex}
              style={{
                display: "flex",
                alignItems: "baseline",
                ...(run.emphasis ? emphasisStyle : undefined),
              }}
            >
              {graphemes(run.text).map((grapheme, graphemeIndex) => (
                <span key={graphemeIndex}>{grapheme}</span>
              ))}
            </div>
          ))}
          {index < words.length - 1 ? <span style={{ whiteSpace: "pre" }}> </span> : null}
        </div>
      ))}
    </div>
  );
}

function StatusDot() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: color.signalHalo,
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color.signal }} />
    </div>
  );
}

function Title({ title, emphasis }: { title: string; emphasis?: string }) {
  const size = titleFontSize(title);
  return (
    <Words
      text={title}
      emphasis={emphasis}
      style={{
        fontFamily: family.sans,
        fontWeight: 500,
        fontSize: size,
        lineHeight: `${Math.round(size * 1.04)}px`,
        // Display tracking from the site's type scale.
        letterSpacing: -0.035 * size,
        color: color.fg,
      }}
      // Same treatment as the hero: 1.04em lines Instrument Serif's x-height
      // up with Geist's, and the serif keeps normal tracking.
      emphasisStyle={{
        fontFamily: family.serif,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: Math.round(size * 1.04),
        letterSpacing: 0,
      }}
    />
  );
}

/** The image itself. Pure: no fonts, no I/O. */
export function OgImage({ eyebrow, title, subtitle, emphasis }: OgImageProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: `${PAD_Y}px ${PAD_X}px`,
        backgroundColor: color.bg,
        color: color.fg,
        fontFamily: family.sans,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <StatusDot />
        {/* Mono label, uppercased like the site's section labels. */}
        <Words
          text={eyebrow}
          style={{
            flex: 1,
            fontFamily: family.mono,
            fontWeight: 400,
            fontSize: EYEBROW_SIZE,
            letterSpacing: 0.08 * EYEBROW_SIZE,
            textTransform: "uppercase",
            color: color.muted,
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Title title={title} emphasis={emphasis} />
        {subtitle ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
            <div style={{ height: 1, backgroundColor: color.borderStrong }} />
            <Words
              text={subtitle}
              style={{
                marginTop: 28,
                fontFamily: family.sans,
                fontWeight: 500,
                fontSize: SUBTITLE_SIZE,
                lineHeight: `${Math.round(SUBTITLE_SIZE * 1.3)}px`,
                color: color.muted,
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Renders the shared template. Use as the default export of an
 * opengraph-image.tsx, next to `export const size = ogSize` and
 * `export const contentType = ogContentType`.
 */
export async function renderOgImage(props: OgImageProps): Promise<ImageResponse> {
  const fonts = await loadOgFonts();
  return new ImageResponse(<OgImage {...props} />, {
    ...ogSize,
    // No faces at all (offline): let next/og fall back to its built-in Geist Regular.
    fonts: fonts.length ? fonts : undefined,
  });
}
