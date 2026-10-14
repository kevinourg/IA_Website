import "server-only";
import { lastDays, summarizeStats, type StatsSummary } from "@site-ia/core";
import { repo } from "./services";

/** Synthèse des statistiques d'un site sur les `days` derniers jours. */
export async function siteStats(projectId: string, days = 30): Promise<StatsSummary> {
  const range = lastDays(days);
  const rows = await repo().getStats(projectId, range[0]!);
  return summarizeStats(rows, range);
}

/** Synthèse sur un mois civil donné (AAAA-MM). */
export async function monthStats(projectId: string, month: string): Promise<StatsSummary> {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const range = Array.from(
    { length: count },
    (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
  );
  const rows = await repo().getStats(projectId, range[0]!);
  return summarizeStats(rows, range);
}

/** Nombre d'éléments datés des `days` derniers jours (ex. demandes reçues). */
export function countSince(items: { createdAt: Date }[], days: number, now = Date.now()): number {
  const since = now - days * 86_400_000;
  return items.filter((i) => i.createdAt.getTime() >= since).length;
}
