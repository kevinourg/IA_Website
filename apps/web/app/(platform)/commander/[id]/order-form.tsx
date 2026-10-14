"use client";

import { useState } from "react";

type Errors = Record<string, string[] | undefined>;

const SOLE_TRADER = "Entrepreneur individuel (EI / micro-entreprise)";

export function OrderForm({
  projectId,
  legalForms,
  defaults,
}: {
  projectId: string;
  legalForms: string[];
  defaults: { email: string; legalName: string; address: string };
}) {
  const [legalForm, setLegalForm] = useState(SOLE_TRADER);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const isCompany = legalForm !== SOLE_TRADER && legalForm !== "Association";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const f = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = String(f.get(k) ?? "").trim();
      return v === "" ? undefined : v;
    };
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId,
          email: get("email"),
          legal: {
            legalName: get("legalName"),
            legalForm,
            siret: get("siret"),
            address: get("address"),
            shareCapital: isCompany ? get("shareCapital") : undefined,
            vatNumber: get("vatNumber"),
            publicationDirector: get("publicationDirector"),
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        redirect?: string;
        error?: string;
        fields?: Errors;
      };
      if (res.ok && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      setError(data.error ?? "Une erreur est survenue.");
      if (data.fields) setFieldErrors(data.fields);
    } catch {
      setError("Connexion impossible, réessayez.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Votre accès</legend>
        <Field
          name="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          defaultValue={defaults.email}
          hint="Vous y recevrez le lien de votre espace et les demandes de vos clients."
          errors={fieldErrors.email}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Mentions légales de votre site</legend>
        <p className="text-sm text-ink/60">
          Obligatoires sur tout site professionnel en France. Elles apparaîtront sur la page «
          Mentions légales » de votre site.
        </p>
        <label className="block">
          <span className="font-medium">Forme juridique</span>
          <select
            value={legalForm}
            onChange={(e) => setLegalForm(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
          >
            {legalForms.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <Field
          name="legalName"
          label={isCompany ? "Raison sociale" : "Nom et prénom (ou nom commercial)"}
          defaultValue={defaults.legalName}
          errors={fieldErrors["legal.legalName"]}
        />
        <Field
          name="siret"
          label="Numéro SIRET"
          inputMode="numeric"
          placeholder="14 chiffres"
          errors={fieldErrors["legal.siret"]}
        />
        <Field
          name="address"
          label={isCompany ? "Adresse du siège" : "Adresse professionnelle"}
          autoComplete="street-address"
          defaultValue={defaults.address}
          errors={fieldErrors["legal.address"]}
        />
        {isCompany && (
          <Field
            name="shareCapital"
            label="Capital social"
            placeholder="Ex. : 5 000 €"
            errors={fieldErrors["legal.shareCapital"]}
          />
        )}
        <Field
          name="publicationDirector"
          label="Directeur de la publication"
          hint={isCompany ? "En général le gérant ou le président." : "En général vous-même."}
          autoComplete="name"
          errors={fieldErrors["legal.publicationDirector"]}
        />
        <Field name="vatNumber" label="N° de TVA intracommunautaire (facultatif)" />
      </fieldset>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}

      <button
        disabled={busy}
        className="w-full rounded-2xl bg-sun px-6 py-4 text-lg font-semibold text-ink disabled:opacity-50"
      >
        {busy ? "Un instant…" : "Continuer vers le paiement"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  hint,
  errors,
  ...input
}: {
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        aria-invalid={errors ? true : undefined}
        className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-brand ${
          errors ? "border-red-400" : "border-ink/15"
        }`}
        {...input}
      />
      {hint && !errors && <span className="mt-1 block text-sm text-ink/50">{hint}</span>}
      {errors?.map((e) => (
        <span key={e} className="mt-1 block text-sm text-red-600">
          {e}
        </span>
      ))}
    </label>
  );
}
