import { z } from "zod";

/**
 * Informations légales de l'éditeur du site (le client), exigées par la LCEN (art. 6-III)
 * pour les mentions légales. Collectées à la commande — jamais générées par l'IA.
 */
export const LEGAL_FORMS = [
  "Entrepreneur individuel (EI / micro-entreprise)",
  "EURL",
  "SARL",
  "SASU",
  "SAS",
  "SA",
  "SCI",
  "Association",
  "Autre",
] as const;

/** Formes sans capital social à afficher. */
const NO_CAPITAL = new Set<string>([LEGAL_FORMS[0], "Association"]);

export function requiresShareCapital(legalForm: string): boolean {
  return !NO_CAPITAL.has(legalForm);
}

/** SIRET = 14 chiffres, clé de Luhn (cas particulier La Poste : somme des chiffres multiple de 5). */
export function isValidSiret(raw: string): boolean {
  const siret = raw.replace(/\s/g, "");
  if (!/^\d{14}$/.test(siret)) return false;
  if (siret.startsWith("356000000")) {
    return [...siret].reduce((s, d) => s + Number(d), 0) % 5 === 0;
  }
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let n = Number(siret[13 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function formatSiret(raw: string): string {
  const s = raw.replace(/\s/g, "");
  return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 9)} ${s.slice(9)}`;
}

export const LegalInfoSchema = z
  .object({
    legalName: z.string().trim().min(2, "Indiquez la raison sociale ou vos nom et prénom").max(200),
    legalForm: z.enum(LEGAL_FORMS),
    siret: z
      .string()
      .trim()
      .refine(isValidSiret, "SIRET invalide (14 chiffres)")
      .transform((s) => s.replace(/\s/g, "")),
    address: z.string().trim().min(5, "Indiquez l'adresse complète").max(300),
    shareCapital: z.string().trim().max(50).optional(),
    vatNumber: z.string().trim().max(30).optional(),
    publicationDirector: z
      .string()
      .trim()
      .min(2, "Indiquez le directeur de la publication")
      .max(200),
  })
  .refine((v) => !requiresShareCapital(v.legalForm) || Boolean(v.shareCapital), {
    path: ["shareCapital"],
    message: "Indiquez le capital social de la société",
  });

export type LegalInfo = z.infer<typeof LegalInfoSchema>;

/** Hébergeur des sites — mention obligatoire (nom, adresse, téléphone). */
export type HostingInfo = { name: string; address: string; phone: string };
