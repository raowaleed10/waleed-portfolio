import { heroDiagram } from "@/content/diagrams";
import { heroDesktop, heroMobile } from "./layouts/hero";
import { SystemDiagram } from "./SystemDiagram";

/**
 * The hero's live architecture diagram. Two copies, switched with CSS at
 * md: the desktop layout from 768px, the vertical layout below it. The
 * hidden copy is display:none, so it is out of the tab order and the
 * accessibility tree, and its motion never starts.
 *
 * The vertical copy is capped at max-w-md: between ~480 and 767px it would
 * otherwise scale its 11–12px labels up to twice their size.
 */
export function HeroDiagram() {
  return (
    <>
      <SystemDiagram
        diagram={heroDiagram}
        layout={heroDesktop}
        interactive
        animated
        failover
        className="hidden md:block"
      />
      <SystemDiagram
        diagram={heroDiagram}
        layout={heroMobile}
        interactive
        animated
        failover
        className="max-w-md md:hidden"
      />
    </>
  );
}
