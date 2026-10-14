import { randomUUID } from "node:crypto";
import type { SiteSpec } from "@site-ia/core";
import type { ProjectRecord, Repository } from "./repository";

/** Stockage en mémoire — développement sans base de données et tests. */
export class MemoryRepository implements Repository {
  private projects = new Map<string, ProjectRecord>();
  private versions = new Map<string, SiteSpec[]>();

  async createProject() {
    const p: ProjectRecord = {
      id: randomUUID(),
      status: "intake",
      slug: null,
      conversation: [],
      brief: {},
      customerId: null,
    };
    this.projects.set(p.id, p);
    return structuredClone(p);
  }

  async getProject(id: string) {
    const p = this.projects.get(id);
    return p ? structuredClone(p) : null;
  }

  async updateProject(id: string, patch: Partial<ProjectRecord>) {
    const p = this.projects.get(id);
    if (!p) throw new Error(`Projet introuvable : ${id}`);
    this.projects.set(id, { ...p, ...structuredClone(patch) });
  }

  async saveSiteVersion(projectId: string, spec: SiteSpec, _source?: string) {
    const list = this.versions.get(projectId) ?? [];
    list.push(structuredClone(spec));
    this.versions.set(projectId, list);
    return list.length;
  }

  async getLatestSpec(projectId: string) {
    const list = this.versions.get(projectId);
    return list?.length ? structuredClone(list[list.length - 1]!) : null;
  }

  async findProjectByHost(host: string, rootWithPort: string) {
    const hostname = host.replace(/:\d+$/, "");
    const rootDomain = rootWithPort.replace(/:\d+$/, "");
    const slug = hostname.endsWith(`.${rootDomain}`)
      ? hostname.slice(0, -(rootDomain.length + 1))
      : null;
    for (const p of this.projects.values()) {
      if (slug && p.slug === slug) return structuredClone(p);
    }
    return null;
  }

  async recordUsage() {}
  async saveContactSubmission() {}
}
