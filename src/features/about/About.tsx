import { Journey } from "./Journey";

export function About() {
  return (
    <section
      id="about"
      tabIndex={-1}
      aria-labelledby="about-heading"
      className="home-about layout-container"
    >
      <div className="about-intro">
        <header>
          <p className="eyebrow">03 / À propos</p>
          <h2 id="about-heading">Derrière les projets.</h2>
        </header>
        <div className="about-content">
          <p className="body-large">
            Je suis Mehdi Bouchard, développeur web et étudiant en première
            année de MBA développeur fullstack à MyDigitalSchool Rennes.
          </p>
          <p className="text-muted">
            Après un BTS Systèmes numériques et un Bachelor développeur web,
            j’ai obtenu le titre de Concepteur développeur d’applications en
            2026. Mes projets couvrent l’interface, la logique serveur et les
            bases de données.
          </p>
          <div className="about-approach">
            <h3>Ma manière de travailler</h3>
            <p>
              Curieux et méticuleux, je m’investis dans les projets que je
              développe. Du site public à l’interface d’administration, je
              travaille sur les différentes parties d’une application web.
            </p>
          </div>
          <a
            href="/cv/CV_Bouchard_Mehdi.pdf"
            download="CV_Bouchard_Mehdi.pdf"
            className="button button--primary"
          >
            Télécharger mon CV <span className="about-cv-format">PDF</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <Journey />
      <a href="#hero" className="text-link about-back">
        Retour en haut <span aria-hidden="true">↑</span>
      </a>
    </section>
  );
}
