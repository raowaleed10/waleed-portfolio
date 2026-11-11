import { HeroDiagram } from "@/components/diagram/HeroDiagram";
import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return <Hero diagram={<HeroDiagram />} />;
}
