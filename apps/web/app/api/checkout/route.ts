import { NextResponse } from "next/server";
import { z } from "zod";
import { OFFER } from "@site-ia/core";
import { env } from "@/lib/env";
import { repo } from "@/lib/services";
import { stripe } from "@/lib/stripe";
import { espaceUrl } from "@/lib/urls";

const Body = z.object({ projectId: z.string().uuid() });

/**
 * Crée une session Stripe Checkout : création (paiement unique) + hébergement (abonnement
 * mensuel avec période d'essai). Le passage en "paid" se fait UNIQUEMENT via le webhook.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const parsed = Body.safeParse({ projectId: form?.get("projectId") });
  if (!parsed.success) return NextResponse.json({ error: "Projet invalide" }, { status: 400 });
  const { projectId } = parsed.data;

  const project = await repo().getProject(projectId);
  if (!project || project.status !== "preview") {
    return NextResponse.json({ error: "Ce projet ne peut pas être commandé" }, { status: 409 });
  }

  const s = stripe();
  const stripeReady = s && env.STRIPE_PRICE_CREATION && env.STRIPE_PRICE_HOSTING;

  // Mode démo (dev uniquement, Stripe non configuré) : mise en ligne immédiate sans paiement.
  if (!stripeReady && process.env.NODE_ENV !== "production") {
    await repo().updateProject(projectId, { status: "paid" });
    await repo().updateProject(projectId, { status: "live" });
    return NextResponse.redirect(espaceUrl(project.accessToken), 303);
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
    customer_email: project.brief.contact?.email,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    // Après paiement, le client arrive directement dans son espace (lien privé).
    success_url: espaceUrl(project.accessToken),
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/apercu/${projectId}`,
  });

  return NextResponse.redirect(session.url!, 303);
}
