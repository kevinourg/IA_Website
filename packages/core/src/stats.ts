/**
 * Statistiques de visite des sites clients — anonymes par construction.
 * Aucune donnée personnelle n'est collectée (ni IP, ni identifiant, ni cookie) : seulement des
 * compteurs agrégés par jour. C'est ce qui permet l'exemption de consentement (CNIL, mesure
 * d'audience strictement nécessaire).
 */
export const STAT_KINDS = ["pageview", "visit", "call", "email"] as const;
export type StatKind = (typeof STAT_KINDS)[number];

/** Une ligne agrégée : nombre d'événements d'un type, un jour donné, pour une clé (page, source…). */
export type StatRow = { day: string; kind: StatKind; key: string; count: number };

export type StatsSummary = {
  totals: Record<StatKind, number>;
  /** Visites par jour, du plus ancien au plus récent (jours sans visite inclus). */
  daily: { day: string; visits: number }[];
  topPages: { key: string; count: number }[];
  topSources: { key: string; count: number }[];
};

/** Date du jour à Paris au format AAAA-MM-JJ. */
export function parisDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(date);
}

/** Les `n` derniers jours (inclus aujourd'hui), du plus ancien au plus récent. */
export function lastDays(n: number, today = new Date()): string[] {
  return Array.from({ length: n }, (_, i) =>
    parisDay(new Date(today.getTime() - (n - 1 - i) * 86_400_000)),
  );
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)qwant\.com$/, "Qwant"],
  [/(^|\.)ecosia\.org$/, "Ecosia"],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
  [/(^|\.)gemini\.google\.com$/, "Gemini"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)linkedin\.com$/, "LinkedIn"],
  [/(^|\.)(pagesjaunes\.fr)$/, "PagesJaunes"],
];

/** Classe un référent en source lisible (« Google », « Direct »…). Le domaine du site lui-même = navigation interne (null). */
export function classifySource(referrer: string, siteHost: string): string | null {
  if (!referrer) return "Direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "Direct";
  }
  if (
    host ===
    siteHost
      .toLowerCase()
      .replace(/:\d+$/, "")
      .replace(/^www\./, "")
  )
    return null;
  // Gemini avant Google (gemini.google.com)
  if (/(^|\.)gemini\.google\.com$/.test(host)) return "Gemini";
  for (const [re, name] of SOURCES) if (re.test(host)) return name;
  return host;
}

export function summarizeStats(rows: StatRow[], days: string[], topN = 5): StatsSummary {
  const inRange = new Set(days);
  const totals = { pageview: 0, visit: 0, call: 0, email: 0 } satisfies Record<StatKind, number>;
  const visitsByDay = new Map<string, number>();
  const pages = new Map<string, number>();
  const sources = new Map<string, number>();

  for (const r of rows) {
    if (!inRange.has(r.day)) continue;
    totals[r.kind] += r.count;
    if (r.kind === "visit") {
      visitsByDay.set(r.day, (visitsByDay.get(r.day) ?? 0) + r.count);
      if (r.key) sources.set(r.key, (sources.get(r.key) ?? 0) + r.count);
    }
    if (r.kind === "pageview") pages.set(r.key, (pages.get(r.key) ?? 0) + r.count);
  }

  const top = (m: Map<string, number>) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([key, count]) => ({ key, count }));

  return {
    totals,
    daily: days.map((day) => ({ day, visits: visitsByDay.get(day) ?? 0 })),
    topPages: top(pages),
    topSources: top(sources),
  };
}

/** Robots connus : on ne les compte pas. */
export function isBot(userAgent: string): boolean {
  return /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios/i.test(
    userAgent,
  );
}
