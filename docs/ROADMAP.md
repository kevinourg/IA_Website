# Feuille de route

> Les cases sont cochées au fur et à mesure. **Bloquant** = nécessaire avant de vendre un premier site.

## Phase 1 — L'application

### Socle

- [x] Monorepo, TypeScript strict, CI GitHub Actions, Dependabot
- [x] Chat de création → brief structuré → génération du site → aperçu avant paiement
- [x] Mise en ligne sur sous-domaine (multi-sites), schema.org, sitemap, robots, llms.txt
- [x] Coût IA maîtrisé : routage des modèles, cache, plafonds, suivi de consommation, mode simulation
- [x] Tests en local avec l'abonnement Claude (via Claude Code)
- [x] Paiement Stripe prêt à brancher (mode démo en local)

### Reste à faire (ordre conseillé)

- [ ] **1. Nom de marque et prix** — _Bloquant_ — décision de Kevin
      (`apps/web/lib/brand.ts`, `packages/core/src/pricing.ts`)
- [ ] **2. Qualité de génération** — _Bloquant_ — IA branchée ✅, reste à améliorer textes et design
      sur ~20 métiers × villes et mesurer le coût réel par site (`ai_usage`)
  - [ ] Images : banque d'images libre de droits par métier + photos fournies par le client
- [x] **5. Espace client** — lien privé secret, modification par message, annulation, demandes reçues
- [ ] **6. Achat automatique des noms de domaine** (registrar OVH / Gandi, DNS, HTTPS) — _Bloquant_
- [x] **7. E-mails automatiques** — site en ligne + lien de l'espace, nouvelle demande reçue,
      « retrouver mon espace » ; boîte de test `/dev/emails` en local
  - [ ] Brancher Resend (`RESEND_API_KEY`) et vérifier le domaine d'envoi — au déploiement (11)
  - [x] Rapport mensuel de visites (avec l'étape 10)
- [x] **8. Mentions légales complètes** — saisies à la commande (forme juridique, SIRET vérifié,
      siège, capital, directeur de publication, TVA), page générée + information RGPD et CNIL
  - [ ] Renseigner l'hébergeur (`HOSTING` dans `apps/web/lib/brand.ts`) — au déploiement (11)
- [ ] **9. Back-office** (projets, coûts IA, chiffre d'affaires, relance des aperçus non payés) — plus tard
- [x] **10. Statistiques de visite** — mesure maison sans cookie ni donnée personnelle (exemptée de
      consentement) : visites, pages vues, sources (Google, ChatGPT…), clics téléphone / e-mail ;
      affichées dans l'espace client + rapport mensuel par e-mail
  - [ ] Planifier `/api/cron/rapport-mensuel` le 1er du mois avec `CRON_SECRET` — au déploiement (11)
- [ ] **11. Mise en ligne de la plateforme** (Vercel + Postgres UE), monitoring, CGV,
      politique de confidentialité — _Bloquant_
  - [ ] Héberger les polices des sites clients en local (Google Fonts transmet l'IP des visiteurs
        à Google : point d'attention RGPD)

**Chemin le plus court vers un premier site vendu** : 1 → 2 → 6 → 11.

_Retirés : l'ancienne étape 3 (affichage du site pendant sa construction) ; l'ancienne étape 4
(images) est intégrée à l'étape 2._

## Phase 2 — Acquisition de leads

Préparé dès maintenant : table `leads` + `projects.leadId` pour mesurer le coût d'acquisition par canal.

- [ ] **SEO programmatique** : pages « site internet pour <métier> à <ville> » générées par le même moteur
- [ ] **Aperçu à froid** : générer l'aperçu du site d'un prospect sans site et le lui envoyer —
      conversion forte, mais **cadre RGPD/LCEN strict** pour la prospection B2B
      (intérêt légitime, information, opposition facile)
- [ ] **Publicité locale** (Google Ads / Meta) par métier, avec landing dédiée
- [ ] **Partenariats** : comptables, CMA/CCI, réseaux d'artisans, parrainage client
- [ ] **Relances** des aperçus non payés (e-mail J+1, J+3)
