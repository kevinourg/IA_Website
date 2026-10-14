import { z } from "zod";

/**
 * Attribution : d'où vient un client (publicité, page SEO, prospection, partenaire…).
 * Capturée à l'arrivée sur la plateforme depuis l'URL (utm_*, ref), sans cookie.
 */
export const AttributionSchema = z.object({
  source: z.string().max(100).optional(),
  medium: z.string().max(100).optional(),
  campaign: z.string().max(200).optional(),
  ref: z.string().max(100).optional(),
  /** Première page vue sur la plateforme (ex. /site-internet/plombier/lyon). */
  landing: z.string().max(300).optional(),
});
export type Attribution = z.infer<typeof AttributionSchema>;

/** Lit l'attribution d'une URL (utm_source, utm_medium, utm_campaign, ref). */
export function attributionFromUrl(url: URL): Attribution {
  const p = url.searchParams;
  const pick = (k: string) => p.get(k)?.trim().slice(0, 100) || undefined;
  return {
    source: pick("utm_source"),
    medium: pick("utm_medium"),
    campaign: pick("utm_campaign"),
    ref: pick("ref"),
    landing: url.pathname.slice(0, 300),
  };
}

/**
 * Canal lisible pour les tableaux de bord : la source explicite d'abord, puis le parrain,
 * puis le type de page d'arrivée, sinon « Direct ».
 */
export function channelOf(a: Attribution | null | undefined): string {
  if (!a) return "Direct";
  if (a.source) return a.medium ? `${a.source} / ${a.medium}` : a.source;
  if (a.ref) return `Parrainage : ${a.ref}`;
  if (a.landing?.startsWith("/site-internet")) return "SEO (pages métier)";
  return "Direct";
}
