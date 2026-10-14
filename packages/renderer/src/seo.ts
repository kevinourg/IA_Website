import type { Page, SiteSpec } from "@site-ia/core";

/** Données structurées schema.org (LocalBusiness + FAQPage) : clé du référencement local et GEO. */
export function jsonLd(spec: SiteSpec, page: Page, url: string): object[] {
  const b = spec.business;
  const out: object[] = [
    {
      "@context": "https://schema.org",
      "@type": b.schemaOrgType,
      name: b.name,
      description: page.seo.description,
      url,
      telephone: b.phone,
      email: b.email,
      address: b.address
        ? { "@type": "PostalAddress", streetAddress: b.address, addressLocality: b.city }
        : { "@type": "PostalAddress", addressLocality: b.city, addressCountry: "FR" },
      areaServed: [b.city, ...b.serviceArea].map((name) => ({ "@type": "City", name })),
      openingHours: b.openingHours,
    },
  ];
  const faq = page.sections.flatMap((s) => (s.type === "faq" ? s.items : []));
  if (faq.length) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    });
  }
  return out;
}

/** llms.txt : résumé lisible par les assistants IA (ChatGPT, Perplexity, Gemini…). */
export function llmsTxt(spec: SiteSpec, baseUrl: string): string {
  const b = spec.business;
  const services = spec.pages
    .flatMap((p) => p.sections)
    .flatMap((s) => (s.type === "services" ? s.items : []))
    .map((i) => `- ${i.name} : ${i.description}`);
  return [
    `# ${b.name}`,
    "",
    `> ${b.trade} à ${b.city}${b.serviceArea.length ? ` (intervient aussi à ${b.serviceArea.join(", ")})` : ""}.`,
    "",
    "## Prestations",
    ...services,
    "",
    "## Contact",
    b.phone && `- Téléphone : ${b.phone}`,
    b.email && `- E-mail : ${b.email}`,
    b.openingHours && `- Horaires : ${b.openingHours}`,
    "",
    "## Pages",
    ...spec.pages.map((p) => `- [${p.navLabel}](${baseUrl}/${p.slug})`),
    "",
  ]
    .filter((l): l is string => typeof l === "string")
    .join("\n");
}

export function sitemapXml(spec: SiteSpec, baseUrl: string): string {
  const urls = spec.pages.map((p) => `  <url><loc>${baseUrl}/${p.slug}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
