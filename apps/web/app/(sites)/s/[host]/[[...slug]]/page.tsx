import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPage } from "@site-ia/core";
import { SitePage } from "@site-ia/renderer";
import { loadLiveSite } from "../load";

type Params = Promise<{ host: string; slug?: string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { host, slug = [] } = await params;
  const site = await loadLiveSite(host);
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
export default async function ClientSite({ params }: { params: Params }) {
  const { host, slug = [] } = await params;
  const site = await loadLiveSite(host);
  if (!site) notFound();
  const content = <SitePage spec={site.spec} slug={slug.join("/")} baseUrl={site.baseUrl} />;
  return content ?? notFound();
}
