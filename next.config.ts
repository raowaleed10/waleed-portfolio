import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// Résumé links render only when the PDF is present at build time.
const hasResume = existsSync(join(process.cwd(), "public", "Rao-Waleed-CV.pdf"));

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    NEXT_PUBLIC_HAS_RESUME: hasResume ? "1" : "0",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
