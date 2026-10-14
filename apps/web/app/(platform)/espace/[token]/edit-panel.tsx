"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Entry = { role: "user" | "assistant"; content: string };

const EXAMPLES = [
  "Change mes horaires : du lundi au vendredi, 8h–18h",
  "Ajoute la prestation « Détartrage de chaudière »",
  "Mets un ton plus chaleureux dans le titre d'accueil",
];

/** Modification du site par message + annulation de la dernière modification. */
export function EditPanel({ token }: { token: string }) {
  const router = useRouter();
  const [log, setLog] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function call(path: string, body?: object, userText?: string) {
    setBusy(true);
    if (userText) setLog((l) => [...l, { role: "user", content: userText }]);
    try {
      const res = await fetch(`/api/espace/${token}/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      setLog((l) => [
        ...l,
        { role: "assistant", content: data.message ?? data.error ?? "Erreur inattendue" },
      ]);
      if (res.ok) router.refresh(); // recharge l'aperçu avec la nouvelle version
    } catch {
      setLog((l) => [...l, { role: "assistant", content: "Connexion impossible, réessayez." }]);
    } finally {
      setBusy(false);
    }
  }

  function submit(text: string) {
    const instruction = text.trim();
    if (!instruction || busy) return;
    setInput("");
    void call("edit", { instruction }, instruction);
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">Modifier mon site</h2>
      <p className="mt-1 text-sm text-ink/60">Décrivez le changement, on s&apos;occupe du reste.</p>

      <div className="mt-4 space-y-3" aria-live="polite">
        {log.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-left text-sm hover:border-brand"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
        {log.map((m, i) => (
          <div
            key={i}
            className={`rounded-2xl px-4 py-3 whitespace-pre-wrap ${
              m.role === "user" ? "ml-8 bg-brand text-white" : "mr-8 bg-white shadow-sm"
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && <div className="mr-8 rounded-2xl bg-white px-4 py-3 text-ink/50">…</div>}
      </div>

      <form
        className="mt-4 flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Ex. : remplace mon numéro par le 06 11 22 33 44"
          aria-label="Modification souhaitée"
          className="rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <button
            disabled={busy || input.trim().length < 3}
            className="flex-1 rounded-2xl bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-40"
          >
            Appliquer
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void call("undo")}
            className="rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-40"
          >
            ↶ Annuler la dernière
          </button>
        </div>
      </form>
    </section>
  );
}
