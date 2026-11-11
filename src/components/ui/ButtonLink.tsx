import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary";

const base =
  "inline-flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap select-none active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  // Inverted fill keeps the lime accent rare.
  primary:
    "h-11 rounded-sm bg-fg px-5 text-bg transition-opacity duration-(--dur-fast) ease-out hover:opacity-85",
  // Hairline outline; the border brightens on hover (no transition).
  secondary: "h-11 rounded-sm border border-border-strong px-5 text-fg hover:border-fg",
  // Text link with an underline that appears on hover.
  tertiary:
    "h-11 text-muted underline decoration-transparent underline-offset-4 hover:text-fg hover:decoration-current",
};

/** Class string for buttons and links that should look like buttons. */
export function buttonStyles(variant: ButtonVariant = "primary", className?: string): string {
  return cn(base, variants[variant], className);
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "children">;

/**
 * A link styled as a button. Internal routes ("/…") use next/link; in-page
 * anchors, mailto: and external URLs render a plain <a>.
 */
export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonStyles(variant, className);
  const isRoute = href.startsWith("/") && !href.endsWith(".pdf");
  if (isRoute) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
