import { serializeJsonLd, type JsonLdNode } from "@/lib/seo";

/**
 * Structured data as a native <script type="application/ld+json"> (not
 * next/script: it's data, not code). Pass one node, or several to emit a
 * single @graph document. Server Component; the JSON is escaped so content
 * can't close the script element.
 */
export function JsonLd({ data }: { data: JsonLdNode | readonly JsonLdNode[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
