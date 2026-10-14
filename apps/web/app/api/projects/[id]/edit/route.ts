import { NextResponse } from "next/server";
import { z } from "zod";
import { editSite } from "@site-ia/ai";
import { ai, repo, trackUsage } from "@/lib/services";

const Body = z.object({ instruction: z.string().trim().min(3).max(1000) });

/**
 * Modification du site par message (« change mes horaires »).
 * Utilise le modèle rapide + des patchs JSON minimaux : coût très faible par modification.
 * TODO : authentifier le client propriétaire avant d'ouvrir cette route en production.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Demande invalide" }, { status: 400 });

  const spec = await repo().getLatestSpec(id);
  if (!spec) return NextResponse.json({ error: "Aucun site pour ce projet" }, { status: 404 });

  const result = await editSite(ai(), spec, parsed.data.instruction);
  await trackUsage(id, result.usage);
  if (result.applied) await repo().saveSiteVersion(id, result.spec, "edit");
  return NextResponse.json({ message: result.message, applied: result.applied });
}
