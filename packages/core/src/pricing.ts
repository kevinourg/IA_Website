/**
 * Offre commerciale — VALEURS PROVISOIRES, à valider.
 * Référence marché (oct. 2026) : En2Deux = 299 € TTC création + 59 €/mois hébergement & suivi.
 * Les montants sont en centimes TTC. Les identifiants Stripe viennent de l'environnement.
 */
export const OFFER = {
  creation: {
    label: "Création du site",
    amountCents: 24900,
    includes: [
      "Site vitrine unique jusqu'à 5 pages",
      "Textes rédigés et optimisés pour le référencement local",
      "Nom de domaine .fr (1re année)",
      "7 jours de retouches offertes",
    ],
  },
  hosting: {
    label: "Hébergement & suivi",
    amountCents: 4900,
    interval: "month" as const,
    trialDays: 14,
    includes: [
      "Hébergement sécurisé (HTTPS)",
      "Modifications de contenu illimitées par chat",
      "Formulaire de contact relié à votre e-mail",
      "Rapport de visites mensuel",
    ],
  },
} as const;

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}
