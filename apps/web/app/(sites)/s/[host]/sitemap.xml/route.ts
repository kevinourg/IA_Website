export const dynamic = "force-dynamic";

import { sitemapXml } from "@site-ia/renderer";
import { loadLiveSite } from "../load";

export async function GET(_req: Request, { params }: { params: Promise<{ host: string }> }) {
  const site = await loadLiveSite((await params).host);
  if (!site) return new Response("Not found", { status: 404 });
  return new Response(sitemapXml(site.spec, site.baseUrl), {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
