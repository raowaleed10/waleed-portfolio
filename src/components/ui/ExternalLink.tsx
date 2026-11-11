import { ArrowUpRight } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A link that leaves the site. The small arrow is the only marker of an
 * external link on the site; it is decorative (aria-hidden).
 */
export function ExternalLink({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      className={cn(
        "group inline-flex items-center gap-1 underline decoration-border-strong underline-offset-4 hover:decoration-current",
        className,
      )}
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
      <ArrowUpRight
        aria-hidden
        strokeWidth={1.75}
        className="size-3.5 shrink-0 transition-transform duration-(--dur-fast) ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}
