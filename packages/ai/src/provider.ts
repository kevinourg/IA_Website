import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ChatMessage } from "@site-ia/core";
import { modelFor, type AiTask } from "./models";

export type Usage = {
  task: AiTask;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
};

export type StructuredRequest<T extends z.ZodType> = {
  task: AiTask;
  /** Partie stable du prompt — mise en cache côté API (prompt caching). */
  system: string;
  messages: ChatMessage[];
  schema: T;
  toolName: string;
  toolDescription: string;
};

export interface AiProvider {
  readonly name: string;
  structured<T extends z.ZodType>(
    req: StructuredRequest<T>,
  ): Promise<{ data: z.infer<T>; usage: Usage }>;
}

/** Convertit un schéma zod en JSON Schema pour l'outil (format attendu par l'API). */
export function toInputSchema(schema: z.ZodType): Anthropic.Tool.InputSchema {
  const json = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }) as Record<
    string,
    unknown
  >;
  delete json.$schema;
  return json as Anthropic.Tool.InputSchema;
}

/**
 * Fournisseur Claude. Sortie structurée obtenue en forçant l'appel d'un outil unique :
 * la réponse est un objet JSON, validé ensuite par zod.
 */
export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async structured<T extends z.ZodType>(req: StructuredRequest<T>) {
    const { model, maxTokens } = modelFor(req.task);
    const res = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
      tools: [
        {
          name: req.toolName,
          description: req.toolDescription,
          input_schema: toInputSchema(req.schema),
        },
      ],
      tool_choice: { type: "tool", name: req.toolName },
    });

    const block = res.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") {
      throw new Error(`Réponse IA sans sortie structurée (stop_reason=${res.stop_reason})`);
    }
    const data = req.schema.parse(block.input);
    return {
      data,
      usage: {
        task: req.task,
        model,
        inputTokens: res.usage.input_tokens,
        outputTokens: res.usage.output_tokens,
        cacheReadTokens: res.usage.cache_read_input_tokens ?? 0,
      },
    };
  }
}
