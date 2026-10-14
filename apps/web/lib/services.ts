import "server-only";
import { getAiProvider, type Usage } from "@site-ia/ai";
import { getRepository } from "@site-ia/db";

export const ai = () => getAiProvider();
export const repo = () => getRepository();

export async function trackUsage(projectId: string, usages: Usage | Usage[]) {
  const list = Array.isArray(usages) ? usages : [usages];
  await Promise.all(list.map((u) => repo().recordUsage({ projectId, ...u })));
}
