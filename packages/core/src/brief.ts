import { z } from "zod";

/**
 * BusinessBrief — ce que l'on sait de l'activité du client, extrait de la conversation.
 * C'est l'unique entrée du générateur de site : tout ce qui n'est pas ici ne doit pas
 * être inventé (pas de faux avis, pas de fausses certifications, pas de faux prix).
 */
export const BusinessBriefSchema = z.object({
  businessName: z.string().min(1).describe("Nom commercial"),
  trade: z.string().min(1).describe("Métier principal, ex. 'plombier', 'ostéopathe'"),
  city: z.string().min(1).describe("Ville principale d'intervention ou d'implantation"),
  serviceArea: z.array(z.string()).default([]).describe("Autres villes / zones desservies"),
  services: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string().optional().describe("Uniquement si le client l'a donné"),
      }),
    )
    .default([]),
  differentiators: z.array(z.string()).default([]).describe("Points forts cités par le client"),
  audience: z.string().optional().describe("Clientèle visée (particuliers, pros…)"),
  tone: z
    .enum(["professionnel", "chaleureux", "premium", "dynamique", "rassurant"])
    .default("professionnel"),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
    })
    .default({}),
  openingHours: z.string().optional(),
  yearsOfExperience: z.number().int().nonnegative().optional(),
  certifications: z.array(z.string()).default([]).describe("Uniquement celles citées"),
  testimonials: z
    .array(z.object({ author: z.string(), text: z.string() }))
    .default([])
    .describe("Uniquement de vrais avis fournis par le client"),
  stylePreferences: z.string().optional().describe("Couleurs, ambiance, sites aimés…"),
  existingWebsite: z.string().optional(),
});

export type BusinessBrief = z.infer<typeof BusinessBriefSchema>;

/** Champs minimum pour lancer une génération d'aperçu. */
export const REQUIRED_BRIEF_FIELDS = ["businessName", "trade", "city"] as const;

export function missingBriefFields(brief: Partial<BusinessBrief>): string[] {
  const missing: string[] = REQUIRED_BRIEF_FIELDS.filter((k) => !brief[k]);
  if (!brief.services || brief.services.length === 0) missing.push("services");
  if (!brief.contact?.phone && !brief.contact?.email) missing.push("contact");
  return missing;
}
