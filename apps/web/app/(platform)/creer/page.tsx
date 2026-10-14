import type { Metadata } from "next";
import { IntakeChat } from "./intake-chat";

export const metadata: Metadata = { title: "Créer mon site" };

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8">
      <h1 className="font-display text-3xl font-extrabold">Parlez-nous de votre activité</h1>
      <p className="mt-2 text-ink/60">
        Quelques échanges suffisent. Vous verrez votre site avant de payer.
      </p>
      <IntakeChat initialMessage={q} />
    </main>
  );
}
