import { HeroDiagram } from "@/components/diagram/HeroDiagram";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { IncidentLog } from "@/components/sections/IncidentLog";
import { Metrics } from "@/components/sections/Metrics";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Stack } from "@/components/sections/Stack";

export default function Home() {
  return (
    <>
      <Hero diagram={<HeroDiagram />} />
      <Metrics />
      <SelectedWork />
      <IncidentLog />
      <Experience />
      <Stack />
      <About />
      <Contact />
    </>
  );
}
