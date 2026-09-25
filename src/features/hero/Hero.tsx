export function Hero() {
  return (
    <section
      id="hero"
      tabIndex={-1}
      aria-labelledby="hero-heading"
      className="home-hero layout-container"
    >
      <div className="hero-copy">
        <p className="eyebrow">Portfolio — Développeur full-stack</p>
        <h1 id="hero-heading" className="home-title">
          <span>Mehdi</span>
          <span>Bouchard</span>
        </h1>
        <div className="hero-summary">
          <p className="body-large">De l’interface à l’infrastructure.</p>
          <a href="#selected-work" className="button button--primary">
            Voir les projets <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <div className="hero-volume" aria-hidden="true">
        <span>Volume 3D · placeholder</span>
        <div />
      </div>
      <a href="#statement" className="text-link hero-explore">
        Explorer <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
