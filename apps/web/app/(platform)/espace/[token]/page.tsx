import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ProjectStatus } from "@site-ia/core";
import { BRAND } from "@/lib/brand";
import { repo } from "@/lib/services";
import { clientSiteUrl } from "@/lib/urls";
import { EditPanel } from "./edit-panel";

export const metadata: Metadata = {
  title: "Mon espace",
  robots: { index: false, follow: false },
  referrer: "no-referrer", // le jeton est dans l'URL : ne pas le transmettre aux sites visités
};

const STATUS: Record<ProjectStatus, string> = {
  intake: "En préparation",
  generating: "En préparation",
  preview: "Aperçu, pas encore en ligne",
  paid: "Mise en ligne en cours",
  live: "En ligne",
  suspended: "Suspendu",
};

const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

/** Espace client — accès par lien privé secret, sans compte ni mot de passe. */
export default async function EspacePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await repo().findProjectByToken(token);
  if (!project) notFound();

  const [latest] = await repo().getLatestSpecs(project.id, 1);
  const submissions = await repo().listContactSubmissions(project.id);
  const name = latest?.spec.business.name ?? project.brief.businessName ?? "Mon site";
  const siteUrl = project.slug && project.status === "live" ? clientSiteUrl(project.slug) : null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink/50">{BRAND.name} · Mon espace</p>
          <h1 className="font-display text-3xl font-extrabold">{name}</h1>
          <p className="mt-1 text-sm">
            <span
              className={`inline-block rounded-full px-3 py-1 font-semibold ${
                project.status === "live" ? "bg-green-100 text-green-800" : "bg-ink/10"
              }`}
            >
              {STATUS[project.status]}
            </span>
          </p>
        </div>
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Voir mon site ↗
          </a>
        )}
      </header>

      <p className="mt-6 rounded-2xl bg-sun/20 px-4 py-3 text-sm">
        🔒 Cette page est accessible uniquement avec ce lien : ajoutez-la à vos favoris et ne la
        partagez pas.
      </p>

      {latest ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
          <EditPanel token={token} />
          <section>
            <h2 className="text-lg font-semibold">Aperçu</h2>
            <iframe
              key={latest.version}
              src={`/apercu/${project.id}`}
              title={`Aperçu du site ${name}`}
              className="mt-3 h-[70vh] w-full rounded-2xl border border-ink/10 bg-white"
            />
          </section>
        </div>
      ) : (
        <p className="mt-8 text-ink/60">Votre site n&apos;a pas encore été généré.</p>
      )}

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Demandes reçues ({submissions.length})</h2>
        {submissions.length === 0 ? (
          <p className="mt-2 text-ink/60">
            Les messages envoyés via le formulaire de contact de votre site apparaîtront ici.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {submissions.map((s) => (
              <li key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-ink/50">{dateFr.format(s.createdAt)}</p>
                <p className="font-semibold">
                  {s.name} · {s.contact}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{s.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
