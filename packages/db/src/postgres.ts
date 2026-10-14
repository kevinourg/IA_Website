import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  leadDedupKey,
  type Attribution,
  type LeadInput,
  type LeadStatus,
  type SiteSpec,
  type StatKind,
  type StatRow,
} from "@site-ia/core";
import * as schema from "./schema";
import type {
  LeadPatch,
  LeadRecord,
  ProjectRecord,
  Repository,
  SiteVersionSource,
  UsageRecord,
} from "./repository";
import { newAccessToken } from "./token";

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
    accessToken: row.accessToken,
    customerEmail: row.customerEmail,
    legal: row.legal,
    attribution: row.attribution,
    leadId: row.leadId,
    createdAt: row.createdAt,
  };
}

function toLead(row: typeof schema.leads.$inferSelect): LeadRecord {
  const opt = <T>(v: T | null) => v ?? undefined;
  return {
    id: row.id,
    businessName: row.businessName,
    trade: opt(row.trade),
    city: opt(row.city),
    phone: opt(row.phone),
    email: opt(row.email),
    website: opt(row.website),
    siret: opt(row.siret),
    address: opt(row.address),
    source: row.source,
    notes: opt(row.notes),
    status: row.status,
    optOutToken: row.optOutToken,
    projectId: row.projectId,
    lastContactedAt: row.lastContactedAt,
    createdAt: row.createdAt,
  };
}

export class PostgresRepository implements Repository {
  constructor(private db: Db) {}

  async createProject(opts: { attribution?: Attribution; leadId?: string } = {}) {
    const [row] = await this.db
      .insert(schema.projects)
      .values({
        accessToken: newAccessToken(),
        attribution: opts.attribution,
        leadId: opts.leadId,
      })
      .returning();
    return toRecord(row!);
  }

  async getProject(id: string) {
    const row = await this.db.query.projects.findFirst({ where: eq(schema.projects.id, id) });
    return row ? toRecord(row) : null;
  }

  async findProjectByToken(token: string) {
    const row = await this.db.query.projects.findFirst({
      where: eq(schema.projects.accessToken, token),
    });
    return row ? toRecord(row) : null;
  }

  async findProjectsByEmail(email: string) {
    const rows = await this.db.query.projects.findMany({
      where: eq(schema.projects.customerEmail, email.trim().toLowerCase()),
    });
    return rows.map(toRecord);
  }

  async updateProject(id: string, patch: Partial<ProjectRecord>) {
    await this.db
      .update(schema.projects)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.projects.id, id));
  }

  async saveSiteVersion(projectId: string, spec: SiteSpec, source: SiteVersionSource) {
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

  async getLatestSpecs(projectId: string, count: number) {
    const rows = await this.db.query.siteVersions.findMany({
      where: eq(schema.siteVersions.projectId, projectId),
      orderBy: desc(schema.siteVersions.version),
      limit: count,
    });
    return rows.map((r) => ({ version: r.version, spec: r.spec }));
  }

  async findProjectByHost(host: string, rootWithPort: string) {
    const hostname = host.replace(/:\d+$/, "");
    const rootDomain = rootWithPort.replace(/:\d+$/, "");
    // 1. Domaine personnalisé vérifié
    const domain = await this.db.query.domains.findFirst({
      where: eq(schema.domains.hostname, hostname),
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

  async listContactSubmissions(projectId: string) {
    return this.db.query.contactSubmissions.findMany({
      where: eq(schema.contactSubmissions.projectId, projectId),
      orderBy: desc(schema.contactSubmissions.createdAt),
      limit: 100,
    });
  }

  async listLiveProjects() {
    const rows = await this.db.query.projects.findMany({
      where: eq(schema.projects.status, "live"),
    });
    return rows.map(toRecord);
  }

  async recordStats(projectId: string, day: string, events: { kind: StatKind; key: string }[]) {
    if (events.length === 0) return;
    const t = schema.siteStatsDaily;
    await this.db
      .insert(t)
      .values(events.map((e) => ({ projectId, day, kind: e.kind, key: e.key, count: 1 })))
      .onConflictDoUpdate({
        target: [t.projectId, t.day, t.kind, t.key],
        set: { count: sql`${t.count} + excluded.count` },
      });
  }

  async getStats(projectId: string, fromDay: string): Promise<StatRow[]> {
    const t = schema.siteStatsDaily;
    const rows = await this.db
      .select({ day: t.day, kind: t.kind, key: t.key, count: t.count })
      .from(t)
      .where(and(eq(t.projectId, projectId), gte(t.day, fromDay)));
    return rows;
  }

  async listProjects() {
    const rows = await this.db.query.projects.findMany({
      orderBy: desc(schema.projects.createdAt),
    });
    return rows.map(toRecord);
  }

  async createLeads(inputs: LeadInput[]) {
    if (inputs.length === 0) return { created: 0, skipped: 0 };
    // Les doublons (et donc les désinscrits, qui restent en base) sont ignorés par la clé unique.
    const rows = await this.db
      .insert(schema.leads)
      .values(
        inputs.map((i) => ({ ...i, dedupKey: leadDedupKey(i), optOutToken: newAccessToken() })),
      )
      .onConflictDoNothing({ target: schema.leads.dedupKey })
      .returning({ id: schema.leads.id });
    return { created: rows.length, skipped: inputs.length - rows.length };
  }

  async listLeads(filter: { status?: LeadStatus } = {}) {
    const rows = await this.db.query.leads.findMany({
      where: filter.status ? eq(schema.leads.status, filter.status) : undefined,
      orderBy: desc(schema.leads.createdAt),
      limit: 500,
    });
    return rows.map(toLead);
  }

  async getLead(id: string) {
    const row = await this.db.query.leads.findFirst({ where: eq(schema.leads.id, id) });
    return row ? toLead(row) : null;
  }

  async updateLead(id: string, patch: LeadPatch) {
    await this.db
      .update(schema.leads)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.leads.id, id));
  }

  async findLeadByOptOutToken(token: string) {
    const row = await this.db.query.leads.findFirst({
      where: eq(schema.leads.optOutToken, token),
    });
    return row ? toLead(row) : null;
  }
}
