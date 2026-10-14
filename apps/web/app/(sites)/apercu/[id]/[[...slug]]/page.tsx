import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OFFER, formatEuros } from "@site-ia/core";
import { SitePage } from "@site-ia/renderer";
import { env } from "@/lib/env";
import { repo } from "@/lib/services";

type Params = Promise<{ id: string; slug?: string[] }>;

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Aperçu avant paiement : le vrai site, avec une barre de commande au-dessus. */
export default async function PreviewPage({ params }: { params: Params }) {
  const { id, slug = [] } = await params;
  const [project, spec] = await Promise.all([repo().getProject(id), repo().getLatestSpec(id)]);
  if (!project || !spec) notFound();

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: "10px 16px",
          background: "#12131a",
          color: "#faf8f4",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span>
          Aperçu de votre site — <strong>{spec.business.name}</strong>
        </span>
        {project.status === "preview" && (
          <form method="post" action="/api/checkout">
            <input type="hidden" name="projectId" value={id} />
            <button
              style={{
                background: "#ffb547",
                color: "#12131a",
                border: 0,
                borderRadius: 999,
                padding: "10px 18px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Mettre en ligne — {formatEuros(OFFER.creation.amountCents)}
            </button>
          </form>
        )}
      </div>
      <SitePage
        spec={spec}
        slug={slug.join("/")}
        baseUrl={env.NEXT_PUBLIC_APP_URL}
        linkBase={`/apercu/${id}`}
      />
    </>
  );
}
