import type { z } from "zod";
import { sampleBrief, sampleSpec } from "@site-ia/core/fixtures";
import type { AiProvider, StructuredRequest } from "./provider";

/**
 * Fournisseur simulé : aucun appel réseau, aucun coût.
 * Utilisé automatiquement en dev quand ANTHROPIC_API_KEY est absent, et dans les tests.
 */
export class MockProvider implements AiProvider {
  readonly name = "mock";

  async structured<T extends z.ZodType>(req: StructuredRequest<T>) {
    const usage = {
      task: req.task,
      model: "mock",
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
    };
    const turns = req.messages.filter((m) => m.role === "user").length;
    let raw: unknown;
    switch (req.task) {
      case "intake":
        raw =
          turns < 2
            ? {
                reply:
                  "Merci ! Quelles sont vos principales prestations, et sur quel numéro vos clients peuvent-ils vous joindre ?",
                brief: { trade: sampleBrief.trade, city: sampleBrief.city },
                readyToGenerate: false,
              }
            : {
                reply: "Parfait, j'ai tout ce qu'il faut. Je peux générer votre aperçu.",
                brief: sampleBrief,
                readyToGenerate: true,
              };
        break;
      case "generate":
        raw = sampleSpec;
        break;
      case "edit":
        raw = {
          message: "C'est fait (simulation).",
          operations: [{ path: "/pages/0/sections/0/title", value: "Titre modifié (mock)" }],
        };
        break;
      default:
        raw = {};
    }
    return { data: req.schema.parse(raw), usage };
  }
}
