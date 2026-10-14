import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-4xl font-extrabold">Merci pour votre commande 🎉</h1>
      <p className="mt-4 text-ink/70">
        Votre site est en cours de mise en ligne. Vous recevrez un e-mail dès qu&apos;il est
        accessible (généralement en moins de 30 minutes).
      </p>
      <Link href="/" className="mt-8 inline-block font-semibold text-brand">
        ← Retour à l&apos;accueil
      </Link>
    </main>
  );
}
