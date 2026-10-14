import { describe, expect, it } from "vitest";
import { canTransition, missingBriefFields, slugify, SiteSpecSchema } from "./index";
import { sampleSpec } from "./fixtures";

describe("slugify", () => {
  it("retire accents et caractères spéciaux", () => {
    expect(slugify("Électricité Dupont & Fils")).toBe("electricite-dupont-fils");
  });
});

describe("missingBriefFields", () => {
  it("liste les champs manquants", () => {
    expect(missingBriefFields({ trade: "plombier" })).toEqual([
      "businessName",
      "city",
      "services",
      "contact",
    ]);
  });
});

describe("cycle de vie projet", () => {
  it("interdit de passer en ligne sans paiement", () => {
    expect(canTransition("preview", "live")).toBe(false);
    expect(canTransition("preview", "paid")).toBe(true);
  });
});

describe("SiteSpecSchema", () => {
  it("valide la fixture", () => {
    expect(SiteSpecSchema.safeParse(sampleSpec).success).toBe(true);
  });
  it("exige une page d'accueil", () => {
    const bad = { ...sampleSpec, pages: sampleSpec.pages.filter((p) => p.slug !== "") };
    expect(SiteSpecSchema.safeParse(bad).success).toBe(false);
  });
  it("refuse une couleur invalide", () => {
    const bad = structuredClone(sampleSpec);
    bad.theme.palette.primary = "red";
    expect(SiteSpecSchema.safeParse(bad).success).toBe(false);
  });
});
