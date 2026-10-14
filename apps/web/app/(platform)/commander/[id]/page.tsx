import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEGAL_FORMS, OFFER, formatEuros } from "@site-ia/core";
import { repo } from "@/lib/services";
import { OrderForm } from "./order-form";

export const metadata: Metadata = {
  title: "Mettre mon site en ligne",
  robots: { index: false, follow: false },
};

/** Commande : e-mail du client + informations légales (mentions légales obligatoires). */
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await repo().getProject(id);
  if (!project) notFound();
  // Ne jamais rediriger vers l'espace ici : l'identifiant du projet est visible dans l'URL de
  // l'aperçu, le lien privé (jeton) ne doit être obtenu que par e-mail ou après paiement.
  if (project.status !== "preview") {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-3xl font-extrabold">Ce site a déjà été commandé</h1>
        <p className="mt-3 text-ink/70">
          Retrouvez-le dans votre espace : nous vous renvoyons le lien par e-mail.
        </p>
        <Link href="/espace/retrouver" className="mt-6 inline-block font-semibold text-brand">
          Retrouver mon espace →
        </Link>
      </main>
    );
  }

  const brief = project.brief;
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href={`/apercu/${id}`} className="text-sm text-brand">
        ← Revoir l&apos;aperçu
      </Link>
      <h1 className="font-display mt-4 text-3xl font-extrabold">Mettre mon site en ligne</h1>
      <p className="mt-2 text-ink/70">
        {formatEuros(OFFER.creation.amountCents)} pour la création, puis{" "}
        {formatEuros(OFFER.hosting.amountCents)}/mois après {OFFER.hosting.trialDays} jours offerts.
        Sans engagement.
      </p>
      <OrderForm
        projectId={id}
        legalForms={[...LEGAL_FORMS]}
        defaults={{
          email: brief.contact?.email ?? "",
          legalName: brief.businessName ?? "",
          address: brief.contact?.address ?? "",
        }}
      />
    </main>
  );
}
