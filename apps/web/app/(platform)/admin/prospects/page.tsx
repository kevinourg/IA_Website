import Link from "next/link";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, TRADES, type LeadStatus } from "@site-ia/core";
import { SubmitButton } from "@/components/admin-ui";
import { repo } from "@/lib/services";
import { addLead, importAnnuaire, importCsv } from "../actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border border-ink/15 bg-white px-3 py-2";
const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" });

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; msg?: string }>;
}) {
  const { statut, msg } = await searchParams;
  const status = LEAD_STATUSES.includes(statut as LeadStatus) ? (statut as LeadStatus) : undefined;
  const leads = await repo().listLeads({ status });

  return (
    <main>
      <h1 className="font-display text-3xl font-extrabold">Prospects</h1>
      {msg && (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 shadow-sm" role="status">
          {msg}
        </p>
      )}

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/prospects"
          className={`rounded-full px-3 py-1 ${!status ? "bg-ink text-paper" : "bg-white"}`}
        >
          Tous
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/prospects?statut=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-ink text-paper" : "bg-white"}`}
          >
            {LEAD_STATUS_LABELS[s]}
          </Link>
        ))}
      </nav>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Métier</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Ajouté</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink/50">
                  Aucun prospect. Ajoutez-en ci-dessous.
                </td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/prospects/${l.id}`} className="hover:text-brand">
                    {l.businessName}
                  </Link>
                </td>
                <td className="px-4 py-3">{l.trade ?? "—"}</td>
                <td className="px-4 py-3">{l.city ?? "—"}</td>
                <td className="px-4 py-3">{LEAD_STATUS_LABELS[l.status]}</td>
                <td className="px-4 py-3 text-ink/60">{l.source}</td>
                <td className="px-4 py-3 text-ink/60">{dateFr.format(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <form action={importAnnuaire} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Importer depuis l&apos;annuaire des entreprises</h2>
          <p className="text-sm text-ink/60">
            Source officielle et gratuite (données SIRENE) : nom, adresse, SIRET. Aucune coordonnée
            personnelle.
          </p>
          <select name="trade" className={input} required defaultValue="">
            <option value="" disabled>
              Métier…
            </option>
            {TRADES.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.plural} ({t.naf})
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input name="departement" placeholder="Département (ex. 69)" className={input} />
            <input name="codePostal" placeholder="ou code postal" className={input} />
          </div>
          <select name="pages" className={input} defaultValue="1">
            <option value="1">25 premiers résultats</option>
            <option value="2">50 résultats</option>
            <option value="4">100 résultats</option>
          </select>
          <SubmitButton pending="Import en cours…">Importer</SubmitButton>
        </form>

        <form action={addLead} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Ajouter un prospect</h2>
          <input
            name="businessName"
            required
            placeholder="Nom de l'entreprise *"
            className={input}
          />
          <div className="grid grid-cols-2 gap-2">
            <input name="trade" placeholder="Métier (ex. plombier)" className={input} />
            <input name="city" placeholder="Ville" className={input} />
            <input name="phone" placeholder="Téléphone pro" className={input} />
            <input name="email" type="email" placeholder="E-mail pro" className={input} />
          </div>
          <input
            name="source"
            placeholder="Source (ex. salon, bouche-à-oreille)"
            className={input}
          />
          <SubmitButton>Ajouter</SubmitButton>
        </form>

        <form action={importCsv} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Coller une liste</h2>
          <p className="text-sm text-ink/60">
            Une ligne par prospect, colonnes séparées par « ; » (ou copiées depuis Excel) :
            <br />
            <code>nom ; métier ; ville ; téléphone ; e-mail</code>
          </p>
          <textarea name="csv" rows={5} required className={input} />
          <input name="source" placeholder="Source (ex. liste-salon-2026)" className={input} />
          <SubmitButton pending="Import…">Importer</SubmitButton>
        </form>
      </div>
    </main>
  );
}
