import { NextResponse, type NextRequest } from "next/server";

/**
 * Routage multi-tenant : une seule app sert la plateforme ET tous les sites clients.
 *  - ROOT_DOMAIN (ex. siteia.fr)            → plateforme (landing, création, paiement)
 *  - <slug>.ROOT_DOMAIN ou domaine client   → réécrit vers /s/<host>/<chemin>
 * En local : http://plomberie-martin.localhost:3000 fonctionne directement.
 */
const stripPort = (h: string) => h.replace(/:\d+$/, "");
const ROOT = stripPort(process.env.ROOT_DOMAIN ?? "localhost");
const PLATFORM_HOSTS = new Set([ROOT, `www.${ROOT}`, "127.0.0.1"]);

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const hostname = stripPort(host);
  const { pathname } = req.nextUrl;

  if (PLATFORM_HOSTS.has(hostname) || hostname.endsWith(".vercel.app")) return NextResponse.next();
  // API partagées par les sites clients : formulaire de contact et mesure d'audience.
  if (pathname.startsWith("/api/contact") || pathname === "/api/v") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/s/${encodeURIComponent(host)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
