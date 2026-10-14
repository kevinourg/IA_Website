import Link from "next/link";
import {
  CITIES,
  OFFER,
  TRADES,
  formatEuros,
  withArticle,
  type City,
  type Trade,
} from "@site-ia/core";
import { BRAND } from "@/lib/brand";
import { env } from "@/lib/env";

/** Page d'acquisition « site internet pour <métier> [à <ville>] ». */
export function TradeLanding({ trade, city }: { trade: Trade; city?: City }) {
  const where = city ? ` à ${city.name}` : "";
  const prompt = `Je suis ${trade.label}${where}. `;
  const faq = [
    ...trade.faq,
    {
      q: "Combien coûte le site ?",
      a: `${formatEuros(OFFER.creation.amountCents)} pour la création, puis ${formatEuros(OFFER.hosting.amountCents)} par mois pour l'hébergement et les modifications, sans engagement. L'aperçu est gratuit.`,
    },
    ...(city
      ? [
          {
            q: `Le site m'aidera-t-il à être trouvé à ${city.name} ?`,
            a: `Votre site est construit pour les recherches locales : votre ville, vos communes d'intervention et vos coordonnées sont mises en avant et déclarées dans les données lues par Google et les assistants IA.`,
          },
        ]
      : []),
  ];
  const url = `${env.NEXT_PUBLIC_APP_URL}/site-internet/${trade.slug}${city ? `/${city.slug}` : ""}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Création de site internet pour ${trade.plural}${where}`,
      provider: { "@type": "Organization", name: BRAND.name },
      areaServed: city
        ? { "@type": "City", name: city.name }
        : { "@type": "Country", name: "France" },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="font-display text-2xl font-extrabold">
          {BRAND.name}
        </Link>
        <Link
          href={`/creer?q=${encodeURIComponent(prompt)}`}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper"
        >
          Créer mon site
        </Link>
      </header>

      <nav aria-label="Fil d'Ariane" className="mx-auto max-w-6xl px-5 text-sm text-ink/50">
        <Link href="/site-internet">Sites par métier</Link> ›{" "}
        {city ? (
          <>
            <Link href={`/site-internet/${trade.slug}`}>{trade.plural}</Link> › {city.name}
          </>
        ) : (
          trade.plural
        )}
      </nav>

      <section className="mx-auto max-w-6xl px-5 pt-8 pb-16">
        <h1 className="font-display max-w-4xl text-4xl leading-tight font-extrabold md:text-6xl">
          Site internet pour {trade.plural}
          {where}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-ink/75">{trade.pitch}</p>
        <form action="/creer" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input
            name="q"
            defaultValue={prompt}
            aria-label="Décrivez votre activité"
            className="flex-1 rounded-2xl border border-ink/15 bg-white px-5 py-4 shadow-sm outline-none focus:border-brand"
          />
          <button className="rounded-2xl bg-brand px-6 py-4 font-semibold text-white hover:bg-brand-dark">
            Voir mon site →
          </button>
        </form>
        <p className="mt-3 text-sm text-ink/50">Aperçu gratuit · Sans carte bancaire</p>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-extrabold">
              Ce que contient votre site de {trade.label}
            </h2>
            <ul className="mt-6 space-y-2">
              {trade.pages.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-brand">✓</span> {p}
                </li>
              ))}
              <li className="flex gap-2">
                <span className="text-brand">✓</span> Mentions légales et formulaire de contact
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold">Comment ça marche</h2>
            <ol className="mt-6 space-y-4">
              <li>
                <strong>1. Décrivez votre activité</strong> en quelques phrases : prestations,
                communes, coordonnées.
              </li>
              <li>
                <strong>2. Découvrez votre site</strong>, conçu pour {withArticle(trade)}
                {where}, avant de payer quoi que ce soit.
              </li>
              <li>
                <strong>3. Mise en ligne le jour même</strong>, puis modifications par simple
                message.
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="font-display text-3xl font-extrabold">Questions fréquentes</h2>
        <div className="mt-6 divide-y divide-ink/10">
          {faq.map((f) => (
            <details key={f.q} className="py-4">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 text-sm md:grid-cols-2">
          <div>
            <h2 className="font-semibold">
              Site internet pour {trade.plural} dans d&apos;autres villes
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-ink/70">
              {CITIES.filter((c) => c.slug !== city?.slug).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/site-internet/${trade.slug}/${c.slug}`}
                    className="hover:text-brand"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Autres métiers{where}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-ink/70">
              {TRADES.filter((t) => t.slug !== trade.slug).map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/site-internet/${t.slug}${city ? `/${city.slug}` : ""}`}
                    className="hover:text-brand"
                  >
                    {t.plural}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-ink/60">
        © {new Date().getFullYear()} {BRAND.name} · <Link href="/">Accueil</Link>
      </footer>
    </main>
  );
}
