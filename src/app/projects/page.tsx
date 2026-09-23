import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projets",
};

export default function ProjectsPage() {
  return (
    <main className="mx-auto min-h-svh max-w-360 px-5 py-16 sm:px-8 lg:px-16">
      <Link href="/" className="underline underline-offset-4">
        <span aria-hidden="true">←</span> Accueil
      </Link>
      <h1 className="mt-16 text-5xl font-medium tracking-tight sm:text-7xl">
        Projets
      </h1>
      <p className="mt-8 max-w-xl text-lg text-muted">
        Les projets seront présentés ici.
      </p>
    </main>
  );
}
