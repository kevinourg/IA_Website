import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { monthlyReportEmail } from "@/lib/email-templates";
import { env } from "@/lib/env";
import { repo } from "@/lib/services";
import { monthStats } from "@/lib/stats";
import { espaceUrl } from "@/lib/urls";

/** Mois précédent au format AAAA-MM (heure de Paris). */
function previousMonth(now = new Date()): string {
  const paris = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
  }).format(now);
  const [y, m] = paris.split("-").map(Number) as [number, number];
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

/**
 * Rapport mensuel envoyé à chaque client en ligne. À déclencher le 1er de chaque mois par une
 * tâche planifiée (ex. Vercel Cron) avec l'en-tête « Authorization: Bearer <CRON_SECRET> ».
 * Paramètre facultatif ?mois=AAAA-MM pour relancer un mois donné.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (
    env.CRON_SECRET ? auth !== `Bearer ${env.CRON_SECRET}` : process.env.NODE_ENV === "production"
  ) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const asked = new URL(req.url).searchParams.get("mois");
  const month = asked && /^\d{4}-\d{2}$/.test(asked) ? asked : previousMonth();
  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));

  let sent = 0;
  for (const project of await repo().listLiveProjects()) {
    if (!project.customerEmail) continue;
    const [stats, submissions, spec] = await Promise.all([
      monthStats(project.id, month),
      repo().listContactSubmissions(project.id),
      repo().getLatestSpec(project.id),
    ]);
    const requests = submissions.filter(
      (s) => s.createdAt.toISOString().slice(0, 7) === month,
    ).length;
    const ok = await sendEmail(
      monthlyReportEmail({
        to: project.customerEmail,
        businessName: spec?.business.name ?? project.brief.businessName ?? "votre site",
        monthLabel,
        visits: stats.totals.visit,
        pageviews: stats.totals.pageview,
        calls: stats.totals.call,
        emails: stats.totals.email,
        requests,
        topSources: stats.topSources.slice(0, 3),
        espaceUrl: espaceUrl(project.accessToken),
      }),
    );
    if (ok) sent++;
  }
  return NextResponse.json({ month, sent });
}
