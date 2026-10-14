import { NextResponse } from "next/server";
import { aiProviderName, env } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    ai: aiProviderName,
    db: env.DATABASE_URL ? "postgres" : "memory",
    payments: env.STRIPE_SECRET_KEY ? "stripe" : "disabled",
  });
}
