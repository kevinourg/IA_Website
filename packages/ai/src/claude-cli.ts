import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { z } from "zod";
import { TASK_TIER, type ModelTier } from "./models";
import { toInputSchema, type AiProvider, type StructuredRequest } from "./provider";

/**
 * Fournisseur « abonnement » : passe par la ligne de commande Claude Code (`claude -p`),
 * connectée à l'abonnement Claude du développeur.
 *
 * ⚠️ DÉVELOPPEMENT LOCAL UNIQUEMENT. Anthropic n'autorise pas un produit à utiliser une
 * connexion claude.ai pour servir ses clients : en production, seule la clé API est permise.
 * `getAiProvider()` refuse ce mode quand NODE_ENV=production.
 *
 * Prérequis : Claude Code installé et connecté (`claude`, puis `/login`).
 */
const CLI_MODEL: Record<ModelTier, string> = { fast: "haiku", balanced: "sonnet", premium: "opus" };
const TIMEOUT_MS = 5 * 60_000;

type CliResult = {
  is_error?: boolean;
  result?: string;
  structured_output?: unknown;
  usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number };
};

function run(command: string, args: string[], input: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGINT");
      reject(new Error("Claude Code n'a pas répondu à temps (5 min)"));
    }, TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      reject(
        new Error(
          e.code === "ENOENT" || e.code === "EINVAL"
            ? `Impossible de lancer « ${command} ». Installe Claude Code, ou indique le chemin complet de l'exécutable dans CLAUDE_CLI_PATH (sous Windows : le fichier claude.exe).`
            : e.message,
        ),
      );
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0 || out.trim().startsWith("{")) resolve(out);
      else reject(new Error(`Claude Code a échoué (code ${code}) : ${err || out}`));
    });
    child.stdin.end(input);
  });
}

export class ClaudeCliProvider implements AiProvider {
  readonly name = "claude-cli";

  constructor(private command: string = "claude") {}

  async structured<T extends z.ZodType>(req: StructuredRequest<T>) {
    const tier = TASK_TIER[req.task];
    const model = CLI_MODEL[tier];
    // Dossier temporaire vide : n'embarque ni CLAUDE.md, ni hooks, ni MCP du projet.
    const dir = await mkdtemp(join(tmpdir(), "site-ia-cli-"));
    try {
      const systemFile = join(dir, "system.md");
      await writeFile(
        systemFile,
        `${req.system}\n\nRéponds uniquement via la sortie structurée demandée (${req.toolName} : ${req.toolDescription}).`,
      );
      const conversation = req.messages
        .map((m) => `${m.role === "user" ? "### Client" : "### Assistant"}\n${m.content}`)
        .join("\n\n");

      const out = await run(
        this.command,
        [
          "-p",
          "--output-format",
          "json",
          "--json-schema",
          JSON.stringify(toInputSchema(req.schema)),
          "--model",
          model,
          "--system-prompt-file",
          systemFile,
          "--tools",
          "",
          "--strict-mcp-config",
        ],
        conversation,
        dir,
      );

      const res = JSON.parse(out) as CliResult;
      if (res.is_error || res.structured_output === undefined) {
        throw new Error(`Claude Code : ${res.result ?? "pas de sortie structurée"}`);
      }
      return {
        data: req.schema.parse(res.structured_output),
        usage: {
          task: req.task,
          model: `cli:${model}`,
          inputTokens: res.usage?.input_tokens ?? 0,
          outputTokens: res.usage?.output_tokens ?? 0,
          cacheReadTokens: res.usage?.cache_read_input_tokens ?? 0,
        },
      };
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
}
