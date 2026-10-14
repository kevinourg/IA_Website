import { NextResponse } from "next/server";
import { z } from "zod";
import { intakeTurn } from "@site-ia/ai";
import { ai, repo, trackUsage } from "@/lib/services";

const Body = z.object({ content: z.string().trim().min(1).max(2000) });
const MAX_USER_MESSAGES = 20;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message invalide" }, { status: 400 });

  const project = await repo().getProject(id);
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  if (project.status !== "intake" && project.status !== "preview") {
    return NextResponse.json({ error: "Ce projet n'accepte plus de messages" }, { status: 409 });
  }
  const userCount = project.conversation.filter((m) => m.role === "user").length;
  if (userCount >= MAX_USER_MESSAGES) {
    return NextResponse.json({ error: "Limite de messages atteinte" }, { status: 429 });
  }

  const history = [
    ...project.conversation,
    { role: "user" as const, content: parsed.data.content },
  ];
  const turn = await intakeTurn(ai(), history);
  await trackUsage(id, turn.usage);
  await repo().updateProject(id, {
    conversation: [...history, { role: "assistant", content: turn.reply }],
    brief: { ...project.brief, ...turn.brief },
  });

  return NextResponse.json({
    reply: turn.reply,
    readyToGenerate: turn.readyToGenerate,
    missing: turn.missing,
  });
}
