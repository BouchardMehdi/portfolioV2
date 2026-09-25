import { getImageProps } from "next/image";
import { getFeaturedProjects, getProjectMediaPath } from "@/lib/projects";
import { HomeScroll } from "@/components/navigation/HomeScroll";
import { Hero } from "@/features/hero/Hero";
import { Statement } from "@/features/statement/Statement";
import { SelectedWork } from "@/features/selected-work/SelectedWork";
import { About } from "@/features/about/About";

export default function HomePage() {
  const visuals = getFeaturedProjects().map((project) => {
    const aspect = project.media.coverSize
      ? project.media.coverSize.width / project.media.coverSize.height
      : 1.6;
    const { props } = getImageProps({
      src: getProjectMediaPath(project, project.media.cover),
      alt: project.name,
      width: 600,
      height: Math.round(600 / aspect),
    });
    return {
      slug: project.slug,
      texture: props.src,
      aspect,
      accent: project.accent,
    };
  });
  return (
    <HomeScroll projects={visuals}>
      <Hero />
      <Statement />
      <SelectedWork />
      <About />
    </HomeScroll>
  );
}
