import { NextResponse } from "next/server";
import { canTransition } from "@site-ia/core";
import { env } from "@/lib/env";
import { repo } from "@/lib/services";
import { stripe } from "@/lib/stripe";

/** Source de vérité des paiements. Configurer l'URL dans Stripe : /api/webhooks/stripe */
export async function POST(req: Request) {
  const s = stripe();
  const signature = req.headers.get("stripe-signature");
  if (!s || !env.STRIPE_WEBHOOK_SECRET || !signature) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });
  }

  let event;
  try {
    event = s.webhooks.constructEvent(await req.text(), signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const projectId = event.data.object.metadata?.projectId;
      const project = projectId ? await repo().getProject(projectId) : null;
      if (project && canTransition(project.status, "paid")) {
        await repo().updateProject(project.id, { status: "paid" });
        // TODO (provisioning) : réserver le domaine .fr, vérifier le DNS, envoyer l'e-mail
        // de bienvenue, puis passer le projet en "live".
        await repo().updateProject(project.id, { status: "live" });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const projectId = event.data.object.metadata?.projectId;
      const project = projectId ? await repo().getProject(projectId) : null;
      if (project && canTransition(project.status, "suspended")) {
        await repo().updateProject(project.id, { status: "suspended" });
      }
      break;
    }
  }
  return NextResponse.json({ received: true });
}
