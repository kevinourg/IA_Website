import Link from "next/link";
import { notFound } from "next/navigation";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@site-ia/core";
import { CopyButton, SubmitButton } from "@/components/admin-ui";
import { leadOutreach } from "@/lib/prospection";
import { repo } from "@/lib/services";
import { createPreview, markContacted, updateLead } from "../../actions";

export const dynamic = "force-dynamic";
// La génération d'un aperçu peut durer jusqu'à ~1 min.
export const maxDuration = 120;

const input = "w-full rounded-xl border border-ink/15 bg-white px-3 py-2";
const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const [{ id }, { msg }] = await Promise.all([params, searchParams]);
  const lead = await repo().getLead(id);
  if (!lead) notFound();
  const optedOut = lead.status === "opted_out";
  const outreach = leadOutreach(lead);

  return (
    <main>
      <Link href="/admin/prospects" className="text-sm text-brand">
        ← Prospects
      </Link>
      <h1 className="font-display mt-2 text-3xl font-extrabold">{lead.businessName}</h1>
      <p className="mt-1 text-ink/60">
        {[lead.trade, lead.city, LEAD_STATUS_LABELS[lead.status], `source : ${lead.source}`]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {msg && (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 shadow-sm" role="status">
          {msg}
        </p>
      )}
      {optedOut && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          Ce prospect a demandé à ne plus être contacté. Ne le recontactez pas.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">1. Aperçu de son site</h2>
          {lead.projectId ? (
            <p>
              <a
                href={`/apercu/${lead.projectId}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-brand"
              >
                Voir l&apos;aperçu ↗
              </a>
            </p>
          ) : (
            <p className="text-sm text-ink/60">
              Génère un site à partir des informations connues (nom, métier, ville) et des
              prestations typiques du métier. Le prospect pourra tout ajuster avant la mise en
              ligne.
            </p>
          )}
          {!optedOut && (
            <form action={createPreview}>
              <input type="hidden" name="id" value={lead.id} />
              <SubmitButton pending="Génération (≈ 30 s)…">
                {lead.projectId ? "Régénérer un aperçu" : "Générer l'aperçu"}
              </SubmitButton>
            </form>
          )}

          <h2 className="pt-4 font-semibold">2. Message à envoyer</h2>
          {outreach && !optedOut ? (
            <>
              <p className="text-sm text-ink/60">
                À relire et envoyer vous-même, depuis votre adresse ou votre téléphone pro. Le lien
                de désinscription est obligatoire : ne le retirez pas.
              </p>
              <div className="rounded-xl bg-ink/5 p-3 text-sm">
                <p className="font-semibold">{outreach.subject}</p>
                <pre className="mt-2 font-sans whitespace-pre-wrap">{outreach.body}</pre>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={outreach.subject} label="Copier l'objet" />
                <CopyButton text={outreach.body} label="Copier l'e-mail" />
                <CopyButton text={outreach.sms} label="Copier le SMS" />
              </div>
              <form action={markContacted}>
                <input type="hidden" name="id" value={lead.id} />
                <SubmitButton>J&apos;ai envoyé le message</SubmitButton>
              </form>
              {lead.lastContactedAt && (
                <p className="text-sm text-ink/60">
                  Dernier contact : {dateFr.format(lead.lastContactedAt)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-ink/60">
              {optedOut ? "Aucun message possible." : "Disponible une fois l'aperçu généré."}
            </p>
          )}
        </section>

        <form action={updateLead} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <input type="hidden" name="id" value={lead.id} />
          <h2 className="font-semibold">Fiche</h2>
          <dl className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
            <dt className="text-ink/60">SIRET</dt>
            <dd>{lead.siret ?? "—"}</dd>
            <dt className="text-ink/60">Adresse</dt>
            <dd>{lead.address ?? "—"}</dd>
            <dt className="text-ink/60">Site actuel</dt>
            <dd>{lead.website ?? "—"}</dd>
          </dl>
          <label className="block text-sm">
            Téléphone pro
            <input name="phone" defaultValue={lead.phone ?? ""} className={input} />
          </label>
          <label className="block text-sm">
            E-mail pro
            <input name="email" type="email" defaultValue={lead.email ?? ""} className={input} />
          </label>
          <label className="block text-sm">
            Statut
            <select name="status" defaultValue={lead.status} disabled={optedOut} className={input}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Notes
            <textarea name="notes" rows={4} defaultValue={lead.notes ?? ""} className={input} />
          </label>
          <SubmitButton>Enregistrer</SubmitButton>
        </form>
      </div>
    </main>
  );
}
