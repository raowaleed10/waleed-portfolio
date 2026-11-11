import { Fragment } from "react";

const SEPARATOR = " · ";

/**
 * Copy joined with " · " (the eyebrow, the status line). Each part is an
 * inline-block, so a narrow screen breaks the line between parts instead of
 * inside one, and the dot stays at the end of the line it closes. A part
 * wider than the line still wraps inside itself. The text content is unchanged.
 */
export function SeparatedText({ text }: { text: string }) {
  const parts = text.split(SEPARATOR);
  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? " " : null}
      <span className="inline-block">{index < parts.length - 1 ? `${part} ·` : part}</span>
    </Fragment>
  ));
}

/**
 * Keeps hyphenated words ("multi-tenant,", "AI-powered") on one line. Browsers
 * may break after a hyphen, which splits a compound across two lines of a
 * display headline.
 */
export function KeepHyphenated({ text }: { text: string }) {
  return text.split(/(\S+-\S+)/).map((chunk, index) =>
    index % 2 === 1 ? (
      <span key={index} className="whitespace-nowrap">
        {chunk}
      </span>
    ) : (
      chunk
    ),
  );
}
