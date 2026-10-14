# Instructions pour les agents IA travaillant sur ce dépôt

- Langue du produit et de la doc : **français**. Code et identifiants : anglais.
- Avant de commiter : `pnpm check` doit passer.
- Toute nouvelle fonctionnalité IA passe par `packages/ai` et `modelFor(task)` — jamais d'identifiant
  de modèle en dur, jamais le niveau `premium` par défaut. Préférer : petit modèle, sortie structurée
  validée par zod, patchs plutôt que régénération complète.
- Ne jamais permettre à l'IA d'inventer avis, prix, certifications ou chiffres : ajouter le garde-fou
  déterministe correspondant dans `enforceGuardrails()` si un nouveau champ le permet.
- Le format `SiteSpec` est le contrat entre IA et rendu : toute modification du schéma doit être
  rétrocompatible avec les versions en base (ou incrémenter `version` et écrire une migration).
- Les statuts de projet ne changent que via les transitions de `canTransition()` ; seul le webhook
  Stripe déclenche `paid`.
- Le mode mock (`MockProvider`, `MemoryRepository`) doit continuer à faire tourner tout le parcours.
