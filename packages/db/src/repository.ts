import type { BusinessBrief, ChatMessage, ProjectStatus, SiteSpec } from "@site-ia/core";

export type ProjectRecord = {
  id: string;
  status: ProjectStatus;
  slug: string | null;
  conversation: ChatMessage[];
  brief: Partial<BusinessBrief>;
  customerId: string | null;
  /** Secret du lien privé de l'espace client (/espace/<token>). */
  accessToken: string;
};

export type UsageRecord = {
  projectId?: string;
  task: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
};

export type SiteVersionSource = "generate" | "edit" | "manual" | "undo";

export type ContactSubmission = {
  id: string;
  name: string;
  contact: string;
  message: string;
  createdAt: Date;
};

/** Accès aux données utilisé par l'app. Deux implémentations : Postgres et mémoire. */
export interface Repository {
  createProject(): Promise<ProjectRecord>;
  getProject(id: string): Promise<ProjectRecord | null>;
  findProjectByToken(token: string): Promise<ProjectRecord | null>;
  updateProject(
    id: string,
    patch: Partial<
      Pick<ProjectRecord, "status" | "slug" | "conversation" | "brief" | "customerId">
    >,
  ): Promise<void>;
  saveSiteVersion(projectId: string, spec: SiteSpec, source: SiteVersionSource): Promise<number>;
  getLatestSpec(projectId: string): Promise<SiteSpec | null>;
  /** Les deux dernières versions (la plus récente d'abord) — sert à « annuler ». */
  getLatestSpecs(projectId: string, count: number): Promise<{ version: number; spec: SiteSpec }[]>;
  findProjectByHost(hostname: string, rootDomain: string): Promise<ProjectRecord | null>;
  recordUsage(usage: UsageRecord): Promise<void>;
  saveContactSubmission(
    projectId: string,
    data: { name: string; contact: string; message: string },
  ): Promise<void>;
  listContactSubmissions(projectId: string): Promise<ContactSubmission[]>;
}
