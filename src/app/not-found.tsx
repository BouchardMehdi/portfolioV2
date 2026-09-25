import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="layout-container page-shell home-intro"
    >
      <p className="eyebrow">404</p>
      <h1 className="mt-6">Page introuvable</h1>
      <Link href="/" className="button button--primary mt-8 w-fit">
        Revenir à l’accueil
      </Link>
    </main>
  );
}
