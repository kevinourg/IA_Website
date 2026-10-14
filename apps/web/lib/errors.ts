/** Message d'erreur IA renvoyé au navigateur : détaillé en développement, générique en production. */
export function aiErrorMessage(err: unknown, fallback: string): string {
  if (process.env.NODE_ENV === "production") return fallback;
  const detail = err instanceof Error ? err.message : String(err);
  return `${fallback}\n\n[dev] ${detail.slice(0, 800)}`;
}
