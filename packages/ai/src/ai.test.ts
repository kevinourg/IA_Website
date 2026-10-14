import { describe, expect, it } from "vitest";
import { sampleBrief, sampleSpec } from "@site-ia/core/fixtures";
import { SiteSpecSchema } from "@site-ia/core";
import {
  MockProvider,
  applyPatch,
  editSite,
  enforceGuardrails,
  generateSite,
  intakeTurn,
  modelFor,
  resolveProviderName,
  toInputSchema,
} from "./index";

const ai = new MockProvider();

describe("routage des modèles", () => {
  it("utilise le modèle rapide pour l'accueil et équilibré pour la génération", () => {
    expect(modelFor("intake", {}).tier).toBe("fast");
    expect(modelFor("generate", {}).tier).toBe("balanced");
  });
  it("accepte une surcharge par variable d'environnement", () => {
    expect(modelFor("intake", { AI_MODEL_FAST: "x" }).model).toBe("x");
  });
});

describe("pipeline (mock)", () => {
  it("n'autorise pas la génération sans les champs requis", async () => {
    const r = await intakeTurn(ai, [{ role: "user", content: "Je suis plombier" }]);
    expect(r.readyToGenerate).toBe(false);
    expect(r.missing).toContain("businessName");
  });

  it("génère une SiteSpec valide", async () => {
    const { spec } = await generateSite(ai, sampleBrief);
    expect(SiteSpecSchema.safeParse(spec).success).toBe(true);
  });

  it("applique une modification par patch", async () => {
    const r = await editSite(ai, sampleSpec, "change le titre");
    expect(r.applied).toBe(true);
    expect(r.spec.pages[0]!.sections[0]).toMatchObject({ title: "Titre modifié (mock)" });
  });
});

describe("garde-fous", () => {
  it("retire les avis inventés et impose les coordonnées du brief", () => {
    const spec = structuredClone(sampleSpec);
    spec.business.phone = "01 00 00 00 00";
    spec.pages[0]!.sections.push({
      type: "testimonials",
      title: "Avis",
      items: [{ author: "Faux", text: "Inventé" }],
    });
    const out = enforceGuardrails(spec, sampleBrief);
    expect(out.business.phone).toBe(sampleBrief.contact.phone);
    expect(out.pages[0]!.sections.some((s) => s.type === "testimonials")).toBe(false);
  });
});

describe("applyPatch", () => {
  it("ne mute pas l'original", () => {
    const doc = { a: { b: 1 } };
    const out = applyPatch(doc, [{ path: "/a/b", value: 2 }]);
    expect(doc.a.b).toBe(1);
    expect(out.a.b).toBe(2);
  });
});

describe("schéma d'outil", () => {
  it("produit un JSON Schema objet", () => {
    expect(toInputSchema(SiteSpecSchema).type).toBe("object");
  });
});

describe("choix du fournisseur", () => {
  it("simulation par défaut, API si clé, abonnement si demandé", () => {
    expect(resolveProviderName({})).toBe("mock");
    expect(resolveProviderName({ ANTHROPIC_API_KEY: "k" })).toBe("anthropic");
    expect(resolveProviderName({ AI_PROVIDER: "claude-cli", ANTHROPIC_API_KEY: "k" })).toBe(
      "claude-cli",
    );
  });
  it("refuse l'abonnement en production", () => {
    expect(() =>
      resolveProviderName({ AI_PROVIDER: "claude-cli", NODE_ENV: "production" }),
    ).toThrow();
  });
});
