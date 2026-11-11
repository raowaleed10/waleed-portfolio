import { HeroDiagram } from "@/components/diagram/HeroDiagram";
import { Hero } from "@/components/hero/Hero";
import { IncidentLog } from "@/components/sections/IncidentLog";
import { Metrics } from "@/components/sections/Metrics";
import { SelectedWork } from "@/components/sections/SelectedWork";

export default function Home() {
  return (
    <>
      <Hero diagram={<HeroDiagram />} />
      <Metrics />
      <SelectedWork />
      <IncidentLog />
    </>
  );
}
