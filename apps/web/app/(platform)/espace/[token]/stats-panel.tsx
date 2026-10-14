import type { StatsSummary } from "@site-ia/core";

const dayFr = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (day: string) => dayFr.format(new Date(`${day}T00:00:00Z`));

/** Statistiques des 30 derniers jours : chiffres clés, visites par jour, pages et sources. */
export function StatsPanel({ stats, requests }: { stats: StatsSummary; requests: number }) {
  const { totals, daily, topPages, topSources } = stats;
  const max = Math.max(1, ...daily.map((d) => d.visits));
  const tiles = [
    { label: "Visites", value: totals.visit },
    { label: "Pages vues", value: totals.pageview },
    { label: "Appels (clics)", value: totals.call },
    { label: "E-mails (clics)", value: totals.email },
    { label: "Demandes reçues", value: requests },
  ];

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold">Statistiques — 30 derniers jours</h2>
      <p className="text-sm text-ink/50">
        Mesure anonyme, sans cookie. « Appels » et « E-mails » comptent les clics sur votre numéro
        et votre adresse.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-white p-4 shadow-sm">
            <dt className="text-sm text-ink/60">{t.label}</dt>
            <dd className="font-display text-3xl font-extrabold">{t.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-medium">Visites par jour</p>
        <div
          className="mt-3 flex h-32 items-end gap-[3px]"
          role="img"
          aria-label={`Visites par jour, de ${fmt(daily[0]!.day)} à ${fmt(daily.at(-1)!.day)}`}
        >
          {daily.map((d) => (
            <div
              key={d.day}
              title={`${fmt(d.day)} : ${d.visits} visite${d.visits > 1 ? "s" : ""}`}
              className="flex-1 rounded-t bg-brand/80 hover:bg-brand"
              style={{ height: `${Math.max(2, (d.visits / max) * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-ink/50">
          <span>{fmt(daily[0]!.day)}</span>
          <span>{fmt(daily.at(-1)!.day)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TopList title="Pages les plus vues" items={topPages} empty="Aucune page vue." />
        <TopList title="D'où viennent vos visiteurs" items={topSources} empty="Aucune visite." />
      </div>
    </section>
  );
}

function TopList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { key: string; count: number }[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-ink/50">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-4">
              <span className="truncate">{i.key}</span>
              <span className="font-semibold tabular-nums">{i.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
