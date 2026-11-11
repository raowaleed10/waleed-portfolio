import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Everything is public. No `host`: it's a deprecated, Yandex-only directive,
// and until the domain exists (TODO(waleed)) it could advertise localhost.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
