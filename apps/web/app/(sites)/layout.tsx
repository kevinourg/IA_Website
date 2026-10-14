/** Layout racine des sites clients : aucun style de la plateforme n'y fuit. */
export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
