import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { repo } from "@/lib/services";
import { optOut } from "./action";

export const metadata: Metadata = {
  title: "Ne plus être contacté",
  robots: { index: false, follow: false },
};

/**
 * Désinscription d'un prospect. Confirmation par bouton (et non au simple chargement de la page)
 * pour que les aperçus de liens des messageries ne désinscrivent personne par erreur.
 */
export default async function OptOutPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const [{ token }, { ok }] = await Promise.all([params, searchParams]);
  const lead = await repo().findLeadByOptOutToken(token);
  if (!lead) notFound();
  const done = ok === "1" || lead.status === "opted_out";

  return (
    <main className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-3xl font-extrabold">
        {done ? "C'est noté" : "Ne plus être contacté"}
      </h1>
      {done ? (
        <p className="mt-4 text-ink/70">
          {lead.businessName} ne recevra plus aucun message de {BRAND.name}. Toutes nos excuses pour
          le dérangement.
        </p>
      ) : (
        <form action={optOut} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <p className="text-ink/70">
            Confirmez que {lead.businessName} ne souhaite plus recevoir de messages de {BRAND.name}.
          </p>
          <button className="mt-6 rounded-2xl bg-ink px-6 py-3 font-semibold text-paper">
            Confirmer
          </button>
        </form>
      )}
    </main>
  );
}
