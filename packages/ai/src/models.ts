/**
 * Routage des modèles : chaque tâche utilise le modèle le moins cher qui la fait bien.
 *
 *  fast      → conversation d'accueil, extraction du brief, petites modifications (volume élevé, coût minimal)
 *  balanced  → génération complète du site (une fois par aperçu, qualité rédactionnelle importante)
 *  premium   → réservé : refonte complète / cas difficiles, jamais par défaut
 *
 * Les identifiants sont surchargeables par variables d'environnement pour changer de modèle sans code.
 */
export type ModelTier = "fast" | "balanced" | "premium";

export type AiTask = "intake" | "generate" | "edit" | "review";

export const TASK_TIER: Record<AiTask, ModelTier> = {
  intake: "fast",
  generate: "balanced",
  edit: "fast",
  review: "fast",
};

export const TASK_MAX_TOKENS: Record<AiTask, number> = {
  intake: 1500,
  generate: 12000,
  edit: 2000,
  review: 1000,
};

const DEFAULT_MODELS: Record<ModelTier, string> = {
  fast: "claude-haiku-5-5",
  balanced: "claude-sonnet-5-5",
  premium: "claude-opus-5-5",
};

export function modelFor(task: AiTask, env: Record<string, string | undefined> = process.env) {
  const tier = TASK_TIER[task];
  const override = env[`AI_MODEL_${tier.toUpperCase()}`];
  return { tier, model: override || DEFAULT_MODELS[tier], maxTokens: TASK_MAX_TOKENS[task] };
}
