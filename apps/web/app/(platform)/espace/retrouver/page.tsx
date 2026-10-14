import type { Metadata } from "next";
import { FindLinkForm } from "./find-link-form";

export const metadata: Metadata = { title: "Retrouver mon espace" };

export default function FindSpacePage() {
  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold">Retrouver mon espace</h1>
      <p className="mt-2 text-ink/70">
        Indiquez l&apos;adresse e-mail utilisée lors de votre commande : nous vous renvoyons le lien
        d&apos;accès à votre espace.
      </p>
      <FindLinkForm />
    </main>
  );
}
