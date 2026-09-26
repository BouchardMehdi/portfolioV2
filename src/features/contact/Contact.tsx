import { CopyEmailButton } from "./CopyEmailButton";

const email = "bouchardmehdi35@gmail.com";

export function Contact() {
  return (
    <section
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-heading"
      className="home-contact layout-container"
    >
      <header>
        <p className="eyebrow">04 / Contact</p>
        <h2 id="contact-heading">On en parle ?</h2>
      </header>
      <div className="contact-content">
        <p className="body-large">
          Une question sur mon travail, un projet ou une opportunité à me
          proposer ? Tu peux m’écrire directement.
        </p>
        <a className="contact-email" href={`mailto:${email}`}>
          {email}
        </a>
        <CopyEmailButton email={email} />
        <nav className="contact-links" aria-label="Profils en ligne">
          <a className="text-link" href="https://github.com/BouchardMehdi">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a
            className="text-link"
            href="https://www.linkedin.com/in/mehdi-bouchard-mb"
          >
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </section>
  );
}
