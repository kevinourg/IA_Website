import { z } from "zod";

/** Pipeline commercial d'un prospect. */
export const LEAD_STATUSES = [
  "new", // à traiter
  "preview_ready", // aperçu généré, pas encore envoyé
  "contacted", // message envoyé
  "converted", // a commandé
  "lost", // pas intéressé
  "opted_out", // a demandé à ne plus être contacté : on ne le recontacte JAMAIS
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "À traiter",
  preview_ready: "Aperçu prêt",
  contacted: "Contacté",
  converted: "Client",
  lost: "Perdu",
  opted_out: "Désinscrit",
};

export const LeadInputSchema = z
  .object({
    businessName: z.string().trim().min(2).max(200),
    trade: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    website: z.string().trim().max(300).optional(),
    siret: z.string().trim().max(20).optional(),
    address: z.string().trim().max(300).optional(),
    source: z.string().trim().min(1).max(100),
    notes: z.string().trim().max(2000).optional(),
  })
  .strict();
export type LeadInput = z.infer<typeof LeadInputSchema>;

/** Clé de dédoublonnage : SIRET, sinon e-mail, sinon téléphone, sinon nom + ville. */
export function leadDedupKey(
  l: Pick<LeadInput, "siret" | "email" | "phone" | "businessName" | "city">,
): string {
  if (l.siret) return `siret:${l.siret.replace(/\s/g, "")}`;
  if (l.email) return `email:${l.email.toLowerCase()}`;
  if (l.phone) return `tel:${l.phone.replace(/\D/g, "")}`;
  return `nom:${l.businessName.toLowerCase().trim()}|${(l.city ?? "").toLowerCase().trim()}`;
}

// ─── Import depuis l'annuaire officiel des entreprises (API Recherche d'entreprises) ───

/** Sous-ensemble utile d'un résultat de https://recherche-entreprises.api.gouv.fr/search */
export type CompanySearchResult = {
  nom_complet: string;
  siren: string;
  categorie_entreprise?: string | null;
  statut_diffusion?: string | null;
  etat_administratif?: string | null;
  siege: {
    siret: string;
    adresse?: string | null;
    code_postal?: string | null;
    libelle_commune?: string | null;
    etat_administratif?: string | null;
    liste_enseignes?: string[] | null;
  };
  matching_etablissements?: {
    siret: string;
    adresse?: string | null;
    code_postal?: string | null;
    libelle_commune?: string | null;
    etat_administratif?: string | null;
    liste_enseignes?: string[] | null;
  }[];
};

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, c: string) => sep + c.toUpperCase());

/**
 * Convertit un résultat de l'annuaire en prospect. Écarte :
 *  - les entreprises non diffusibles (statut ≠ « O ») : leurs données sont protégées ;
 *  - les entreprises fermées, et les grandes (ETI / GE) qui ne sont pas notre cible.
 * Aucune donnée de contact personnelle n'est récupérée : l'annuaire n'en fournit pas.
 */
export function companyToLead(r: CompanySearchResult, trade?: string): LeadInput | null {
  if (r.statut_diffusion && r.statut_diffusion !== "O") return null;
  if (r.etat_administratif && r.etat_administratif !== "A") return null;
  if (r.categorie_entreprise === "ETI" || r.categorie_entreprise === "GE") return null;
  const site =
    r.matching_etablissements?.find((e) => e.etat_administratif === "A") ??
    (r.siege.etat_administratif !== "F" ? r.siege : undefined);
  if (!site) return null;
  const sign = site.liste_enseignes?.[0];
  return {
    businessName: titleCase(sign || r.nom_complet).slice(0, 200),
    trade,
    city: site.libelle_commune ? titleCase(site.libelle_commune) : undefined,
    siret: site.siret,
    address: site.adresse ? titleCase(site.adresse) : undefined,
    source: "annuaire-entreprises",
  };
}

// ─── Message de prospection ───

/** Libellé de l'origine des données d'un prospect, pour l'information RGPD. */
export function leadDataSourceLabel(source: string): string {
  if (source === "annuaire-entreprises") {
    return "l'annuaire public des entreprises (annuaire-entreprises.data.gouv.fr)";
  }
  return "sources professionnelles publiques";
}

/**
 * Message de premier contact (e-mail ou SMS), avec identification de l'expéditeur et lien de
 * désinscription : obligatoires en prospection B2B. Toujours relu et envoyé à la main.
 */
export function outreachMessage(p: {
  brand: string;
  contactName?: string;
  businessName: string;
  previewUrl: string;
  optOutUrl: string;
  senderName: string;
  /** Origine des coordonnées (RGPD art. 14 : à indiquer dès le premier contact). */
  dataSource: string;
}): { subject: string; body: string; sms: string } {
  const hello = p.contactName ? `Bonjour ${p.contactName},` : "Bonjour,";
  return {
    subject: `${p.businessName} : nous avons préparé un aperçu de votre site`,
    body: `${hello}

Je me permets de vous contacter au sujet de la présence en ligne de ${p.businessName}.

Nous avons préparé, gratuitement et sans engagement, un aperçu de ce que pourrait être votre site internet :
${p.previewUrl}

Si le résultat vous plaît, il peut être en ligne le jour même. Sinon, il vous suffit d'ignorer ce message.

Bonne journée,
${p.senderName} — ${p.brand}

Vos coordonnées professionnelles proviennent de ${p.dataSource} et ne servent qu'à ce contact. Vous ne souhaitez plus recevoir nos messages ? ${p.optOutUrl}`,
    sms: `${p.brand} : nous avons préparé un aperçu gratuit du site de ${p.businessName} : ${p.previewUrl} — Ne plus être contacté : ${p.optOutUrl}`,
  };
}
