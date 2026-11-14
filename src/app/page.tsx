import { Suspense, type ReactNode } from "react";
import { HeroDiagram } from "@/components/diagram/HeroDiagram";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { IncidentLog } from "@/components/sections/IncidentLog";
import { Metrics } from "@/components/sections/Metrics";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Stack } from "@/components/sections/Stack";

/**
 * Every section sits in its own Suspense boundary. The page is fully static,
 * so the HTML always contains the content (no fallback ever shows); the
 * boundaries only let React hydrate section by section and yield to the
 * browser in between, instead of one long hydration task.
 */
function Chunk({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>;
}

export default function Home() {
  return (
    <>
      <Hero
        diagram={
          <Chunk>
            <HeroDiagram />
          </Chunk>
        }
      />
      <Chunk>
        <Metrics />
      </Chunk>
      <Chunk>
        <SelectedWork />
      </Chunk>
      <Chunk>
        <IncidentLog />
      </Chunk>
      <Chunk>
        <Experience />
      </Chunk>
      <Chunk>
        <Stack />
      </Chunk>
      <Chunk>
        <About />
      </Chunk>
      <Chunk>
        <Contact />
      </Chunk>
    </>
  );
}
