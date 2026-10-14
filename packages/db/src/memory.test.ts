import { describe, expect, it } from "vitest";
import { sampleSpec } from "@site-ia/core/fixtures";
import { MemoryRepository } from "./memory";

describe("MemoryRepository", () => {
  it("versionne les sites et résout un sous-domaine", async () => {
    const repo = new MemoryRepository();
    const p = await repo.createProject();
    await repo.updateProject(p.id, { slug: "plomberie-martin", status: "live" });
    expect(await repo.saveSiteVersion(p.id, sampleSpec, "generate")).toBe(1);
    expect(await repo.saveSiteVersion(p.id, sampleSpec, "edit")).toBe(2);
    expect((await repo.getLatestSpec(p.id))?.business.name).toBe("Plomberie Martin");
    const found = await repo.findProjectByHost("plomberie-martin.exemple.fr", "exemple.fr");
    expect(found?.id).toBe(p.id);
  });
});
