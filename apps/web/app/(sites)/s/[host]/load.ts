import "server-only";
import { cache } from "react";
import { env } from "@/lib/env";
import { repo } from "@/lib/services";

/** Charge le site en ligne associé à un nom d'hôte (mis en cache pendant la requête). */
export const loadLiveSite = cache(async (rawHost: string) => {
  const host = decodeURIComponent(rawHost);
  const project = await repo().findProjectByHost(host, env.ROOT_DOMAIN);
  if (!project || project.status !== "live") return null;
  const spec = await repo().getLatestSpec(project.id);
  if (!spec) return null;
  const protocol = host.includes("localhost") ? "http" : "https";
  return { project, spec, baseUrl: `${protocol}://${host}` };
});
