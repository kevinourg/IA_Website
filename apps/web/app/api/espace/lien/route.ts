import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { accessLinksEmail } from "@/lib/email-templates";
import { repo } from "@/lib/services";
import { espaceUrl } from "@/lib/urls";

const Body = z.object({ email: z.string().trim().toLowerCase().email() });

/** Anti-abus simple : un envoi par adresse et par minute (par instance). */
const lastSent = new Map<string, number>();

/**
 * « J'ai perdu mon lien » : renvoie par e-mail les liens des espaces liés à cette adresse.
 * La réponse est toujours identique, que l'adresse soit connue ou non (pas de fuite d'info).
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse e-mail invalide" }, { status: 400 });
  }
  const { email } = parsed.data;
  const ok = NextResponse.json({
    message:
      "Si cette adresse correspond à un site, vous allez recevoir un e-mail avec votre lien.",
  });

  const now = Date.now();
  if (now - (lastSent.get(email) ?? 0) < 60_000) return ok;
  lastSent.set(email, now);

  const projects = (await repo().findProjectsByEmail(email)).filter((p) =>
    ["paid", "live", "suspended"].includes(p.status),
  );
  if (projects.length > 0) {
    await sendEmail(
      accessLinksEmail({
        to: email,
        sites: projects.map((p) => ({
          businessName: p.legal?.legalName ?? p.brief.businessName ?? "Mon site",
          espaceUrl: espaceUrl(p.accessToken),
        })),
      }),
    );
  }
  return ok;
}
