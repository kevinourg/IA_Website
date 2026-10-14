import {
  formatSiret,
  requiresShareCapital,
  type HostingInfo,
  type LegalInfo,
  type SiteSpec,
} from "@site-ia/core";

export const LEGAL_SLUG = "mentions-legales";

/**
 * Mentions légales (LCEN art. 6-III) et information RGPD du formulaire de contact.
 * Entièrement générées par le code à partir des informations saisies à la commande :
 * l'IA n'intervient jamais sur ce contenu.
 */
export function LegalNotice({
  spec,
  legal,
  hosting,
}: {
  spec: SiteSpec;
  legal?: LegalInfo | null;
  hosting?: HostingInfo | null;
}) {
  const b = spec.business;
  return (
    <section className="s-section">
      <div className="s-wrap s-legal">
        <h1>Mentions légales</h1>

        <h2>Éditeur du site</h2>
        {legal ? (
          <p>
            {legal.legalName} — {legal.legalForm}
            {requiresShareCapital(legal.legalForm) && legal.shareCapital
              ? `, au capital de ${legal.shareCapital}`
              : ""}
            <br />
            Siège : {legal.address}
            <br />
            SIRET : {formatSiret(legal.siret)}
            {legal.vatNumber && (
              <>
                <br />
                N° TVA intracommunautaire : {legal.vatNumber}
              </>
            )}
            {b.phone && (
              <>
                <br />
                Téléphone : {b.phone}
              </>
            )}
            {b.email && (
              <>
                <br />
                E-mail : {b.email}
              </>
            )}
          </p>
        ) : (
          <p>
            {b.name} — {b.trade} à {b.city}.<br />
            <em>Informations légales complétées lors de la mise en ligne.</em>
          </p>
        )}

        <h2>Directeur de la publication</h2>
        <p>{legal?.publicationDirector ?? "À compléter lors de la mise en ligne."}</p>

        <h2>Hébergement</h2>
        <p>
          {hosting ? (
            <>
              {hosting.name}
              <br />
              {hosting.address}
              <br />
              Téléphone : {hosting.phone}
            </>
          ) : (
            "À compléter."
          )}
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          Les contenus de ce site (textes, visuels, logo) sont la propriété de{" "}
          {legal?.legalName ?? b.name}, sauf mention contraire. Toute reproduction sans autorisation
          est interdite.
        </p>

        <h2>Données personnelles</h2>
        <p>
          Les informations envoyées via le formulaire de contact (nom, coordonnées, message) sont
          utilisées uniquement pour répondre à votre demande, sur la base de votre démarche. Elles
          sont conservées au plus 3 ans après le dernier échange et ne sont ni vendues ni cédées à
          des tiers. Le responsable du traitement est {legal?.legalName ?? b.name}.
        </p>
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement et d&apos;opposition, que vous pouvez exercer
          {b.email ? ` par e-mail à ${b.email}` : " en contactant l'éditeur"}. Vous pouvez également
          introduire une réclamation auprès de la CNIL (www.cnil.fr).
        </p>

        <h2>Cookies</h2>
        <p>Ce site ne dépose aucun cookie publicitaire ni de mesure d&apos;audience nominative.</p>
      </div>
    </section>
  );
}
