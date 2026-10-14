import type { Metadata } from "next";
import Link from "next/link";
import { CITIES, TRADES } from "@site-ia/core";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Site internet par métier — ${BRAND.name}`,
  description:
    "Sites internet conçus pour les artisans, commerçants et indépendants : plombiers, électriciens, coiffeurs, garagistes… Aperçu gratuit, en ligne le jour même.",
};

export default function TradesIndex() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/" className="font-display text-2xl font-extrabold">
        {BRAND.name}
      </Link>
      <h1 className="font-display mt-10 text-4xl font-extrabold md:text-5xl">
        Un site internet pensé pour votre métier
      </h1>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRADES.map((t) => (
          <li key={t.slug} className="rounded-2xl bg-white p-5 shadow-sm">
            <Link
              href={`/site-internet/${t.slug}`}
              className="text-lg font-semibold hover:text-brand"
            >
              Site internet pour {t.plural}
            </Link>
            <p className="mt-2 line-clamp-3 text-sm text-ink/60">{t.pitch}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-14 text-lg font-semibold">Par ville</h2>
      <p className="mt-2 text-sm text-ink/60">{CITIES.map((c) => c.name).join(" · ")}</p>
    </main>
  );
}
