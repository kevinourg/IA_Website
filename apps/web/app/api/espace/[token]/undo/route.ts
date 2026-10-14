import { NextResponse } from "next/server";
import { repo } from "@/lib/services";

/** Annule la dernière modification : republie la version précédente (sans appel IA). */
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await repo().findProjectByToken(token);
  if (!project) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });

  const [, previous] = await repo().getLatestSpecs(project.id, 2);
  if (!previous) {
    return NextResponse.json({ error: "Aucune modification à annuler." }, { status: 409 });
  }
  await repo().saveSiteVersion(project.id, previous.spec, "undo");
  return NextResponse.json({ message: "La dernière modification a été annulée." });
}
