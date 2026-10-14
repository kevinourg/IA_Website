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
