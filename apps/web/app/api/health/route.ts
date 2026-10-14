import { NextResponse } from "next/server";
import { env, isMockAi } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    ai: isMockAi ? "mock" : "anthropic",
    db: env.DATABASE_URL ? "postgres" : "memory",
    payments: env.STRIPE_SECRET_KEY ? "stripe" : "disabled",
  });
}
