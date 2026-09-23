import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-360 flex-col justify-center px-5 py-16 sm:px-8 lg:px-16">
      <p className="text-sm">404</p>
      <h1 className="mt-6 text-4xl font-medium tracking-tight">
        Page introuvable
      </h1>
      <Link href="/" className="mt-8 w-fit underline underline-offset-4">
        Revenir à l’accueil
      </Link>
    </main>
  );
}
