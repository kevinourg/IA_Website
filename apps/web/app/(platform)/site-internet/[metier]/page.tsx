import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TRADES, findTrade } from "@site-ia/core";
import { TradeLanding } from "@/components/trade-landing";
import { BRAND } from "@/lib/brand";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRADES.map((t) => ({ metier: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ metier: string }>;
}): Promise<Metadata> {
  const trade = findTrade((await params).metier);
  if (!trade) return {};
  return {
    title: `Site internet pour ${trade.plural} — ${BRAND.name}`,
    description: `Site internet professionnel pour ${trade.plural}, conçu par IA : aperçu gratuit, en ligne le jour même, référencement local inclus.`,
    alternates: { canonical: `/site-internet/${trade.slug}` },
  };
}

export default async function TradePage({ params }: { params: Promise<{ metier: string }> }) {
  const trade = findTrade((await params).metier);
  if (!trade) notFound();
  return <TradeLanding trade={trade} />;
}
