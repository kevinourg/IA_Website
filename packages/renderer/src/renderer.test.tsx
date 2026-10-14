import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { sampleSpec } from "@site-ia/core/fixtures";
import { SitePage, jsonLd, llmsTxt, sitemapXml } from "./index";

describe("SitePage", () => {
  const html = renderToStaticMarkup(
    <SitePage spec={sampleSpec} slug="" baseUrl="https://exemple.fr" />,
  );

  it("rend le titre principal et la navigation", () => {
    expect(html).toContain("<h1>Une fuite ? On intervient sous 2 heures.</h1>");
    expect(html).toContain('href="/contact"');
  });

  it("injecte les données structurées schema.org", () => {
    expect(html).toContain('"@type":"Plumber"');
  });

  it("renvoie null pour une page inconnue", () => {
    expect(renderToStaticMarkup(<SitePage spec={sampleSpec} slug="inconnue" baseUrl="x" />)).toBe(
      "",
    );
  });
});

describe("SEO", () => {
  it("inclut la zone desservie", () => {
    const [business] = jsonLd(sampleSpec, sampleSpec.pages[0]!, "https://exemple.fr") as [
      { areaServed: { name: string }[] },
    ];
    expect(business.areaServed.map((a) => a.name)).toContain("Vincennes");
  });
  it("génère llms.txt et sitemap", () => {
    expect(llmsTxt(sampleSpec, "https://exemple.fr")).toContain("# Plomberie Martin");
    expect(sitemapXml(sampleSpec, "https://exemple.fr")).toContain(
      "<loc>https://exemple.fr/contact</loc>",
    );
  });
});

describe("mentions légales", () => {
  const legal = {
    legalName: "Plomberie Martin SARL",
    legalForm: "SARL" as const,
    siret: "73282932000074",
    address: "12 rue de Paris, 93100 Montreuil",
    shareCapital: "5 000 €",
    publicationDirector: "Paul Martin",
  };
  const hosting = { name: "Hébergeur Test", address: "1 rue X, Paris", phone: "01 00 00 00 00" };

  it("affiche éditeur, SIRET, capital, directeur et hébergeur", () => {
    const html = renderToStaticMarkup(
      <SitePage
        spec={sampleSpec}
        slug="mentions-legales"
        baseUrl="x"
        legal={legal}
        hosting={hosting}
      />,
    );
    expect(html).toContain("Plomberie Martin SARL — SARL, au capital de 5 000 €");
    expect(html).toContain("732 829 320 00074");
    expect(html).toContain("Paul Martin");
    expect(html).toContain("Hébergeur Test");
    expect(html).toContain("CNIL");
  });

  it("signale les informations manquantes avant la commande", () => {
    const html = renderToStaticMarkup(
      <SitePage spec={sampleSpec} slug="mentions-legales" baseUrl="x" />,
    );
    expect(html).toContain("complétées lors de la mise en ligne");
  });
});
