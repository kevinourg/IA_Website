import { NextResponse } from "next/server";
import { generateSite } from "@site-ia/ai";
import { BusinessBriefSchema, missingBriefFields, slugify } from "@site-ia/core";
import { env } from "@/lib/env";
import { ai, repo, trackUsage } from "@/lib/services";

// La génération complète peut prendre jusqu'à ~1 min avec le modèle "balanced".
export const maxDuration = 120;

const generationsCount = new Map<string, number>();

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await repo().getProject(id);
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  const missing = missingBriefFields(project.brief);
  if (missing.length) {
    return NextResponse.json({ error: "Informations manquantes", missing }, { status: 422 });
  }

  // Garde-fou budget : la génération est l'appel IA le plus coûteux.
  // TODO : persister ce compteur en base (aujourd'hui en mémoire, par instance).
  const count = generationsCount.get(id) ?? 0;
  if (count >= env.MAX_GENERATIONS_PER_PROJECT) {
    return NextResponse.json(
      { error: "Nombre maximum d'aperçus atteint pour ce projet" },
      { status: 429 },
    );
  }
  generationsCount.set(id, count + 1);

  const brief = BusinessBriefSchema.parse(project.brief);
  await repo().updateProject(id, { status: "generating" });
  try {
    const { spec, usages } = await generateSite(ai(), brief);
    await trackUsage(id, usages);
    await repo().saveSiteVersion(id, spec, "generate");
    await repo().updateProject(id, {
      status: "preview",
      slug: project.slug ?? `${slugify(brief.businessName)}-${id.slice(0, 4)}`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[generate]", err);
    await repo().updateProject(id, { status: "intake" });
    return NextResponse.json({ error: "La génération a échoué, réessayez." }, { status: 502 });
  }
}
