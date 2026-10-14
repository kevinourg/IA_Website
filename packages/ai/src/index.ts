import { AnthropicProvider, type AiProvider } from "./provider";
import { MockProvider } from "./mock";

export * from "./models";
export * from "./provider";
export * from "./pipeline";
export * from "./patch";
export { MockProvider } from "./mock";

let cached: AiProvider | undefined;

/** Fournisseur IA selon l'environnement : Claude si une clé est configurée, sinon simulation. */
export function getAiProvider(env: Record<string, string | undefined> = process.env): AiProvider {
  if (!cached) {
    cached = env.ANTHROPIC_API_KEY
      ? new AnthropicProvider(env.ANTHROPIC_API_KEY)
      : new MockProvider();
  }
  return cached;
}
