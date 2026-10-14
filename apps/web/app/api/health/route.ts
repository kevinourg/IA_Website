import { NextResponse } from "next/server";
import { checkClaudeCli } from "@site-ia/ai";
import { aiProviderName, env } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    ai: aiProviderName,
    // En mode abonnement, vérifie que Claude Code se lance bien sur cette machine.
    claudeCli: aiProviderName === "claude-cli" ? checkClaudeCli(env.CLAUDE_CLI_PATH) : undefined,
    db: env.DATABASE_URL ? "postgres" : "memory",
    payments: env.STRIPE_SECRET_KEY ? "stripe" : "disabled",
  });
}
