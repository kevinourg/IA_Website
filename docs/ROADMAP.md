# Feuille de route

## Phase 1 — L'application

### ✅ Socle (fait)

- Monorepo pnpm + Turborepo, TypeScript strict, CI GitHub Actions, Dependabot
- Chat d'accueil → brief structuré, génération SiteSpec, aperçu, modification par patch
- Routage des modèles par coût, prompt caching, plafonds, suivi de consommation, mode mock
- Rendu multi-tenant (sous-domaines + domaines personnalisés), schema.org, sitemap, robots, llms.txt
- Stripe Checkout + webhook, mode démo sans Stripe en local
- Schéma Postgres (Drizzle) + dépôt mémoire

### ⏭️ Prochaines étapes (ordre conseillé)

1. **Choix du nom et du positionnement prix** → `apps/web/lib/brand.ts`, `packages/core/src/pricing.ts`
2. **Brancher la vraie IA** (`ANTHROPIC_API_KEY`) et itérer sur la qualité des prompts avec un jeu
   de 20 métiers × villes ; mesurer le coût réel par site dans `ai_usage`
3. **Streaming** de la génération (afficher le site qui se construit) — effet « waouh » de l'aperçu
4. **Images** : banque d'images libre de droits par métier (Unsplash/Pexels API) + upload des photos du client
5. **Espace client** : connexion par lien magique, chat de modification, historique des versions,
   demandes reçues
6. **Provisioning domaine** : achat .fr via registrar (OVH / Gandi API), DNS, HTTPS, domaines clients
7. **E-mails transactionnels** (Resend ou Brevo) : bienvenue, site en ligne, nouvelle demande, rapport mensuel
8. **Mentions légales complètes** : collecter SIRET, forme juridique, directeur de publication à la commande
9. **Back-office** : liste des projets, coûts IA, chiffre d'affaires, relance des aperçus non payés
10. **Statistiques de visite** respectueuses du RGPD (Plausible / Umami) pour le rapport mensuel
11. Déploiement (Vercel + Postgres UE), monitoring (Sentry), CGV / politique de confidentialité

## Phase 2 — Acquisition de leads

Préparé dès maintenant : table `leads` + `projects.leadId` pour mesurer le coût d'acquisition par canal.

- **SEO programmatique** : pages « site internet pour <métier> à <ville> » générées par le même moteur
- **Aperçu à froid** : générer l'aperçu du site d'un prospect sans site et le lui envoyer
  (« voici votre site, prêt à être mis en ligne ») — conversion forte, mais **cadre RGPD/LCEN strict**
  pour la prospection B2B (intérêt légitime, information, opposition facile)
- **Publicité locale** (Google Ads / Meta) par métier, avec landing dédiée
- **Partenariats** : comptables, CMA/CCI, réseaux d'artisans, parrainage client
- **Relances** des aperçus non payés (e-mail J+1, J+3)
