import { z } from "zod";

/** Variables d'environnement validées au démarrage. Toutes facultatives en dev (mode mock). */
const EnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_CREATION: z.string().optional(),
  STRIPE_PRICE_HOSTING: z.string().optional(),
  ROOT_DOMAIN: z.string().default("localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  /** Nombre max de générations complètes par projet (protège le budget IA). */
  MAX_GENERATIONS_PER_PROJECT: z.coerce.number().int().positive().default(3),
});

export const env = EnvSchema.parse(process.env);

export const isMockAi = !env.ANTHROPIC_API_KEY;
