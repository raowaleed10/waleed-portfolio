import { hero } from "@/content/hero";
import { site } from "@/content/site";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

// Site-wide share image. Prerendered at build (fonts come from a `use cache`
// scope in lib/og), and inherited by every route without its own image.
export const alt = site.title;
export const size = ogSize;
export const contentType = ogContentType;

const { before, emphasis, after } = hero.headline;

export default function Image() {
  return renderOgImage({
    eyebrow: hero.eyebrow,
    title: `${before}${emphasis}${after}`,
    emphasis,
    subtitle: site.name,
  });
}
