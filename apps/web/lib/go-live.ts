import "server-only";
import { canTransition } from "@site-ia/core";
import type { ProjectRecord } from "@site-ia/db";
import { sendEmail } from "./email";
import { siteLiveEmail } from "./email-templates";
import { repo } from "./services";
import { clientSiteUrl, espaceUrl } from "./urls";

/**
 * Mise en ligne après paiement (webhook Stripe) ou en mode démo :
 * statut paid → live, puis e-mail au client avec l'adresse du site et son lien privé.
 */
export async function goLive(project: ProjectRecord): Promise<void> {
  if (!canTransition(project.status, "paid")) return;
  await repo().updateProject(project.id, { status: "paid" });
  // TODO (provisioning) : réserver le domaine .fr et vérifier le DNS avant de passer en "live".
  await repo().updateProject(project.id, { status: "live" });
  // Prospect devenu client : on le sort du pipeline de prospection.
  if (project.leadId) await repo().updateLead(project.leadId, { status: "converted" });

  if (project.customerEmail && project.slug) {
    await sendEmail(
      siteLiveEmail({
        to: project.customerEmail,
        businessName: project.legal?.legalName ?? project.brief.businessName ?? "votre entreprise",
        siteUrl: clientSiteUrl(project.slug),
        espaceUrl: espaceUrl(project.accessToken),
      }),
    );
  }
}
