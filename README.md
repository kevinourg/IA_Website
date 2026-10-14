# SiteIA _(nom provisoire)_

Plateforme qui vend des **sites vitrines conçus par IA** aux artisans, commerçants et TPE.
Le client décrit son activité dans un chat, voit son site **avant de payer**, puis le met en ligne
le jour même. Les modifications se font ensuite par simple message.

Inspiré de [En2Deux](https://en2deux.fr) et [Sitenow](https://sitenow.app) — voir
[docs/BENCHMARK.md](docs/BENCHMARK.md).

## Démarrage rapide

```bash
nvm use            # Node 22
corepack enable    # active pnpm
pnpm install
cp .env.example apps/web/.env.local
pnpm dev           # http://localhost:3000
```

**Sans aucune clé**, tout fonctionne en local :

| Service  | Sans configuration                  | Avec configuration           |
| -------- | ----------------------------------- | ---------------------------- |
| IA       | réponses simulées (gratuit)         | `ANTHROPIC_API_KEY` → Claude |
| Base     | mémoire (perdue au redémarrage)     | `DATABASE_URL` → Postgres    |
| Paiement | mode démo : mise en ligne immédiate | `STRIPE_*` → Stripe Checkout |

État des services : `GET /api/health`.

### Tester avec ton abonnement Claude (sans clé API)

Pour du **développement local uniquement** (interdit en production par les conditions d'Anthropic) :

1. Installe [Claude Code](https://code.claude.com) et connecte-toi : lance `claude`, puis `/login` avec ton compte Claude.
2. C'est tout : `apps/web/.env.development` active déjà ce mode avec `pnpm dev`
   (`/api/health` affiche `"ai":"claude-cli"`). Pour revenir aux réponses simulées,
   mets `AI_PROVIDER=mock` dans `apps/web/.env.local`.

Les appels consomment le quota de ton abonnement. Sous Windows, si `claude` est introuvable,
renseigne `CLAUDE_CLI_PATH` avec le chemin complet de `claude.exe`.

### Parcours à tester

1. `http://localhost:3000` → décrire son activité → **Générer l'aperçu**
2. Sur l'aperçu, **Mettre en ligne** → formulaire de commande (e-mail + mentions légales ;
   SIRET de test valide : `732 829 320 00074`) → en mode démo, mise en ligne immédiate et
   arrivée dans l'**espace client** (lien privé).
3. Le site client est servi sur `http://<slug>.localhost:3000` avec `/mentions-legales`,
   `llms.txt`, `sitemap.xml` et `robots.txt`.
4. Les e-mails (site en ligne, nouvelle demande, lien perdu) s'affichent sur
   `http://localhost:3000/dev/emails` tant que `RESEND_API_KEY` n'est pas défini.

### Acquisition (phase 2)

- Pages métier × ville : `http://localhost:3000/site-internet`
- Back-office (prospects, entonnoir par canal) : `http://localhost:3000/admin`
  — ouvert en local, protégé par `ADMIN_PASSWORD` sinon.
- Règles de prospection : [docs/PROSPECTION.md](docs/PROSPECTION.md)

### Avec Postgres

```bash
docker compose up -d
pnpm db:generate && pnpm db:migrate
```

## Structure

```
apps/web            Next.js 16 — landing, chat de création, aperçu, paiement, hébergement des sites clients
packages/core       Domaine : schémas (brief, SiteSpec), offre/prix, cycle de vie projet
packages/ai         Pipeline IA : routage des modèles, prompts, génération, édition par patch, mock
packages/renderer   Rendu des sites clients (sections, thèmes, schema.org, llms.txt, sitemap)
packages/db         Drizzle + Postgres, dépôt en mémoire pour le dev
docs/               Architecture, benchmark concurrents, feuille de route
```

## Commandes

| Commande         | Rôle                                        |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Lance l'app                                 |
| `pnpm check`     | Format + lint + types + tests (comme la CI) |
| `pnpm test`      | Tests unitaires (Vitest)                    |
| `pnpm build`     | Build de production                         |
| `pnpm db:studio` | Explorer la base                            |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — comment un site est généré, servi et facturé
- [Benchmark](docs/BENCHMARK.md) — En2Deux, Sitenow, ce qu'on reprend et où on se différencie
- [Feuille de route](docs/ROADMAP.md) — phase 1 (app) et phase 2 (acquisition de leads)
- [Prospection](docs/PROSPECTION.md) — règles françaises (RGPD, B2B) et fonctionnement de l'outil
