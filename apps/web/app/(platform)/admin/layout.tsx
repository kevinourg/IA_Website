import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Back-office — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const open = !process.env.ADMIN_PASSWORD;
  return (
    <div className="min-h-dvh">
      <header className="border-b border-ink/10 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-4 text-sm">
          <span className="font-display text-lg font-extrabold">{BRAND.name} · Back-office</span>
          <Link href="/admin" className="hover:text-brand">
            Tableau de bord
          </Link>
          <Link href="/admin/prospects" className="hover:text-brand">
            Prospects
          </Link>
        </nav>
      </header>
      {open && (
        <p className="bg-sun/30 px-5 py-2 text-center text-sm">
          ⚠️ Back-office sans mot de passe (développement). Définir <code>ADMIN_PASSWORD</code>{" "}
          avant toute mise en ligne.
        </p>
      )}
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </div>
  );
}
