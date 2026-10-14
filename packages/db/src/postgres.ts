import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { SiteSpec } from "@site-ia/core";
import * as schema from "./schema";
import type { ProjectRecord, Repository, UsageRecord } from "./repository";

type Db = PostgresJsDatabase<typeof schema>;

export function createDb(url: string): Db {
  return drizzle(postgres(url, { max: 10 }), { schema });
}

function toRecord(row: typeof schema.projects.$inferSelect): ProjectRecord {
  return {
    id: row.id,
    status: row.status,
    slug: row.slug,
    conversation: row.conversation,
    brief: row.brief,
    customerId: row.customerId,
  };
}

export class PostgresRepository implements Repository {
  constructor(private db: Db) {}

  async createProject() {
    const [row] = await this.db.insert(schema.projects).values({}).returning();
    return toRecord(row!);
  }

  async getProject(id: string) {
    const row = await this.db.query.projects.findFirst({ where: eq(schema.projects.id, id) });
    return row ? toRecord(row) : null;
  }

  async updateProject(id: string, patch: Partial<ProjectRecord>) {
    await this.db
      .update(schema.projects)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.projects.id, id));
  }

  async saveSiteVersion(projectId: string, spec: SiteSpec, source: "generate" | "edit" | "manual") {
    return this.db.transaction(async (tx) => {
      const [{ next } = { next: 1 }] = await tx
        .select({ next: sql<number>`coalesce(max(${schema.siteVersions.version}), 0) + 1` })
        .from(schema.siteVersions)
        .where(eq(schema.siteVersions.projectId, projectId));
      await tx.insert(schema.siteVersions).values({ projectId, spec, source, version: next });
      return next;
    });
  }

  async getLatestSpec(projectId: string) {
    const row = await this.db.query.siteVersions.findFirst({
      where: eq(schema.siteVersions.projectId, projectId),
      orderBy: desc(schema.siteVersions.version),
    });
    return row?.spec ?? null;
  }

  async findProjectByHost(host: string, rootWithPort: string) {
    const hostname = host.replace(/:\d+$/, "");
    const rootDomain = rootWithPort.replace(/:\d+$/, "");
    // 1. Domaine personnalisé vérifié
    const domain = await this.db.query.domains.findFirst({
      where: and(eq(schema.domains.hostname, hostname)),
    });
    if (domain?.verifiedAt) return this.getProject(domain.projectId);
    // 2. Sous-domaine <slug>.<rootDomain>
    if (hostname.endsWith(`.${rootDomain}`)) {
      const slug = hostname.slice(0, -(rootDomain.length + 1));
      const row = await this.db.query.projects.findFirst({ where: eq(schema.projects.slug, slug) });
      return row ? toRecord(row) : null;
    }
    return null;
  }

  async recordUsage(u: UsageRecord) {
    await this.db.insert(schema.aiUsage).values(u);
  }

  async saveContactSubmission(
    projectId: string,
    data: { name: string; contact: string; message: string },
  ) {
    await this.db.insert(schema.contactSubmissions).values({ projectId, ...data });
  }
}
