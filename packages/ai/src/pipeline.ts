import { z } from "zod";
import {
  BusinessBriefSchema,
  SiteSpecSchema,
  missingBriefFields,
  type BusinessBrief,
  type ChatMessage,
  type SiteSpec,
} from "@site-ia/core";
import type { AiProvider, Usage } from "./provider";
import { EDIT_SYSTEM, GENERATE_SYSTEM, INTAKE_SYSTEM } from "./prompts";
import { applyPatch, type PatchOp } from "./patch";

// ─── 1. Conversation d'accueil ──────────────────────────────────────

export const IntakeTurnSchema = z.object({
  reply: z.string().describe("Message à afficher au client"),
  brief: BusinessBriefSchema.partial().describe("Brief complet mis à jour"),
  readyToGenerate: z.boolean(),
});
export type IntakeTurn = z.infer<typeof IntakeTurnSchema>;

export async function intakeTurn(ai: AiProvider, history: ChatMessage[]) {
  const { data, usage } = await ai.structured({
    task: "intake",
    system: INTAKE_SYSTEM,
    messages: history,
    schema: IntakeTurnSchema,
    toolName: "repondre_au_client",
    toolDescription: "Répond au client et met à jour le brief de son activité.",
  });
  // On ne fait pas confiance au modèle pour décider seul : contrôle déterministe des champs requis.
  const missing = missingBriefFields(data.brief);
  return { ...data, readyToGenerate: data.readyToGenerate && missing.length === 0, missing, usage };
}

// ─── 2. Génération du site ──────────────────────────────────────────

export async function generateSite(ai: AiProvider, brief: BusinessBrief) {
  const usages: Usage[] = [];
  const messages: ChatMessage[] = [
    { role: "user", content: `Brief client (JSON) :\n${JSON.stringify(brief, null, 2)}` },
  ];

  // Une seule relance si la sortie ne valide pas : on renvoie les erreurs au modèle.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data, usage } = await ai.structured({
        task: "generate",
        system: GENERATE_SYSTEM,
        messages,
        schema: SiteSpecSchema,
        toolName: "publier_site",
        toolDescription: "Publie la description complète du site (SiteSpec).",
      });
      usages.push(usage);
      return { spec: enforceGuardrails(data, brief), usages };
    } catch (err) {
      if (attempt === 1 || !(err instanceof z.ZodError)) throw err;
      messages.push(
        { role: "assistant", content: "(sortie invalide)" },
        {
          role: "user",
          content: `La sortie ne respecte pas le schéma. Corrige ces erreurs :\n${z.prettifyError(err)}`,
        },
      );
    }
  }
  throw new Error("unreachable");
}

/**
 * Garde-fous déterministes appliqués après l'IA :
 *  - les coordonnées viennent toujours du brief (jamais inventées) ;
 *  - pas de section d'avis si le client n'en a pas fourni.
 */
export function enforceGuardrails(spec: SiteSpec, brief: BusinessBrief): SiteSpec {
  const hasRealTestimonials = brief.testimonials.length > 0;
  return {
    ...spec,
    business: {
      ...spec.business,
      name: brief.businessName,
      city: brief.city,
      phone: brief.contact.phone,
      email: brief.contact.email,
      address: brief.contact.address,
      openingHours: brief.openingHours ?? spec.business.openingHours,
    },
    pages: spec.pages.map((page) => ({
      ...page,
      sections: page.sections.filter((s) => s.type !== "testimonials" || hasRealTestimonials),
    })),
  };
}

// ─── 3. Modifications par chat ──────────────────────────────────────

const EditSchema = z.object({
  message: z.string().describe("Réponse courte au client"),
  operations: z.array(z.object({ path: z.string(), value: z.unknown() })),
});

export async function editSite(ai: AiProvider, spec: SiteSpec, instruction: string) {
  const { data, usage } = await ai.structured({
    task: "edit",
    system: EDIT_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Site actuel :\n${JSON.stringify(spec)}\n\nDemande du client : ${instruction}`,
      },
    ],
    schema: EditSchema,
    toolName: "modifier_site",
    toolDescription: "Applique des modifications minimales au site.",
  });
  const next = applyPatch(spec, data.operations as PatchOp[]);
  const parsed = SiteSpecSchema.safeParse(next);
  if (!parsed.success) {
    return {
      spec,
      message: "Cette modification n'a pas pu être appliquée.",
      applied: false,
      usage,
    };
  }
  return { spec: parsed.data, message: data.message, applied: data.operations.length > 0, usage };
}
