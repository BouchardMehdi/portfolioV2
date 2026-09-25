import { HomeScroll } from "@/components/navigation/HomeScroll";
import { Hero } from "@/features/hero/Hero";
import { Statement } from "@/features/statement/Statement";
import { SelectedWork } from "@/features/selected-work/SelectedWork";
import { About } from "@/features/about/About";

export default function HomePage() {
  return (
    <HomeScroll>
      <Hero />
      <Statement />
      <SelectedWork />
      <About />
    </HomeScroll>
  );
}
