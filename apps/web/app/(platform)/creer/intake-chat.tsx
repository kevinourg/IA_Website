"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@site-ia/core";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Bonjour ! Quel est le nom de votre entreprise, votre métier et la ville où vous travaillez ?",
};

export function IntakeChat({ initialMessage }: { initialMessage?: string }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentInitial = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  // Accolades obligatoires : dans les navigateurs récents, scrollIntoView renvoie une Promise,
  // que React prendrait pour une fonction de nettoyage (« destroy is not a function »).
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function ensureProject(): Promise<string> {
    if (projectId) return projectId;
    const res = await fetch("/api/projects", { method: "POST" });
    if (!res.ok) throw new Error("Impossible de démarrer le projet");
    const { id } = (await res.json()) as { id: string };
    setProjectId(id);
    return id;
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    try {
      const id = await ensureProject();
      const res = await fetch(`/api/projects/${id}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Le service est momentanément indisponible");
      }
      const data = (await res.json()) as { reply: string; readyToGenerate: boolean };
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      setReady(data.readyToGenerate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "La génération a échoué");
      }
      router.push(`/apercu/${projectId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialMessage && !sentInitial.current) {
      sentInitial.current = true;
      void send(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <div className="flex-1 space-y-4" aria-live="polite">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
              m.role === "user" ? "ml-auto bg-brand text-white" : "bg-white shadow-sm"
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="w-fit rounded-2xl bg-white px-4 py-3 text-ink/50 shadow-sm">…</div>
        )}
        <div ref={bottom} />
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 whitespace-pre-wrap text-red-700">
          {error}
        </p>
      )}

      {ready && (
        <button
          onClick={generate}
          disabled={busy}
          className="mt-6 rounded-2xl bg-sun px-6 py-4 text-lg font-semibold text-ink disabled:opacity-50"
        >
          ✨ Générer l&apos;aperçu de mon site
        </button>
      )}

      <form
        className="sticky bottom-0 mt-6 flex gap-2 bg-paper py-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre réponse…"
          aria-label="Votre message"
          className="flex-1 rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-brand"
        />
        <button
          disabled={busy || !input.trim()}
          className="rounded-2xl bg-ink px-5 font-semibold text-paper disabled:opacity-40"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
