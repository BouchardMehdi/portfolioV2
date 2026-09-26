import { journey } from "@/data/journey";

export function Journey() {
  return (
    <section className="about-journey" aria-labelledby="journey-heading">
      <header className="journey-heading">
        <h3 id="journey-heading">Mon parcours</h3>
        <p className="text-muted">
          Études et stages, du plus récent au plus ancien.
        </p>
      </header>
      <ol className="journey-list" aria-label="Études et stages">
        {journey.map((step) => (
          <li
            className="journey-entry"
            key={step.id}
            data-kind={step.kind === "Stage" ? "internship" : "education"}
          >
            <p className="journey-period">{step.period}</p>
            <span className="journey-marker" aria-hidden="true" />
            <article className="journey-card" aria-labelledby={step.id}>
              <p className="eyebrow journey-kind">
                {step.kind}
                {"current" in step && step.current && (
                  <span className="journey-current">En cours</span>
                )}
              </p>
              <h4 id={step.id}>{step.title}</h4>
              {step.organization && (
                <p className="journey-organization">{step.organization}</p>
              )}
              <p className="journey-description">{step.description}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
