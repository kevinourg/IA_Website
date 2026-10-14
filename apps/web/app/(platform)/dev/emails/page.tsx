import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { devOutbox } from "@/lib/email";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "E-mails (dev)", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Boîte d'envoi locale : les e-mails qui seraient partis, quand RESEND_API_KEY n'est pas défini. */
export default function DevEmailsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const emails = devOutbox();
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">E-mails envoyés (développement)</h1>
      <p className="mt-2 text-ink/60">
        {env.RESEND_API_KEY
          ? "RESEND_API_KEY est défini : les e-mails partent réellement et n'apparaissent pas ici."
          : "Aucun e-mail ne part réellement : ils s'affichent ici. Rechargez la page après une action."}
      </p>
      {emails.length === 0 && <p className="mt-8 text-ink/60">Aucun e-mail pour l&apos;instant.</p>}
      <ul className="mt-8 space-y-8">
        {emails.map((m, i) => (
          <li key={i} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-ink/50">
              {m.sentAt.toLocaleString("fr-FR")} · à <strong>{m.to}</strong>
            </p>
            <p className="font-semibold">{m.subject}</p>
            <iframe
              title={m.subject}
              srcDoc={m.html}
              sandbox=""
              className="mt-3 h-[420px] w-full rounded-xl border border-ink/10"
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
