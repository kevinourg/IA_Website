import { z } from "zod";
import { resolveProviderName } from "@site-ia/ai";

/** Variables d'environnement validées au démarrage. Toutes facultatives en dev (mode mock). */
const EnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().optional(),
  /** "claude-cli" = abonnement Claude via Claude Code (dev local uniquement). */
  AI_PROVIDER: z.enum(["anthropic", "claude-cli", "mock"]).optional(),
  CLAUDE_CLI_PATH: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_CREATION: z.string().optional(),
  STRIPE_PRICE_HOSTING: z.string().optional(),
  /** E-mails : sans clé, ils s'affichent sur /dev/emails au lieu d'être envoyés. */
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("SiteIA <onboarding@resend.dev>"),
  ROOT_DOMAIN: z.string().default("localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  /** Nombre max de générations complètes par projet (protège le budget IA). */
  MAX_GENERATIONS_PER_PROJECT: z.coerce.number().int().positive().default(3),
});

export const env = EnvSchema.parse(process.env);

export const aiProviderName = resolveProviderName(process.env);
