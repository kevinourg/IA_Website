import { AnthropicProvider, type AiProvider } from "./provider";
import { ClaudeCliProvider } from "./claude-cli";
import { MockProvider } from "./mock";

export * from "./models";
export * from "./provider";
export * from "./pipeline";
export * from "./patch";
export { MockProvider } from "./mock";
export { ClaudeCliProvider, checkClaudeCli, resolveClaudeLauncher } from "./claude-cli";

export type AiProviderName = "anthropic" | "claude-cli" | "mock";

/**
 * Choix du fournisseur IA :
 *  - AI_PROVIDER=claude-cli → abonnement Claude via Claude Code (dev local uniquement)
 *  - ANTHROPIC_API_KEY défini → API Claude
 *  - sinon → simulation
 */
export function resolveProviderName(env: Record<string, string | undefined>): AiProviderName {
  if (env.AI_PROVIDER === "claude-cli") {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "AI_PROVIDER=claude-cli est réservé au développement local : utilise ANTHROPIC_API_KEY en production.",
      );
    }
    return "claude-cli";
  }
  if (env.AI_PROVIDER === "mock") return "mock";
  return env.ANTHROPIC_API_KEY ? "anthropic" : "mock";
}

let cached: AiProvider | undefined;

export function getAiProvider(env: Record<string, string | undefined> = process.env): AiProvider {
  if (!cached) {
    const name = resolveProviderName(env);
    cached =
      name === "claude-cli"
        ? new ClaudeCliProvider(env.CLAUDE_CLI_PATH || "claude")
        : name === "anthropic"
          ? new AnthropicProvider(env.ANTHROPIC_API_KEY!)
          : new MockProvider();
  }
  return cached;
}
