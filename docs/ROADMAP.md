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

Règles de prospection et fonctionnement de l'outil : [PROSPECTION.md](PROSPECTION.md).

### Socle

- [x] **Attribution** : provenance de chaque client (utm, parrain, page d'arrivée) sans cookie ;
      entonnoir démarrés → aperçus → commandés par canal dans `/admin`
- [x] **Pages métier × ville** : 15 métiers × 20 villes (`/site-internet/…`), contenu propre à
      chaque métier, FAQ, schema.org, plan du site, maillage interne, chat prérempli
- [x] **Back-office prospects** (`/admin`, protégé par mot de passe) : ajout, liste collée depuis
      un tableur, import depuis l'annuaire officiel des entreprises, statuts, notes
- [x] **Aperçu à froid** : génération du site d'un prospect + message prêt à envoyer (e-mail /
      SMS) avec origine des données et lien de désinscription
- [x] **Désinscription** : lien unique, prospect verrouillé et jamais réimporté
- [x] Prospect passé automatiquement en « Client » quand il commande

### À venir

- [ ] Définir `ADMIN_PASSWORD` et vérifier l'indexation des pages métier dans Google Search
      Console — au déploiement (étape 11)
- [ ] **Publicité locale** (Google Ads / Meta) vers les pages métier × ville, avec utm
- [ ] **Partenariats** : comptables, CMA/CCI, réseaux d'artisans — liens `?ref=` + suivi
- [ ] **Relances** des aperçus non commandés (avec consentement explicite à la relance)
- [ ] Purge automatique des prospects sans contact depuis 3 ans
- [ ] Enrichir le catalogue métiers / villes selon les résultats (qualité avant volume)
