"use server";

import { redirect } from "next/navigation";
import { repo } from "@/lib/services";

export async function optOut(form: FormData) {
  const token = String(form.get("token") ?? "");
  const lead = await repo().findLeadByOptOutToken(token);
  if (!lead) redirect("/");
  if (lead.status !== "opted_out") {
    const stamp = new Date().toISOString().slice(0, 10);
    await repo().updateLead(lead.id, {
      status: "opted_out",
      notes: [lead.notes, `Désinscrit le ${stamp} via le lien.`].filter(Boolean).join("\n"),
    });
  }
  redirect(`/desinscription/${token}?ok=1`);
}
