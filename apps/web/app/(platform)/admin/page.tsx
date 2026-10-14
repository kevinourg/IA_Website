import Link from "next/link";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, channelOf, type ProjectStatus } from "@site-ia/core";
import { repo } from "@/lib/services";

export const dynamic = "force-dynamic";

const REACHED_PREVIEW: ProjectStatus[] = ["preview", "paid", "live", "suspended"];
const PAID: ProjectStatus[] = ["paid", "live", "suspended"];

/** Tableau de bord : entonnoir de conversion par canal d'acquisition + pipeline prospects. */
export default async function AdminHome() {
  const [projects, leads] = await Promise.all([repo().listProjects(), repo().listLeads()]);

  const byChannel = new Map<string, { started: number; preview: number; paid: number }>();
  for (const p of projects) {
    const key = channelOf(p.attribution);
    const row = byChannel.get(key) ?? { started: 0, preview: 0, paid: 0 };
    row.started++;
    if (REACHED_PREVIEW.includes(p.status)) row.preview++;
    if (PAID.includes(p.status)) row.paid++;
    byChannel.set(key, row);
  }
  const channels = [...byChannel.entries()].sort(
    (a, b) => b[1].paid - a[1].paid || b[1].started - a[1].started,
  );
  const total = channels.reduce(
    (t, [, r]) => ({
      started: t.started + r.started,
      preview: t.preview + r.preview,
      paid: t.paid + r.paid,
    }),
    { started: 0, preview: 0, paid: 0 },
  );
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "—");

  return (
    <main>
      <h1 className="font-display text-3xl font-extrabold">Tableau de bord</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Entonnoir par canal</h2>
        <p className="text-sm text-ink/60">
          Projets démarrés → aperçus générés → sites commandés, selon la provenance du client.
        </p>
        <table className="mt-4 w-full overflow-hidden rounded-2xl bg-white text-sm shadow-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-4 py-3">Canal</th>
              <th className="px-4 py-3 text-right">Démarrés</th>
              <th className="px-4 py-3 text-right">Aperçus</th>
              <th className="px-4 py-3 text-right">Commandés</th>
              <th className="px-4 py-3 text-right">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {channels.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/50">
                  Aucun projet pour l&apos;instant.
                </td>
              </tr>
            )}
            {channels.map(([channel, r]) => (
              <tr key={channel} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium">{channel}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.started}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.preview}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.paid}</td>
                <td className="px-4 py-3 text-right tabular-nums">{pct(r.paid, r.started)}</td>
              </tr>
            ))}
            {channels.length > 1 && (
              <tr className="border-t border-ink/10 font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{total.started}</td>
                <td className="px-4 py-3 text-right tabular-nums">{total.preview}</td>
                <td className="px-4 py-3 text-right tabular-nums">{total.paid}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {pct(total.paid, total.started)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-ink/50">
          Pour suivre une campagne, ajoutez à vos liens <code>?utm_source=…&amp;utm_medium=…</code>{" "}
          ou <code>?ref=nom-du-partenaire</code>.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Prospects</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {LEAD_STATUSES.map((s) => (
            <li key={s}>
              <Link
                href={`/admin/prospects?statut=${s}`}
                className="block rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-brand"
              >
                <span className="text-sm text-ink/60">{LEAD_STATUS_LABELS[s]}</span>
                <span className="font-display block text-3xl font-extrabold">
                  {leads.filter((l) => l.status === s).length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
