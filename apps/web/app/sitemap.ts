import type { MetadataRoute } from "next";
import { CITIES, TRADES } from "@site-ia/core";
import { env } from "@/lib/env";

/** Plan du site de la plateforme (les sites clients ont chacun le leur). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL;
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/site-internet`, priority: 0.8 },
    ...TRADES.map((t) => ({ url: `${base}/site-internet/${t.slug}`, priority: 0.7 })),
    ...TRADES.flatMap((t) =>
      CITIES.map((c) => ({ url: `${base}/site-internet/${t.slug}/${c.slug}`, priority: 0.5 })),
    ),
  ];
}
