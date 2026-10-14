import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES, TRADES, findCity, findTrade } from "@site-ia/core";
import { TradeLanding } from "@/components/trade-landing";
import { BRAND } from "@/lib/brand";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRADES.flatMap((t) => CITIES.map((c) => ({ metier: t.slug, ville: c.slug })));
}

type Params = Promise<{ metier: string; ville: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { metier, ville } = await params;
  const trade = findTrade(metier);
  const city = findCity(ville);
  if (!trade || !city) return {};
  return {
    title: `Site internet pour ${trade.plural} à ${city.name} — ${BRAND.name}`,
    description: `Créez le site de votre activité de ${trade.label} à ${city.name} : aperçu gratuit, en ligne le jour même, optimisé pour les recherches locales.`,
    alternates: { canonical: `/site-internet/${trade.slug}/${city.slug}` },
  };
}

export default async function TradeCityPage({ params }: { params: Params }) {
  const { metier, ville } = await params;
  const trade = findTrade(metier);
  const city = findCity(ville);
  if (!trade || !city) notFound();
  return <TradeLanding trade={trade} city={city} />;
}
