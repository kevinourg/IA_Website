# Prospection : règles du jeu

> Synthèse pratique des règles françaises applicables à la prospection **B2B** (artisans,
> commerçants, TPE), à jour à ma connaissance en octobre 2026. Ce n'est pas un avis juridique :
> à faire valider par un professionnel avant de lancer des envois à grande échelle.
> Références : CNIL (« La prospection commerciale par courrier électronique », « Prospection
> commerciale par téléphone »), RGPD art. 14 et 21, Code des postes et communications
> électroniques art. L34-5.

## Ce que l'outil fait pour vous

| Règle                                                 | Dans l'outil                                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Message en rapport avec la profession du destinataire | Le message propose un site pour **son activité professionnelle**             |
| Identifier l'expéditeur                               | Nom de la marque et signature dans chaque message                            |
| Indiquer l'origine des données (RGPD art. 14)         | Phrase automatique : « vos coordonnées proviennent de … »                    |
| Permettre de s'opposer simplement (RGPD art. 21)      | Lien de désinscription unique dans chaque e-mail et SMS                      |
| Ne plus jamais recontacter un désinscrit              | Statut « Désinscrit » verrouillé, et **réimport impossible** (dédoublonnage) |
| Respecter les entrepreneurs qui refusent la diffusion | L'import depuis l'annuaire **exclut** les entreprises non diffusibles        |
| Pas de données personnelles inutiles                  | Uniquement des données professionnelles ; pas d'adresse ni de numéro privé   |

## Ce qui reste de votre responsabilité

- **E-mail et SMS (B2B)** : autorisés sans consentement préalable si le message concerne la
  profession du destinataire, avec information et droit d'opposition (assurés par l'outil).
  Utilisez des **adresses et numéros professionnels**. Attention aux micro-entrepreneurs qui
  utilisent leur adresse ou leur numéro personnel : en cas de doute, appliquez les règles
  applicables aux particuliers (consentement préalable).
- **Téléphone** : le registre Bloctel concerne les particuliers. Pour les professionnels,
  appelez sur des numéros professionnels, à des horaires raisonnables, et notez immédiatement
  tout refus (statut « Désinscrit »).
- **Envois à la main, en petit volume** : l'outil prépare le message, vous l'envoyez depuis
  votre boîte ou votre téléphone. Pas d'envoi en masse automatisé : c'est aussi ce qui protège
  la réputation de votre domaine d'envoi.
- **Sources de prospects** : préférez l'annuaire officiel (intégré), vos contacts, salons et
  partenaires. **N'aspirez pas** Google Maps, PagesJaunes ou des annuaires privés : leurs
  conditions d'utilisation l'interdisent.
- **Durée de conservation** : un prospect sans réponse ne doit pas rester indéfiniment en base.
  Recommandation CNIL : 3 ans après le dernier contact. _(Purge automatique : à ajouter.)_
- **Politique de confidentialité** de la plateforme : doit mentionner le traitement de
  prospection (étape 11 de la phase 1).

## L'annuaire des entreprises

Import intégré au back-office, via l'API publique de l'État
[recherche-entreprises.api.gouv.fr](https://recherche-entreprises.api.gouv.fr) (données
SIRENE, gratuites, sans clé). Recherche par **métier** (code d'activité NAF) et par
**département ou code postal**.

On récupère : nom ou enseigne, adresse, SIRET. **Pas** de téléphone ni d'e-mail : à compléter
à la main à partir du site ou de la fiche publique de l'entreprise. Sont exclues les entreprises
fermées, non diffusibles, et les grandes entreprises (hors cible).

## Mesurer ce qui marche

Chaque projet garde sa provenance. Ajoutez des paramètres à vos liens pour suivre chaque canal
dans le tableau de bord (`/admin`) :

- publicité : `https://votre-site.fr/site-internet/plombier/lyon?utm_source=google&utm_medium=cpc&utm_campaign=plombiers-lyon`
- partenaire (comptable, CMA…) : `https://votre-site.fr/?ref=cabinet-durand`
- prospection : automatique (« prospection / annuaire-entreprises », « prospection / manuel »…)
