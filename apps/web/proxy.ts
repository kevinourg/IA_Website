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

/**
 * Back-office (/admin) : authentification HTTP Basic avec ADMIN_PASSWORD.
 * Sans mot de passe configuré : ouvert en développement, fermé en production.
 */
function adminGuard(req: NextRequest): NextResponse | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return process.env.NODE_ENV === "production"
      ? new NextResponse("Back-office désactivé : définir ADMIN_PASSWORD.", { status: 403 })
      : null;
  }
  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    const given = decoded.slice(decoded.indexOf(":") + 1);
    if (given.length === password.length && timingSafeEqual(given, password)) return null;
  }
  return new NextResponse("Authentification requise", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Back-office", charset="UTF-8"' },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const hostname = stripPort(host);
  const { pathname } = req.nextUrl;

  if (PLATFORM_HOSTS.has(hostname) || hostname.endsWith(".vercel.app")) {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return adminGuard(req) ?? NextResponse.next();
    }
    return NextResponse.next();
  }
  // API partagées par les sites clients : formulaire de contact et mesure d'audience.
  if (pathname.startsWith("/api/contact") || pathname === "/api/v") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/s/${encodeURIComponent(host)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
