export const dynamic = "force-dynamic";

import { loadLiveSite } from "../load";

export async function GET(_req: Request, { params }: { params: Promise<{ host: string }> }) {
  const site = await loadLiveSite((await params).host);
  if (!site) return new Response("Not found", { status: 404 });
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
