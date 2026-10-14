import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { newContactEmail } from "@/lib/email-templates";
import { env } from "@/lib/env";
import { repo } from "@/lib/services";
import { espaceUrl } from "@/lib/urls";

const Form = z.object({
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().min(3).max(200),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(0).optional(), // pot de miel anti-spam
});

/**
 * Formulaire de contact des sites clients (le site est identifié par son nom d'hôte) :
 * la demande est enregistrée (visible dans l'espace client) et envoyée par e-mail au client.
 */
export async function POST(req: Request) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const project = await repo().findProjectByHost(host, env.ROOT_DOMAIN);
  if (!project || project.status !== "live") {
    return NextResponse.json({ error: "Site inconnu" }, { status: 404 });
  }

  const data = Object.fromEntries(await req.formData());
  const parsed = Form.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const { name, contact, message } = parsed.data;
  await repo().saveContactSubmission(project.id, { name, contact, message });

  if (project.customerEmail) {
    const spec = await repo().getLatestSpec(project.id);
    await sendEmail(
      newContactEmail({
        to: project.customerEmail,
        businessName: spec?.business.name ?? project.brief.businessName ?? "votre site",
        name,
        contact,
        message,
        espaceUrl: espaceUrl(project.accessToken),
      }),
    );
  }

  return NextResponse.redirect(new URL("/?envoye=1", req.url), 303);
}
