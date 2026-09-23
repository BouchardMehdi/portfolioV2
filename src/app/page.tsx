import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-360 flex-col justify-center px-5 py-16 sm:px-8 lg:px-16">
      <p className="text-sm tracking-widest uppercase">Portfolio</p>
      <h1 className="mt-6 text-5xl leading-tight font-medium tracking-tight sm:text-7xl">
        Mehdi Bouchard
      </h1>
      <p className="mt-8 max-w-xl text-lg text-muted">
        Le nouveau portfolio est en préparation.
      </p>
      <Link
        href="/projects"
        className="mt-12 w-fit underline underline-offset-4"
      >
        Projets <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
