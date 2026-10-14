import { env } from "./env";

/** Adresse publique du site d'un client : <slug>.<domaine racine>. */
export function clientSiteUrl(slug: string): string {
  const app = new URL(env.NEXT_PUBLIC_APP_URL);
  return `${app.protocol}//${slug}.${app.host}/`;
}

/** Lien privé de l'espace client. */
export function espaceUrl(token: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}/espace/${token}`;
}
