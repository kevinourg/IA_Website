import { describe, expect, it } from "vitest";
import {
  attributionFromUrl,
  channelOf,
  CITIES,
  companyToLead,
  leadDedupKey,
  outreachMessage,
  TRADES,
  type CompanySearchResult,
} from "./index";

describe("attribution", () => {
  it("lit les paramètres utm et ref", () => {
    const a = attributionFromUrl(
      new URL(
        "https://x.fr/site-internet/plombier?utm_source=google&utm_medium=cpc&ref=compta-durand",
      ),
    );
    expect(a).toMatchObject({ source: "google", medium: "cpc", ref: "compta-durand" });
    expect(channelOf(a)).toBe("google / cpc");
  });
  it("classe les arrivées sur les pages métier en SEO", () => {
    expect(channelOf({ landing: "/site-internet/plombier/lyon" })).toBe("SEO (pages métier)");
    expect(channelOf(null)).toBe("Direct");
    expect(channelOf({ ref: "partenaire" })).toBe("Parrainage : partenaire");
  });
});

describe("catalogue SEO", () => {
  it("a des slugs uniques et un contenu propre à chaque métier", () => {
    expect(new Set(TRADES.map((t) => t.slug)).size).toBe(TRADES.length);
    expect(new Set(CITIES.map((c) => c.slug)).size).toBe(CITIES.length);
    expect(new Set(TRADES.map((t) => t.pitch)).size).toBe(TRADES.length);
    for (const t of TRADES) {
      expect(t.naf).toMatch(/^\d{2}\.\d{2}[A-Z]$/);
      expect(t.faq.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("prospects", () => {
  const base: CompanySearchResult = {
    nom_complet: "MARTIN PAUL",
    siren: "123456789",
    categorie_entreprise: "PME",
    statut_diffusion: "O",
    etat_administratif: "A",
    siege: {
      siret: "12345678900011",
      adresse: "12 RUE DE PARIS 93100 MONTREUIL",
      libelle_commune: "MONTREUIL",
      etat_administratif: "A",
      liste_enseignes: ["PLOMBERIE MARTIN"],
    },
  };
  it("convertit une entreprise de l'annuaire en prospect", () => {
    expect(companyToLead(base, "plombier")).toMatchObject({
      businessName: "Plomberie Martin",
      city: "Montreuil",
      siret: "12345678900011",
      trade: "plombier",
      source: "annuaire-entreprises",
    });
  });
  it("écarte les entreprises non diffusibles, fermées ou trop grandes", () => {
    expect(companyToLead({ ...base, statut_diffusion: "P" })).toBeNull();
    expect(companyToLead({ ...base, etat_administratif: "C" })).toBeNull();
    expect(companyToLead({ ...base, categorie_entreprise: "ETI" })).toBeNull();
  });
  it("dédoublonne par SIRET, puis e-mail, puis téléphone", () => {
    expect(leadDedupKey({ businessName: "A", siret: "123 456" })).toBe("siret:123456");
    expect(leadDedupKey({ businessName: "A", phone: "06 12 34" })).toBe("tel:061234");
  });
  it("inclut toujours l'expéditeur et le lien de désinscription", () => {
    const m = outreachMessage({
      brand: "SiteIA",
      businessName: "Plomberie Martin",
      previewUrl: "https://x.fr/apercu/1",
      optOutUrl: "https://x.fr/desinscription/abc",
      senderName: "Kevin",
      dataSource: "l'annuaire public des entreprises",
    });
    expect(m.body).toContain("proviennent de l'annuaire public des entreprises");
    for (const text of [m.body, m.sms]) {
      expect(text).toContain("https://x.fr/desinscription/abc");
      expect(text).toContain("SiteIA");
    }
  });
});
