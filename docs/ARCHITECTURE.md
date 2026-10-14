# Architecture

## Vue d'ensemble

```
 Client ──chat──▶ /creer ──▶ API messages ──▶ IA "fast"  ──▶ BusinessBrief (JSON validé)
                                                               │
                         bouton « Générer » ──▶ API generate ──▶ IA "balanced" ──▶ SiteSpec (JSON validé)
                                                               │                     │ garde-fous déterministes
                                                               ▼                     ▼
                                                     /apercu/<id>  ◀── renderer ── site_versions (v1, v2…)
                                                               │
                                     « Mettre en ligne » ──▶ Stripe Checkout ──▶ webhook ──▶ status = live
                                                               │
           visiteur ──▶ plomberie-martin.<domaine> ──▶ proxy.ts ──▶ /s/<host> ──▶ renderer
```

Une **seule application Next.js** sert la plateforme et tous les sites clients (multi-tenant par
nom d'hôte, cf. `apps/web/proxy.ts`). Pas de build ni de déploiement par client : publier un site
= écrire une ligne en base.

## Choix structurants

### 1. L'IA produit un JSON, pas du HTML

L'IA remplit un `SiteSpec` (schéma zod dans `packages/core/src/site-spec.ts`) ; le renderer le
transforme en page. Conséquences :

- **fiabilité** : la sortie est validée, une erreur de schéma déclenche une relance avec les
  erreurs, jamais un site cassé en ligne ;
- **unicité sans modèle figé** : variantes de sections × palettes × typographies × textes rédigés
  pour le métier et la ville ;
- **modifications bon marché** : « change mes horaires » = un patch JSON de quelques octets
  produit par le petit modèle, au lieu de régénérer tout le site ;
- **versionnage** : chaque génération/modification crée une `site_version` → retour arrière facile.

### 2. Optimisation du coût IA (`packages/ai/src/models.ts`)

| Tâche                 | Niveau     | Modèle par défaut   | Fréquence             |
| --------------------- | ---------- | ------------------- | --------------------- |
| Chat d'accueil        | `fast`     | `claude-haiku-5-5`  | 3–6 appels par client |
| Génération du site    | `balanced` | `claude-sonnet-5-5` | 1 (max 3) par projet  |
| Modification par chat | `fast`     | `claude-haiku-5-5`  | à la demande          |
| Réservé               | `premium`  | `claude-opus-5-5`   | jamais par défaut     |

Leviers complémentaires :

- **prompt caching** : les prompts système sont stables et marqués `cache_control` ;
- **plafonds** : messages par conversation, générations par projet (`MAX_GENERATIONS_PER_PROJECT`) ;
- **suivi** : chaque appel est journalisé dans `ai_usage` (tokens par tâche et modèle) → coût réel
  par client vendu ;
- **mode mock** : développement et tests sans aucun appel payant.

Les identifiants de modèles se changent par variable d'environnement (`AI_MODEL_FAST`…), sans code.

### 3. Garde-fous anti-contenu inventé

Règle produit : **on n'invente rien** qui engage le client (avis, certifications, prix, chiffres).
Appliquée à deux niveaux : dans les prompts, puis de façon déterministe dans
`enforceGuardrails()` (coordonnées reprises du brief, section d'avis supprimée sans vrais avis).
Les mentions légales sont générées par le code, jamais par l'IA.

### 4. Référencement local et assistants IA (GEO)

Chaque site sert automatiquement : données structurées schema.org (`LocalBusiness` typé + `FAQPage`),
balises title/description par page, `sitemap.xml`, `robots.txt`, et `llms.txt` (résumé lisible par
ChatGPT, Perplexity, Gemini). La FAQ métier générée alimente à la fois Google et les assistants.

### 5. Paiement

Stripe Checkout en mode abonnement : prix unique de création + abonnement mensuel d'hébergement
avec période d'essai. **Seul le webhook** fait passer un projet en `paid`/`live`
(`packages/core/src/project.ts` contrôle les transitions autorisées).

## Modèle de données (`packages/db/src/schema.ts`)

`customers` · `projects` (conversation + brief + statut) · `site_versions` · `domains` · `orders` ·
`ai_usage` · `contact_submissions` · `leads` (phase 2, posée dès maintenant pour l'attribution).

## Hébergement cible

Vercel (wildcard `*.domaine` + domaines clients via l'API Vercel Domains) ou équivalent ;
Postgres managé (Neon, Supabase, Scaleway). Données en UE à privilégier (RGPD).
