import type {
  Attribution,
  LeadInput,
  LeadStatus,
  BusinessBrief,
  ChatMessage,
  LegalInfo,
  ProjectStatus,
  SiteSpec,
  StatKind,
  StatRow,
} from "@site-ia/core";

export type ProjectRecord = {
  id: string;
  status: ProjectStatus;
  slug: string | null;
  conversation: ChatMessage[];
  brief: Partial<BusinessBrief>;
  customerId: string | null;
  /** Secret du lien privé de l'espace client (/espace/<token>). */
  accessToken: string;
  /** E-mail du client (compte), saisi à la commande : accès à l'espace et notifications. */
  customerEmail: string | null;
  /** Informations légales pour les mentions légales, saisies à la commande. */
  legal: LegalInfo | null;
  /** D'où vient le client (utm, parrain, page d'arrivée). */
  attribution: Attribution | null;
  /** Prospect à l'origine du projet (aperçu à froid). */
  leadId: string | null;
  createdAt: Date;
};

export type LeadRecord = LeadInput & {
  id: string;
  status: LeadStatus;
  optOutToken: string;
  projectId: string | null;
  lastContactedAt: Date | null;
  createdAt: Date;
};

export type LeadPatch = Partial<
  Pick<LeadRecord, "status" | "notes" | "projectId" | "lastContactedAt" | "phone" | "email">
>;

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
  createProject(opts?: { attribution?: Attribution; leadId?: string }): Promise<ProjectRecord>;
  /** Tous les projets (tableau de bord : entonnoir par canal). */
  listProjects(): Promise<ProjectRecord[]>;
  getProject(id: string): Promise<ProjectRecord | null>;
  findProjectByToken(token: string): Promise<ProjectRecord | null>;
  /** Projets commandés avec cet e-mail (pour renvoyer les liens d'accès). */
  findProjectsByEmail(email: string): Promise<ProjectRecord[]>;
  updateProject(
    id: string,
    patch: Partial<
      Pick<
        ProjectRecord,
        "status" | "slug" | "conversation" | "brief" | "customerId" | "customerEmail" | "legal"
      >
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
  /** Projets en ligne (rapport mensuel). */
  listLiveProjects(): Promise<ProjectRecord[]>;
  /** Incrémente les compteurs de visite du jour (aucune donnée personnelle). */
  recordStats(
    projectId: string,
    day: string,
    events: { kind: StatKind; key: string }[],
  ): Promise<void>;
  /** Compteurs depuis `fromDay` inclus (AAAA-MM-JJ). */
  getStats(projectId: string, fromDay: string): Promise<StatRow[]>;

  // ─── Prospects (phase 2) ───
  /** Ajoute des prospects ; ignore les doublons et les personnes désinscrites. */
  createLeads(inputs: LeadInput[]): Promise<{ created: number; skipped: number }>;
  listLeads(filter?: { status?: LeadStatus }): Promise<LeadRecord[]>;
  getLead(id: string): Promise<LeadRecord | null>;
  updateLead(id: string, patch: LeadPatch): Promise<void>;
  findLeadByOptOutToken(token: string): Promise<LeadRecord | null>;
}
