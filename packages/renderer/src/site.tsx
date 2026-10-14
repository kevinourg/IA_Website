import { findPage, type Page, type SiteSpec } from "@site-ia/core";

export const LEGAL_SLUG = "mentions-legales";

/**
 * Mentions légales (obligatoires en France, LCEN art. 6) — générées, jamais laissées à l'IA.
 * TODO : collecter SIRET / forme juridique / directeur de publication lors de la commande.
 */
function legalPage(spec: SiteSpec): Page {
  const b = spec.business;
  return {
    slug: LEGAL_SLUG,
    navLabel: "Mentions légales",
    seo: { title: `Mentions légales — ${b.name}`, description: `Mentions légales de ${b.name}.` },
    sections: [
      {
        type: "about",
        variant: "text",
        title: "Mentions légales",
        body: [
          `Éditeur du site : ${b.name}, ${b.trade} — ${b.address ?? b.city}.`,
          [b.phone && `Téléphone : ${b.phone}`, b.email && `E-mail : ${b.email}`]
            .filter(Boolean)
            .join(" · "),
          "Hébergement : [HÉBERGEUR À COMPLÉTER].",
          "Données personnelles : les informations envoyées via le formulaire de contact servent uniquement à répondre à votre demande et ne sont pas cédées à des tiers.",
        ]
          .filter(Boolean)
          .join("\n\n"),
        highlights: [],
      },
    ],
  };
}
import { SectionView } from "./sections";
import { jsonLd } from "./seo";
import { fontsHref, siteCss } from "./theme";

/**
 * Rendu d'une page de site client. Composant serveur pur : aucune dépendance au style de l'app.
 * `linkBase` permet de servir le même site en aperçu (/apercu/<id>) ou en production (/).
 */
export function SitePage({
  spec,
  slug,
  baseUrl,
  linkBase = "",
}: {
  spec: SiteSpec;
  slug: string;
  baseUrl: string;
  linkBase?: string;
}) {
  const page = slug === LEGAL_SLUG ? legalPage(spec) : findPage(spec, slug);
  if (!page) return null;
  const year = new Date().getFullYear();
  const href = (s: string) => `${linkBase}/${s}`;

  return (
    <div className="s-root">
      <link rel="stylesheet" href={fontsHref(spec.theme)} />
      <style dangerouslySetInnerHTML={{ __html: siteCss(spec.theme) }} />
      {jsonLd(spec, page, `${baseUrl}/${page.slug}`).map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Échappe "<" : le contenu vient de l'IA / du client, on évite toute fermeture de balise.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
      ))}
      <header className="s-wrap">
        <nav className="s-nav" aria-label="Navigation principale">
          <a className="s-brand" href={href("")}>
            {spec.business.name}
          </a>
          <ul>
            {spec.pages.map((p) => (
              <li key={p.slug}>
                <a href={href(p.slug)} aria-current={p.slug === slug ? "page" : undefined}>
                  {p.navLabel}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main>
        {page.sections.map((section, i) => (
          <SectionView key={i} section={section} spec={spec} alt={i % 2 === 1} />
        ))}
      </main>
      <footer className="s-footer">
        <div className="s-wrap">
          <p>
            <strong>{spec.business.name}</strong> — {spec.business.trade} à {spec.business.city}
          </p>
          <p>
            © {year} {spec.business.name} · <a href={href("mentions-legales")}>Mentions légales</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
