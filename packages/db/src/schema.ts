import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  PROJECT_STATUSES,
  type Attribution,
  type LeadStatus,
  type BusinessBrief,
  type ChatMessage,
  type LegalInfo,
  type SiteSpec,
  type StatKind,
} from "@site-ia/core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const projectStatus = pgEnum("project_status", PROJECT_STATUSES);

export const customers = pgTable("customers", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt: createdAt(),
});

/** Un projet = un site client, de la première question jusqu'à la mise en ligne. */
export const projects = pgTable(
  "projects",
  {
    id: id(),
    customerId: uuid("customer_id").references(() => customers.id),
    status: projectStatus("status").notNull().default("intake"),
    slug: text("slug").unique(),
    /** Secret du lien privé de l'espace client. */
    accessToken: text("access_token").notNull().unique(),
    /** E-mail du client saisi à la commande (en minuscules). */
    customerEmail: text("customer_email"),
    /** Informations légales (mentions légales), saisies à la commande. */
    legal: jsonb("legal").$type<LegalInfo>(),
    conversation: jsonb("conversation").$type<ChatMessage[]>().notNull().default([]),
    brief: jsonb("brief").$type<Partial<BusinessBrief>>().notNull().default({}),
    /** Prospect à l'origine du projet (aperçu à froid), le cas échéant. */
    leadId: uuid("lead_id"),
    /** D'où vient le client (utm, parrain, page d'arrivée). */
    attribution: jsonb("attribution").$type<Attribution>(),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("projects_status_idx").on(t.status),
    index("projects_customer_email_idx").on(t.customerEmail),
  ],
);

/** Historique des versions du site : permet de revenir en arrière après une modification. */
export const siteVersions = pgTable(
  "site_versions",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    spec: jsonb("spec").$type<SiteSpec>().notNull(),
    source: text("source", { enum: ["generate", "edit", "manual", "undo"] }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("site_versions_project_version_idx").on(t.projectId, t.version)],
);

export const domains = pgTable("domains", {
  id: id(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  hostname: text("hostname").notNull().unique(),
  isPrimary: boolean("is_primary").notNull().default(false),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const orders = pgTable("orders", {
  id: id(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  amountCents: integer("amount_cents").notNull(),
  status: text("status", { enum: ["pending", "paid", "refunded", "failed"] })
    .notNull()
    .default("pending"),
  createdAt: createdAt(),
});

/** Suivi de la consommation IA par projet : base du calcul de marge. */
export const aiUsage = pgTable("ai_usage", {
  id: id(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  task: text("task").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  cacheReadTokens: integer("cache_read_tokens").notNull().default(0),
  createdAt: createdAt(),
});

/** Messages envoyés via le formulaire des sites clients (transférés par e-mail au client). */
export const contactSubmissions = pgTable("contact_submissions", {
  id: id(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  message: text("message").notNull(),
  createdAt: createdAt(),
});

/**
 * Phase 2 — prospects (acquisition). Données strictement professionnelles.
 * Un prospect « opted_out » ne doit plus jamais être contacté, ni réimporté.
 */
export const leads = pgTable(
  "leads",
  {
    id: id(),
    businessName: text("business_name").notNull(),
    trade: text("trade"),
    city: text("city"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    siret: text("siret"),
    address: text("address"),
    /** Origine : « annuaire-entreprises », « manuel », « salon », « partenaire:… »… */
    source: text("source").notNull(),
    status: text("status").$type<LeadStatus>().notNull().default("new"),
    notes: text("notes"),
    /** Clé de dédoublonnage (SIRET, e-mail, téléphone ou nom + ville). */
    dedupKey: text("dedup_key").notNull().unique(),
    /** Jeton du lien de désinscription inclus dans chaque message. */
    optOutToken: text("opt_out_token").notNull().unique(),
    /** Aperçu généré pour ce prospect. */
    projectId: uuid("project_id"),
    lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("leads_status_idx").on(t.status)],
);

/**
 * Statistiques de visite des sites clients : compteurs agrégés par jour, sans aucune donnée
 * personnelle (ni IP, ni identifiant, ni cookie). key = chemin de page (pageview) ou source (visit).
 */
export const siteStatsDaily = pgTable(
  "site_stats_daily",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    kind: text("kind").$type<StatKind>().notNull(),
    key: text("key").notNull().default(""),
    count: integer("count").notNull().default(0),
  },
  (t) => [uniqueIndex("site_stats_daily_pk").on(t.projectId, t.day, t.kind, t.key)],
);
