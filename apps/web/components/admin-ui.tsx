"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

/** Bouton d'envoi qui affiche un état d'attente (actions longues : génération IA, import). */
export function SubmitButton({
  children,
  pending: pendingLabel = "Un instant…",
  className = "",
}: {
  children: React.ReactNode;
  pending?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={`rounded-xl bg-ink px-4 py-2.5 font-semibold text-paper disabled:opacity-50 ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm font-semibold"
    >
      {done ? "Copié ✓" : label}
    </button>
  );
}
