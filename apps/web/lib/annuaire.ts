import "server-only";
import { companyToLead, type CompanySearchResult, type LeadInput } from "@site-ia/core";

const API = "https://recherche-entreprises.api.gouv.fr/search";

/**
 * Recherche d'entreprises actives dans l'annuaire officiel (API publique et gratuite de l'État,
 * données SIRENE). Ne fournit aucune coordonnée personnelle : nom, adresse et SIRET seulement.
 * Pages lues une par une (l'API limite le nombre de requêtes par seconde).
 */
export async function searchCompanies(
  q: { naf: string; trade: string; departement?: string; codePostal?: string; pages?: number },
  fetchImpl: typeof fetch = fetch,
): Promise<{ leads: LeadInput[]; total: number }> {
  const leads: LeadInput[] = [];
  let total = 0;
  const pages = Math.min(Math.max(q.pages ?? 1, 1), 5);
  for (let page = 1; page <= pages; page++) {
    const params = new URLSearchParams({
      activite_principale: q.naf,
      etat_administratif: "A",
      per_page: "25",
      page: String(page),
    });
    if (q.codePostal) params.set("code_postal", q.codePostal);
    else if (q.departement) params.set("departement", q.departement);
    const res = await fetchImpl(`${API}?${params}`, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Annuaire des entreprises : erreur ${res.status}`);
    const data = (await res.json()) as {
      results: CompanySearchResult[];
      total_results: number;
      total_pages: number;
    };
    total = data.total_results;
    for (const r of data.results) {
      const lead = companyToLead(r, q.trade);
      if (lead) leads.push(lead);
    }
    if (page >= data.total_pages) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  return { leads, total };
}
