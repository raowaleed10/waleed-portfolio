import type { Diagram } from "@/content/types";
import { cn } from "@/lib/cn";
import { DiagramSvg, type DiagramVariant } from "./DiagramSvg";
import { LiveDiagram } from "./LiveDiagram";
import type { DiagramLayout } from "./types";

export interface SystemDiagramProps {
  diagram: Diagram;
  layout: DiagramLayout;
  /** "thumbnail": boxes, lines and status dots only; decorative (aria-hidden). */
  variant?: DiagramVariant;
  /** Tooltips and keyboard navigation (nodes or groups need tooltips). */
  interactive?: boolean;
  /** Draw-in, packets, and the failover cycle when `failover` is set. */
  animated?: boolean;
  /** Fail over between the two nodes in diagram.failover. */
  failover?: boolean;
  /** Sizing and visibility only; the diagram fills the width it is given. */
  className?: string;
}

/**
 * An architecture diagram from a content graph and a layout. It fills 100%
 * of its container's width; the height follows the layout's aspect ratio.
 *
 * Purely static diagrams stay Server Components (no client JS); interactive
 * or animated ones hydrate through LiveDiagram. Either way the prerendered
 * HTML holds the complete drawing.
 */
export function SystemDiagram({
  diagram,
  layout,
  variant = "full",
  interactive = false,
  animated = false,
  failover = false,
  className,
}: SystemDiagramProps) {
  if (variant === "thumbnail") {
    return <DiagramSvg diagram={diagram} layout={layout} variant="thumbnail" className={className} />;
  }

  if (interactive || animated) {
    return (
      <LiveDiagram
        diagram={diagram}
        layout={layout}
        interactive={interactive}
        animated={animated}
        failover={failover}
        className={className}
      />
    );
  }

  return (
    <figure className={cn("relative", className)}>
      <figcaption className="sr-only">{diagram.title}</figcaption>
      <DiagramSvg diagram={diagram} layout={layout} failover={failover} />
    </figure>
  );
}
