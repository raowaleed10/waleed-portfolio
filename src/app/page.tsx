import { HeroDiagram } from "@/components/diagram/HeroDiagram";
import { Hero } from "@/components/hero/Hero";
import { Metrics } from "@/components/sections/Metrics";

export default function Home() {
  return (
    <>
      <Hero diagram={<HeroDiagram />} />
      <Metrics />
    </>
  );
}
