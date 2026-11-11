import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Page-width wrapper: max 1360px, responsive gutters (20 / 32 / 48px).
 * For the 12-column grid inside it, use the GRID class below.
 */
export function Container<T extends ElementType = "div">({
  as,
  className,
  ...rest
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn("mx-auto w-full max-w-(--container-max) px-(--gutter)", className)} {...rest} />
  );
}

/**
 * The 12-column layout grid (the `grid-12` utility in globals.css): 16px column
 * gap on phones, 24px from 768px. Children span all 12 columns by default;
 * narrow them with `md:col-span-*` / `lg:col-span-*`.
 */
export const GRID = "grid-12";
