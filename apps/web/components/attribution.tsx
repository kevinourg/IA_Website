"use client";

import { useEffect } from "react";

const KEY = "siteia_attribution";

/**
 * Mémorise la provenance du visiteur (utm_*, ref, page d'arrivée) pour la durée de l'onglet.
 * sessionStorage, pas de cookie : rien n'est conservé après la fermeture de l'onglet.
 * Première source de la session conservée, sauf si une nouvelle URL porte des paramètres utm/ref.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const p = url.searchParams;
      const tagged = ["utm_source", "utm_medium", "utm_campaign", "ref"].some((k) => p.has(k));
      if (!tagged && sessionStorage.getItem(KEY)) return;
      const pick = (k: string) => p.get(k)?.slice(0, 100) || undefined;
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          source: pick("utm_source"),
          medium: pick("utm_medium"),
          campaign: pick("utm_campaign"),
          ref: pick("ref"),
          landing: url.pathname.slice(0, 300),
        }),
      );
    } catch {
      /* stockage indisponible : pas d'attribution */
    }
  }, []);
  return null;
}

export function readAttribution(): unknown {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}
