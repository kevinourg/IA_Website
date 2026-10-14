import { MemoryRepository } from "./memory";
import { PostgresRepository, createDb } from "./postgres";
import type { Repository } from "./repository";

export * as schema from "./schema";
export * from "./repository";
export { MemoryRepository } from "./memory";
export { PostgresRepository, createDb } from "./postgres";

const globalForRepo = globalThis as unknown as { __siteIaRepo?: Repository };

/** Postgres si DATABASE_URL est défini, sinon mémoire (singleton, survit au hot-reload). */
export function getRepository(env: Record<string, string | undefined> = process.env): Repository {
  globalForRepo.__siteIaRepo ??= env.DATABASE_URL
    ? new PostgresRepository(createDb(env.DATABASE_URL))
    : new MemoryRepository();
  return globalForRepo.__siteIaRepo;
}
