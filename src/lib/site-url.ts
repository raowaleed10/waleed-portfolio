/**
 * Absolute site origin for metadata, sitemap, robots and JSON-LD.
 * TODO(waleed): domain name. Set NEXT_PUBLIC_SITE_URL once it exists.
 * Until then: the Vercel production URL, then localhost.
 */
function resolveSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}

export const siteUrl: URL = resolveSiteUrl();

/** Absolute URL for a site path, e.g. absoluteUrl("/work/uchatbots"). */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
