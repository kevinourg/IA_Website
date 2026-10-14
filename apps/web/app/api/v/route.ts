import { NextResponse } from "next/server";
import { z } from "zod";
import { classifySource, isBot, parisDay, type StatKind } from "@site-ia/core";
import { env } from "@/lib/env";
import { repo } from "@/lib/services";

const Beacon = z.object({
  k: z.enum(["pageview", "call", "email"]),
  p: z.string().max(300).default("/"),
  r: z.string().max(1000).optional(),
  n: z.boolean().optional(),
});

const noContent = () => new NextResponse(null, { status: 204 });

/**
 * Point de collecte de la mesure d'audience des sites clients.
 * Ne stocke AUCUNE donnée personnelle : ni IP, ni user-agent, ni identifiant — seulement
 * l'incrément de compteurs journaliers (page vue, visite par source, clic téléphone / e-mail).
 */
export async function POST(req: Request) {
  if (isBot(req.headers.get("user-agent") ?? "")) return noContent();
  const host = (req.headers.get("host") ?? "").toLowerCase();

  const raw = await req.text();
  if (raw.length > 2000) return noContent();
  let parsed;
  try {
    parsed = Beacon.safeParse(JSON.parse(raw));
  } catch {
    return noContent();
  }
  if (!parsed.success) return noContent();

  const project = await repo().findProjectByHost(host, env.ROOT_DOMAIN);
  if (!project || project.status !== "live") return noContent();

  const { k, p, r, n } = parsed.data;
  const events: { kind: StatKind; key: string }[] = [];
  if (k === "pageview") {
    const path = p.length > 1 ? p.replace(/\/+$/, "") : "/";
    events.push({ kind: "pageview", key: path });
    if (n) events.push({ kind: "visit", key: classifySource(r ?? "", host) ?? "Direct" });
  } else {
    events.push({ kind: k, key: "" });
  }
  await repo().recordStats(project.id, parisDay(), events);
  return noContent();
}
