import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="layout-container site-footer__content">
        <p>
          Mehdi Bouchard <span>— Développeur full-stack</span>
        </p>
        <Link href="/#hero" className="text-link">
          Retour à l’accueil <span aria-hidden="true">↑</span>
        </Link>
      </div>
    </footer>
  );
}
