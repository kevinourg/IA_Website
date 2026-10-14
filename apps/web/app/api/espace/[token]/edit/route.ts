import { NextResponse } from "next/server";
import { z } from "zod";
import { editSite } from "@site-ia/ai";
import { aiErrorMessage } from "@/lib/errors";
import { ai, repo, trackUsage } from "@/lib/services";

const Body = z.object({ instruction: z.string().trim().min(3).max(1000) });

/**
 * Modification du site par message (« change mes horaires »), depuis l'espace client.
 * Accès protégé par le jeton secret du lien privé. Modèle rapide + patchs JSON : coût minimal.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await repo().findProjectByToken(token);
  if (!project) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Décrivez la modification souhaitée." }, { status: 400 });
  }

  const spec = await repo().getLatestSpec(project.id);
  if (!spec) return NextResponse.json({ error: "Aucun site pour ce projet" }, { status: 404 });

  try {
    const result = await editSite(ai(), spec, parsed.data.instruction);
    await trackUsage(project.id, result.usage);
    if (result.applied) await repo().saveSiteVersion(project.id, result.spec, "edit");
    return NextResponse.json({ message: result.message, applied: result.applied });
  } catch (err) {
    console.error("[edit]", err);
    return NextResponse.json(
      { error: aiErrorMessage(err, "La modification n'a pas pu être faite, réessayez.") },
      { status: 502 },
    );
  }
}
