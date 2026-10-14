"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LEAD_STATUSES, LeadInputSchema, findTrade, type LeadInput } from "@site-ia/core";
import { assertAdmin } from "@/lib/admin-auth";
import { searchCompanies } from "@/lib/annuaire";
import { generateLeadPreview } from "@/lib/prospection";
import { repo } from "@/lib/services";

// Double protection : proxy.ts (HTTP Basic sur /admin) + assertAdmin() dans chaque action.

const back = (msg: string, path = "/admin/prospects") =>
  redirect(`${path}?msg=${encodeURIComponent(msg)}`);

const str = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? undefined : v;
};

export async function addLead(form: FormData) {
  await assertAdmin();
  const parsed = LeadInputSchema.safeParse({
    businessName: str(form, "businessName"),
    trade: str(form, "trade"),
    city: str(form, "city"),
    phone: str(form, "phone"),
    email: str(form, "email"),
    website: str(form, "website"),
    source: str(form, "source") ?? "manuel",
    notes: str(form, "notes"),
  });
  if (!parsed.success) back("Prospect invalide : vérifiez le nom et l'e-mail.");
  const { created } = await repo().createLeads([parsed.data!]);
  revalidatePath("/admin/prospects");
  back(created ? "Prospect ajouté." : "Ce prospect existe déjà (ou s'est désinscrit).");
}

/** Import collé depuis un tableur : une ligne par prospect, « nom ; métier ; ville ; téléphone ; e-mail ». */
export async function importCsv(form: FormData) {
  await assertAdmin();
  const source = str(form, "source") ?? "import";
  const lines = String(form.get("csv") ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const valid: LeadInput[] = [];
  for (const line of lines) {
    const [businessName, trade, city, phone, email] = line
      .split(/[;\t]/)
      .map((c) => c.trim() || undefined);
    const parsed = LeadInputSchema.safeParse({ businessName, trade, city, phone, email, source });
    if (parsed.success) valid.push(parsed.data);
  }
  const { created, skipped } = await repo().createLeads(valid);
  revalidatePath("/admin/prospects");
  back(
    `${created} prospect(s) importé(s), ${skipped} doublon(s) ou désinscrit(s) ignoré(s), ${lines.length - valid.length} ligne(s) invalide(s).`,
  );
}

export async function importAnnuaire(form: FormData) {
  await assertAdmin();
  const trade = findTrade(str(form, "trade") ?? "");
  const departement = str(form, "departement");
  const codePostal = str(form, "codePostal");
  if (!trade || (!departement && !codePostal))
    back("Choisissez un métier et un département ou un code postal.");
  let message: string;
  try {
    const { leads, total } = await searchCompanies({
      naf: trade!.naf,
      trade: trade!.slug,
      departement,
      codePostal,
      pages: Number(str(form, "pages") ?? 1),
    });
    const { created, skipped } = await repo().createLeads(leads);
    message = `Annuaire : ${total} entreprise(s) trouvée(s), ${created} prospect(s) ajouté(s), ${skipped} déjà connu(s) ou désinscrit(s).`;
  } catch (err) {
    message = `Import impossible : ${err instanceof Error ? err.message : String(err)}`;
  }
  revalidatePath("/admin/prospects");
  back(message);
}

export async function updateLead(form: FormData) {
  await assertAdmin();
  const id = String(form.get("id"));
  const status = str(form, "status");
  const lead = await repo().getLead(id);
  if (!lead) back("Prospect introuvable.");
  if (lead!.status === "opted_out" && status && status !== "opted_out") {
    back(
      "Ce prospect s'est désinscrit : son statut ne peut plus être modifié.",
      `/admin/prospects/${id}`,
    );
  }
  await repo().updateLead(id, {
    status: LEAD_STATUSES.includes(status as never)
      ? (status as (typeof LEAD_STATUSES)[number])
      : undefined,
    notes: str(form, "notes"),
    phone: str(form, "phone"),
    email: str(form, "email"),
  });
  revalidatePath(`/admin/prospects/${id}`);
  back("Prospect mis à jour.", `/admin/prospects/${id}`);
}

export async function markContacted(form: FormData) {
  await assertAdmin();
  const id = String(form.get("id"));
  const lead = await repo().getLead(id);
  if (lead && lead.status !== "opted_out" && lead.status !== "converted") {
    await repo().updateLead(id, { status: "contacted", lastContactedAt: new Date() });
  }
  revalidatePath(`/admin/prospects/${id}`);
  back("Marqué comme contacté.", `/admin/prospects/${id}`);
}

export async function createPreview(form: FormData) {
  await assertAdmin();
  const id = String(form.get("id"));
  const lead = await repo().getLead(id);
  if (!lead) back("Prospect introuvable.");
  let message = "Aperçu généré.";
  try {
    await generateLeadPreview(lead!);
  } catch (err) {
    message = `Génération impossible : ${err instanceof Error ? err.message : String(err)}`;
  }
  revalidatePath(`/admin/prospects/${id}`);
  back(message, `/admin/prospects/${id}`);
}
