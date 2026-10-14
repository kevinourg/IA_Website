import { NextResponse } from "next/server";
import { AttributionSchema } from "@site-ia/core";
import { repo } from "@/lib/services";

/** Démarre un projet. L'attribution (provenance du visiteur) est facultative et validée. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { attribution?: unknown };
  const attribution = AttributionSchema.safeParse(body?.attribution ?? undefined);
  const project = await repo().createProject({
    attribution: attribution.success ? attribution.data : undefined,
  });
  return NextResponse.json({ id: project.id }, { status: 201 });
}
