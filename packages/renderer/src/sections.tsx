import type { Section, SiteSpec } from "@site-ia/core";

type Props<T extends Section["type"]> = {
  section: Extract<Section, { type: T }>;
  spec: SiteSpec;
  alt: boolean;
};

function Hero({ section: s }: Props<"hero">) {
  const actions = (
    <div className="s-actions">
      <a className="s-btn" href={s.primaryCta.href}>
        {s.primaryCta.label}
      </a>
      {s.secondaryCta && (
        <a className="s-btn s-btn-ghost" href={s.secondaryCta.href}>
          {s.secondaryCta.label}
        </a>
      )}
    </div>
  );
  const text = (
    <div>
      {s.eyebrow && <p className="s-eyebrow">{s.eyebrow}</p>}
      <h1>{s.title}</h1>
      <p className="s-lead">{s.subtitle}</p>
      {actions}
    </div>
  );
  if (s.variant === "split") {
    return (
      <section className="s-section">
        <div className="s-wrap s-hero-split">
          {text}
          <div className="s-hero-art" role="img" aria-label={s.imageQuery ?? ""} />
        </div>
      </section>
    );
  }
  return (
    <section
      className={`s-section ${s.variant === "banner" ? "s-hero-banner" : "s-hero-centered"}`}
    >
      <div className="s-wrap">{text}</div>
    </section>
  );
}

function Services({ section: s, alt }: Props<"services">) {
  return (
    <section className={`s-section ${alt ? "s-alt" : ""}`}>
      <div className="s-wrap">
        <h2>{s.title}</h2>
        {s.intro && <p className="s-lead">{s.intro}</p>}
        {s.variant === "list" ? (
          <ul className="s-list">
            {s.items.map((it) => (
              <li key={it.name}>
                <strong>{it.name}</strong> — {it.description}
                {it.price && <span className="s-price"> · {it.price}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="s-grid">
            {s.items.map((it) => (
              <article className="s-card" key={it.name}>
                <h3>{it.name}</h3>
                <p>{it.description}</p>
                {it.price && <p className="s-price">{it.price}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function About({ section: s, alt }: Props<"about">) {
  return (
    <section className={`s-section ${alt ? "s-alt" : ""}`}>
      <div className="s-wrap">
        <h2>{s.title}</h2>
        {s.body.split("\n\n").map((para, i) => (
          <p key={i} className="s-lead">
            {para}
          </p>
        ))}
        {s.highlights.length > 0 && (
          <ul className="s-chips">
            {s.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Testimonials({ section: s, alt }: Props<"testimonials">) {
  return (
    <section className={`s-section ${alt ? "s-alt" : ""}`}>
      <div className="s-wrap">
        <h2>{s.title}</h2>
        <div className="s-grid">
          {s.items.map((t, i) => (
            <figure className="s-card" key={i}>
              <blockquote className="s-quote">« {t.text} »</blockquote>
              <figcaption>— {t.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ section: s, alt }: Props<"faq">) {
  return (
    <section className={`s-section s-faq ${alt ? "s-alt" : ""}`}>
      <div className="s-wrap">
        <h2>{s.title}</h2>
        {s.items.map((q) => (
          <details key={q.question}>
            <summary>{q.question}</summary>
            <p>{q.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ServiceArea({ section: s, alt }: Props<"serviceArea">) {
  return (
    <section className={`s-section ${alt ? "s-alt" : ""}`}>
      <div className="s-wrap">
        <h2>{s.title}</h2>
        {s.intro && <p className="s-lead">{s.intro}</p>}
        <ul className="s-chips">
          {s.cities.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Cta({ section: s }: Props<"cta">) {
  return (
    <section className="s-section s-cta">
      <div className="s-wrap">
        <h2>{s.title}</h2>
        {s.body && <p>{s.body}</p>}
        <div className="s-actions" style={{ justifyContent: "center" }}>
          <a className="s-btn" href={s.cta.href}>
            {s.cta.label}
          </a>
        </div>
      </div>
    </section>
  );
}

function Contact({ section: s, spec, alt }: Props<"contact">) {
  const b = spec.business;
  return (
    <section className={`s-section ${alt ? "s-alt" : ""}`} id="contact">
      <div className="s-wrap">
        <h2>{s.title}</h2>
        {s.intro && <p className="s-lead">{s.intro}</p>}
        <p>
          {b.phone && (
            <>
              📞 <a href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a>
              <br />
            </>
          )}
          {b.email && (
            <>
              ✉️ <a href={`mailto:${b.email}`}>{b.email}</a>
              <br />
            </>
          )}
          {b.address && <>📍 {b.address}</>}
        </p>
        {s.showForm && (
          <form className="s-form" method="post" action="/api/contact">
            <input name="name" placeholder="Votre nom" required autoComplete="name" />
            <input name="contact" placeholder="Téléphone ou e-mail" required />
            <textarea name="message" rows={5} placeholder="Votre demande" required />
            <input type="text" name="website" hidden tabIndex={-1} autoComplete="off" />
            <button className="s-btn" type="submit">
              Envoyer
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export function SectionView({
  section,
  spec,
  alt,
}: {
  section: Section;
  spec: SiteSpec;
  alt: boolean;
}) {
  switch (section.type) {
    case "hero":
      return <Hero section={section} spec={spec} alt={alt} />;
    case "services":
      return <Services section={section} spec={spec} alt={alt} />;
    case "about":
      return <About section={section} spec={spec} alt={alt} />;
    case "testimonials":
      return <Testimonials section={section} spec={spec} alt={alt} />;
    case "faq":
      return <Faq section={section} spec={spec} alt={alt} />;
    case "serviceArea":
      return <ServiceArea section={section} spec={spec} alt={alt} />;
    case "cta":
      return <Cta section={section} spec={spec} alt={alt} />;
    case "contact":
      return <Contact section={section} spec={spec} alt={alt} />;
  }
}
