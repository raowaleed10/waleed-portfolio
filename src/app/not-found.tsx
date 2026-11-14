import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ui } from "@/content/ui";

// "This page doesn’t exist. — Rao Waleed" through the root title template.
// Next.js adds noindex to 404 responses itself.
export const metadata: Metadata = { title: ui.notFound.message };

/**
 * The site's 404, for unmatched URLs and unknown case-study slugs. Static
 * server markup with no client code: Next.js ships the root not-found with
 * every route. It starts on the hero's line (same top padding) and offers
 * one way on: back to the homepage.
 */
export default function NotFound() {
  return (
    <Container className="pt-12 pb-(--section-pad) md:pt-20 xl:pt-24">
      <h1 className="max-w-[12em] text-3xl font-medium text-balance">{ui.notFound.message}</h1>
      <ButtonLink href="/" className="mt-10 md:mt-12">
        {ui.notFound.home}
      </ButtonLink>
    </Container>
  );
}
