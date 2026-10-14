import { NextResponse } from "next/server";
import { z } from "zod";
import { LegalInfoSchema, OFFER } from "@site-ia/core";
import { env } from "@/lib/env";
import { goLive } from "@/lib/go-live";
import { repo } from "@/lib/services";
import { stripe } from "@/lib/stripe";
import { espaceUrl } from "@/lib/urls";

const Body = z.object({
  projectId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide"),
  legal: LegalInfoSchema,
});

/** Erreurs par chemin complet (« legal.siret ») pour les afficher sous chaque champ. */
function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) (out[issue.path.join(".")] ??= []).push(issue.message);
  return out;
}

/**
 * Commande : enregistre l'e-mail et les informations légales, puis
 *  - Stripe configuré → session Checkout (création + abonnement). Le passage en ligne se fait
 *    UNIQUEMENT via le webhook ;
 *  - sinon, en développement → mode démo : mise en ligne immédiate.
 * Réponse : { redirect } vers Stripe ou vers l'espace client.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Merci de corriger les champs indiqués.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }
  const { projectId, email, legal } = parsed.data;

  const project = await repo().getProject(projectId);
  if (!project || project.status !== "preview") {
    return NextResponse.json({ error: "Ce projet ne peut pas être commandé" }, { status: 409 });
  }
  await repo().updateProject(projectId, { customerEmail: email, legal });

  const s = stripe();
  const stripeReady = s && env.STRIPE_PRICE_CREATION && env.STRIPE_PRICE_HOSTING;

  if (!stripeReady && process.env.NODE_ENV !== "production") {
    await goLive({ ...project, customerEmail: email, legal });
    return NextResponse.json({ redirect: espaceUrl(project.accessToken) });
  }
  if (!s || !stripeReady) {
    return NextResponse.json(
      { error: "Paiement non configuré (voir STRIPE_* dans .env)" },
      { status: 503 },
    );
  }

  const session = await s.checkout.sessions.create({
    mode: "subscription",
    locale: "fr",
    line_items: [
      { price: env.STRIPE_PRICE_CREATION, quantity: 1 }, // prix "one_time" ajouté à la 1re facture
      { price: env.STRIPE_PRICE_HOSTING, quantity: 1 },
    ],
    subscription_data: {
      trial_period_days: OFFER.hosting.trialDays,
      metadata: { projectId },
    },
    metadata: { projectId },
    client_reference_id: projectId,
    customer_email: email,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    // Après paiement, le client arrive directement dans son espace (lien privé).
    success_url: espaceUrl(project.accessToken),
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/commander/${projectId}`,
  });

  return NextResponse.json({ redirect: session.url });
}
