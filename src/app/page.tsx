import Link from "next/link";

export default function HomePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="layout-container page-shell home-intro"
    >
      <p className="eyebrow">Portfolio — Développeur full-stack</p>
      <h1 className="home-title">
        <span>Mehdi</span>
        <span>Bouchard</span>
      </h1>
      <div className="home-summary">
        <p className="body-large">De l’interface à l’infrastructure.</p>
        <Link href="/projects" className="button button--primary">
          Voir les projets <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </main>
  );
}
