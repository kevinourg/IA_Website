import type { BusinessBrief, ChatMessage, ProjectStatus, SiteSpec } from "@site-ia/core";

export type ProjectRecord = {
  id: string;
  status: ProjectStatus;
  slug: string | null;
  conversation: ChatMessage[];
  brief: Partial<BusinessBrief>;
  customerId: string | null;
};

export type UsageRecord = {
  projectId?: string;
  task: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
};

/** Accès aux données utilisé par l'app. Deux implémentations : Postgres et mémoire. */
export interface Repository {
  createProject(): Promise<ProjectRecord>;
  getProject(id: string): Promise<ProjectRecord | null>;
  updateProject(
    id: string,
    patch: Partial<
      Pick<ProjectRecord, "status" | "slug" | "conversation" | "brief" | "customerId">
    >,
  ): Promise<void>;
  saveSiteVersion(
    projectId: string,
    spec: SiteSpec,
    source: "generate" | "edit" | "manual",
  ): Promise<number>;
  getLatestSpec(projectId: string): Promise<SiteSpec | null>;
  findProjectByHost(hostname: string, rootDomain: string): Promise<ProjectRecord | null>;
  recordUsage(usage: UsageRecord): Promise<void>;
  saveContactSubmission(
    projectId: string,
    data: { name: string; contact: string; message: string },
  ): Promise<void>;
}
