import { findPage, type HostingInfo, type LegalInfo, type SiteSpec } from "@site-ia/core";
import { LEGAL_SLUG, LegalNotice } from "./legal";
import { SectionView } from "./sections";
import { jsonLd } from "./seo";
import { fontsHref, siteCss } from "./theme";

export { LEGAL_SLUG };

/**
 * Rendu d'une page de site client. Composant serveur pur : aucune dépendance au style de l'app.
 * `linkBase` permet de servir le même site en aperçu (/apercu/<id>) ou en production (/).
 * `legal` / `hosting` alimentent les mentions légales (saisies à la commande, jamais par l'IA).
 */
export function SitePage({
  spec,
  slug,
  baseUrl,
  linkBase = "",
  legal,
  hosting,
  notice,
}: {
  spec: SiteSpec;
  slug: string;
  baseUrl: string;
  linkBase?: string;
  legal?: LegalInfo | null;
  hosting?: HostingInfo | null;
  /** Bandeau de confirmation (ex. « message envoyé »). */
  notice?: string;
}) {
  const isLegal = slug === LEGAL_SLUG;
  const page = isLegal ? null : findPage(spec, slug);
  if (!isLegal && !page) return null;
  const year = new Date().getFullYear();
  const href = (s: string) => `${linkBase}/${s}`;

  return (
    <div className="s-root">
      <link rel="stylesheet" href={fontsHref(spec.theme)} />
      <style dangerouslySetInnerHTML={{ __html: siteCss(spec.theme) }} />
      {page &&
        jsonLd(spec, page, `${baseUrl}/${page.slug}`).map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            // Échappe "<" : le contenu vient de l'IA / du client, on évite toute fermeture de balise.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
          />
        ))}
      {notice && (
        <p className="s-notice" role="status">
          {notice}
        </p>
      )}
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
        {page ? (
          page.sections.map((section, i) => (
            <SectionView key={i} section={section} spec={spec} alt={i % 2 === 1} />
          ))
        ) : (
          <LegalNotice spec={spec} legal={legal} hosting={hosting} />
        )}
      </main>
      <footer className="s-footer">
        <div className="s-wrap">
          <p>
            <strong>{spec.business.name}</strong> — {spec.business.trade} à {spec.business.city}
          </p>
          <p>
            © {year} {legal?.legalName ?? spec.business.name} ·{" "}
            <a href={href(LEGAL_SLUG)}>Mentions légales</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
