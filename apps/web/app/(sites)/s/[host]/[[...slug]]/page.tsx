import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPage } from "@site-ia/core";
import { LEGAL_SLUG, SitePage } from "@site-ia/renderer";
import { HOSTING } from "@/lib/brand";
import { loadLiveSite } from "../load";

type Params = Promise<{ host: string; slug?: string[] }>;
type Search = Promise<{ envoye?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { host, slug = [] } = await params;
  const site = await loadLiveSite(host);
  if (site && slug.join("/") === LEGAL_SLUG) {
    return { title: `Mentions légales — ${site.spec.business.name}` };
  }
  const page = site && findPage(site.spec, slug.join("/"));
  if (!site || !page) return {};
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: { canonical: `${site.baseUrl}/${page.slug}` },
    openGraph: { title: page.seo.title, description: page.seo.description, locale: "fr_FR" },
  };
}

/** Site client en production (sous-domaine ou domaine personnalisé, via proxy.ts). */
export default async function ClientSite({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { host, slug = [] } = await params;
  const { envoye } = await searchParams;
  const site = await loadLiveSite(host);
  if (!site) notFound();
  const path = slug.join("/");
  if (path !== LEGAL_SLUG && !findPage(site.spec, path)) notFound();
  return (
    <SitePage
      spec={site.spec}
      slug={path}
      baseUrl={site.baseUrl}
      legal={site.project.legal}
      hosting={HOSTING}
      notice={
        envoye
          ? "Merci, votre message a bien été envoyé. Nous vous répondons rapidement."
          : undefined
      }
    />
  );
}
