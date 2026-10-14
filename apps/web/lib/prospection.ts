import "server-only";
import { generateSite } from "@site-ia/ai";
import {
  BusinessBriefSchema,
  TRADES,
  leadDataSourceLabel,
  outreachMessage,
  slugify,
  type Trade,
} from "@site-ia/core";
import type { LeadRecord } from "@site-ia/db";
import { BRAND } from "./brand";
import { env } from "./env";
import { ai, repo, trackUsage } from "./services";

function tradeOf(lead: LeadRecord): Trade | undefined {
  const t = lead.trade?.toLowerCase().trim();
  return TRADES.find((x) => x.slug === t || x.label === t || x.plural === t);
}

/**
 * Aperçu « à froid » : génère le site d'un prospect à partir de ses informations publiques.
 * Les prestations proposées sont celles typiques du métier ; le prospect les ajuste avant toute
 * mise en ligne (le bandeau de l'aperçu le précise). Coût IA suivi comme les autres projets.
 */
export async function generateLeadPreview(lead: LeadRecord): Promise<string> {
  if (lead.status === "opted_out") throw new Error("Ce prospect s'est désinscrit.");
  const trade = tradeOf(lead);
  const brief = BusinessBriefSchema.parse({
    businessName: lead.businessName,
    trade: trade?.label ?? lead.trade ?? "artisan",
    city: lead.city ?? "France",
    services: (trade?.pages ?? [])
      .filter((p) => !/contact|zone|réalisations|horaires/i.test(p))
      .map((name) => ({ name })),
    contact: { phone: lead.phone, email: lead.email, address: lead.address },
    tone: "professionnel",
  });

  const project = await repo().createProject({
    leadId: lead.id,
    attribution: { source: "prospection", medium: lead.source },
  });
  await repo().updateProject(project.id, { brief, status: "generating" });
  try {
    const { spec, usages } = await generateSite(ai(), brief);
    await trackUsage(project.id, usages);
    await repo().saveSiteVersion(project.id, spec, "generate");
    await repo().updateProject(project.id, {
      status: "preview",
      slug: `${slugify(brief.businessName)}-${project.id.slice(0, 4)}`,
    });
  } catch (err) {
    await repo().updateProject(project.id, { status: "intake" });
    throw err;
  }
  await repo().updateLead(lead.id, { projectId: project.id, status: "preview_ready" });
  return project.id;
}

export function leadOutreach(lead: LeadRecord) {
  if (!lead.projectId) return null;
  return outreachMessage({
    brand: BRAND.name,
    businessName: lead.businessName,
    previewUrl: `${env.NEXT_PUBLIC_APP_URL}/apercu/${lead.projectId}`,
    optOutUrl: `${env.NEXT_PUBLIC_APP_URL}/desinscription/${lead.optOutToken}`,
    senderName: BRAND.outreachSender,
    dataSource: leadDataSourceLabel(lead.source),
  });
}
