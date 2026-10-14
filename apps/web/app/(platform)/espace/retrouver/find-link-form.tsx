"use client";

import { useState } from "react";

export function FindLinkForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/espace/lien", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { message?: string; error?: string };
    setResult(data?.message ?? data?.error ?? "Connexion impossible, réessayez.");
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vous@exemple.fr"
        aria-label="Adresse e-mail"
        autoComplete="email"
        className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-brand"
      />
      <button
        disabled={busy}
        className="w-full rounded-xl bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-50"
      >
        Recevoir mon lien
      </button>
      {result && (
        <p className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm" role="status">
          {result}
        </p>
      )}
    </form>
  );
}
