import Link from "next/link";
import { OFFER, formatEuros } from "@site-ia/core";
import { BRAND } from "@/lib/brand";

const STEPS = [
  {
    title: "Décrivez votre activité",
    body: "Métier, ville, prestations : quelques phrases dans le chat suffisent. Aucun formulaire à rallonge.",
  },
  {
    title: "Découvrez votre site",
    body: "L'IA conçoit un site unique — textes, mise en page, couleurs — et vous le montre avant tout paiement.",
  },
  {
    title: "Mise en ligne le jour même",
    body: "Domaine, hébergement sécurisé et référencement local configurés. Vous modifiez ensuite par simple message.",
  },
];

const FAQ = [
  {
    q: "Est-ce que je paie avant de voir mon site ?",
    a: "Non. L'aperçu est gratuit et sans engagement : vous ne payez que s'il vous plaît.",
  },
  {
    q: "Mon site ressemblera-t-il à celui de mon concurrent ?",
    a: "Non. Chaque site est conçu à partir de votre activité : structure, textes, couleurs et typographies sont choisis pour vous.",
  },
  {
    q: "Et si je veux changer quelque chose plus tard ?",
    a: "Envoyez un message (« change mes horaires », « ajoute une prestation ») : c'est appliqué dans la foulée.",
  },
  {
    q: "Le nom de domaine m'appartient-il ?",
    a: "Oui, il est à votre nom. Si vous partez, vous le gardez.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <span className="font-display text-2xl font-extrabold">{BRAND.name}</span>
        <Link
          href="/creer"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:opacity-90"
        >
          Créer mon site
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-12 pb-20 md:pt-20">
        <p className="mb-4 text-sm font-semibold tracking-widest text-brand uppercase">
          Artisans · Commerçants · Indépendants
        </p>
        <h1 className="font-display max-w-4xl text-4xl leading-[1.05] font-extrabold md:text-7xl">
          Votre site pro, conçu par IA,{" "}
          <span className="text-brand">en ligne aujourd&apos;hui.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink/70">
          Décrivez votre activité en quelques phrases. Voyez votre site avant de payer. Domaine,
          hébergement et référencement local inclus.
        </p>
        <form action="/creer" className="mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input
            name="q"
            placeholder="Ex. : Je suis plombier à Montreuil, dépannage et chauffe-eau…"
            className="flex-1 rounded-2xl border border-ink/15 bg-white px-5 py-4 text-base shadow-sm outline-none focus:border-brand"
          />
          <button className="rounded-2xl bg-brand px-6 py-4 font-semibold text-white hover:bg-brand-dark">
            Voir mon site →
          </button>
        </form>
        <p className="mt-3 text-sm text-ink/50">Aperçu gratuit · Sans carte bancaire</p>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">Comment ça marche</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl border border-ink/10 p-7">
                <span className="font-display text-5xl font-extrabold text-sun">{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-ink/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20" id="tarifs">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">Un prix clair</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[OFFER.creation, OFFER.hosting].map((plan) => (
            <div key={plan.label} className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold">{plan.label}</h3>
              <p className="font-display mt-3 text-5xl font-extrabold">
                {formatEuros(plan.amountCents)}
                <span className="font-sans text-base font-normal text-ink/60">
                  {"interval" in plan ? " / mois" : " TTC, une fois"}
                </span>
              </p>
              <ul className="mt-6 space-y-2 text-ink/80">
                {plan.includes.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink/60">
          Sans engagement. {OFFER.hosting.trialDays} jours d&apos;hébergement offerts.
        </p>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">Questions fréquentes</h2>
          <div className="mt-8 divide-y divide-ink/10">
            {FAQ.map((f) => (
              <details key={f.q} className="py-5">
                <summary className="cursor-pointer text-lg font-semibold">{f.q}</summary>
                <p className="mt-3 text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-ink/60">
        © {new Date().getFullYear()} {BRAND.name} · {BRAND.supportEmail} ·{" "}
        <Link href="/espace/retrouver" className="underline">
          Déjà client ? Retrouver mon espace
        </Link>
      </footer>
    </main>
  );
}
