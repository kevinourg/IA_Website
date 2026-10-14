/** Cycle de vie d'un projet client. */
export const PROJECT_STATUSES = [
  "intake", // conversation en cours
  "generating", // génération de l'aperçu
  "preview", // aperçu prêt, non payé
  "paid", // création payée, mise en ligne en cours
  "live", // site en ligne
  "suspended", // abonnement arrêté
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

const TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  intake: ["generating"],
  generating: ["preview", "intake"],
  preview: ["generating", "paid"],
  paid: ["live"],
  live: ["suspended"],
  suspended: ["live"],
};

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export type ChatMessage = { role: "user" | "assistant"; content: string };
