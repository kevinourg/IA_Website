import "server-only";
import { headers } from "next/headers";

/**
 * Vérifie l'accès au back-office (HTTP Basic, ADMIN_PASSWORD), en plus du contrôle de proxy.ts :
 * une action serveur ne doit jamais dépendre uniquement de la page qui l'appelle.
 */
export async function assertAdmin(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "production") throw new Error("Back-office désactivé");
    return;
  }
  const header = (await headers()).get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  const decoded = scheme === "Basic" && encoded ? atob(encoded) : "";
  const given = decoded.slice(decoded.indexOf(":") + 1);
  let diff = given.length ^ password.length;
  for (let i = 0; i < password.length; i++)
    diff |= (given.charCodeAt(i) || 0) ^ password.charCodeAt(i);
  if (diff !== 0) throw new Error("Accès refusé");
}
