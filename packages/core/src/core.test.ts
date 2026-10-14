import { describe, expect, it } from "vitest";
import {
  canTransition,
  isValidSiret,
  LegalInfoSchema,
  missingBriefFields,
  slugify,
  SiteSpecSchema,
} from "./index";
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

describe("informations légales", () => {
  it("valide un SIRET (clé de Luhn)", () => {
    expect(isValidSiret("732 829 320 00074")).toBe(true);
    expect(isValidSiret("73282932000075")).toBe(false);
    expect(isValidSiret("1234")).toBe(false);
  });
  it("exige le capital social pour une société, pas pour un EI", () => {
    const base = {
      legalName: "Plomberie Martin",
      siret: "73282932000074",
      address: "12 rue de Paris, 93100 Montreuil",
      publicationDirector: "Paul Martin",
    };
    expect(LegalInfoSchema.safeParse({ ...base, legalForm: "SARL" }).success).toBe(false);
    expect(
      LegalInfoSchema.safeParse({ ...base, legalForm: "SARL", shareCapital: "5 000 €" }).success,
    ).toBe(true);
    expect(
      LegalInfoSchema.safeParse({
        ...base,
        legalForm: "Entrepreneur individuel (EI / micro-entreprise)",
      }).success,
    ).toBe(true);
  });
});
