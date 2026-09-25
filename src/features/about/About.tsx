export function About() {
  return (
    <section
      id="about"
      tabIndex={-1}
      aria-labelledby="about-heading"
      className="home-about layout-container"
    >
      <div>
        <p className="eyebrow">03 / À propos</p>
        <h2 id="about-heading">Derrière les projets.</h2>
      </div>
      <div className="about-content">
        <p className="body-large">Présentation personnelle à compléter.</p>
        <p className="text-muted"></p>
        <div className="about-portrait">
          <span className="eyebrow">Portrait · placeholder</span>
        </div>
        <a href="#hero" className="text-link">
          Retour en haut <span aria-hidden="true">↑</span>
        </a>
      </div>
    </section>
  );
}
