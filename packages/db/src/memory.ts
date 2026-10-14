import { randomUUID } from "node:crypto";
import type { SiteSpec } from "@site-ia/core";
import type { ContactSubmission, ProjectRecord, Repository, SiteVersionSource } from "./repository";
import { newAccessToken } from "./token";

/** Stockage en mémoire — développement sans base de données et tests. */
export class MemoryRepository implements Repository {
  private projects = new Map<string, ProjectRecord>();
  private versions = new Map<string, SiteSpec[]>();
  private submissions = new Map<string, ContactSubmission[]>();

  async createProject() {
    const p: ProjectRecord = {
      id: randomUUID(),
      status: "intake",
      slug: null,
      conversation: [],
      brief: {},
      customerId: null,
      accessToken: newAccessToken(),
      customerEmail: null,
      legal: null,
    };
    this.projects.set(p.id, p);
    return structuredClone(p);
  }

  async getProject(id: string) {
    const p = this.projects.get(id);
    return p ? structuredClone(p) : null;
  }

  async findProjectByToken(token: string) {
    for (const p of this.projects.values()) {
      if (p.accessToken === token) return structuredClone(p);
    }
    return null;
  }

  async findProjectsByEmail(email: string) {
    const wanted = email.trim().toLowerCase();
    return [...this.projects.values()]
      .filter((p) => p.customerEmail?.toLowerCase() === wanted)
      .map((p) => structuredClone(p));
  }

  async updateProject(id: string, patch: Partial<ProjectRecord>) {
    const p = this.projects.get(id);
    if (!p) throw new Error(`Projet introuvable : ${id}`);
    this.projects.set(id, { ...p, ...structuredClone(patch) });
  }

  async saveSiteVersion(projectId: string, spec: SiteSpec, _source?: SiteVersionSource) {
    const list = this.versions.get(projectId) ?? [];
    list.push(structuredClone(spec));
    this.versions.set(projectId, list);
    return list.length;
  }

  async getLatestSpec(projectId: string) {
    const list = this.versions.get(projectId);
    return list?.length ? structuredClone(list[list.length - 1]!) : null;
  }

  async getLatestSpecs(projectId: string, count: number) {
    const list = this.versions.get(projectId) ?? [];
    return list
      .map((spec, i) => ({ version: i + 1, spec: structuredClone(spec) }))
      .reverse()
      .slice(0, count);
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

  async saveContactSubmission(
    projectId: string,
    data: { name: string; contact: string; message: string },
  ) {
    const list = this.submissions.get(projectId) ?? [];
    list.push({ id: randomUUID(), ...data, createdAt: new Date() });
    this.submissions.set(projectId, list);
  }

  async listContactSubmissions(projectId: string) {
    return [...(this.submissions.get(projectId) ?? [])].reverse();
  }
}
