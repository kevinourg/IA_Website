/**
 * Catalogue des pages d'acquisition « site internet pour <métier> à <ville> ».
 *
 * Qualité avant volume : Google pénalise les pages produites en masse sans valeur propre.
 * Chaque métier a donc un contenu rédigé spécifiquement (enjeux, pages utiles, FAQ), et le
 * nombre de combinaisons reste limité. Ajouter un métier = rédiger un vrai contenu.
 *
 * `naf` sert aussi à la prospection (import depuis l'annuaire des entreprises).
 */
export type Trade = {
  slug: string;
  label: string; // « plombier »
  plural: string; // « plombiers »
  naf: string; // code d'activité INSEE (NAF rév. 2)
  schemaType: string; // type schema.org pour les sites générés
  pitch: string; // pourquoi un site compte pour ce métier
  pages: string[]; // pages typiques d'un site pour ce métier
  faq: { q: string; a: string }[];
};

export type City = { slug: string; name: string; department: string };

export const TRADES: Trade[] = [
  {
    slug: "plombier",
    label: "plombier",
    plural: "plombiers",
    naf: "43.22A",
    schemaType: "Plumber",
    pitch:
      "Une fuite ne prévient pas : vos clients cherchent un plombier sur leur téléphone, dans l'urgence, et appellent le premier qui inspire confiance. Un site clair, avec votre numéro bien visible et votre zone d'intervention, fait la différence face aux plateformes de mise en relation.",
    pages: [
      "Dépannage et urgences",
      "Installation et remplacement de chauffe-eau",
      "Rénovation de salle de bain",
      "Zone d'intervention",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Mon numéro sera-t-il mis en avant pour les urgences ?",
        a: "Oui : un bouton d'appel est visible dès l'ouverture du site sur mobile, et votre numéro figure sur chaque page.",
      },
      {
        q: "Puis-je afficher mes tarifs de déplacement ?",
        a: "Si vous le souhaitez. Nous n'affichons jamais de prix que vous ne nous avez pas donnés.",
      },
      {
        q: "Mes communes d'intervention apparaîtront-elles sur Google ?",
        a: "Votre site liste vos communes et les déclare dans les données lues par Google, ce qui aide les recherches du type « plombier + ville ».",
      },
    ],
  },
  {
    slug: "chauffagiste",
    label: "chauffagiste",
    plural: "chauffagistes",
    naf: "43.22B",
    schemaType: "HVACBusiness",
    pitch:
      "Pompes à chaleur, chaudières, entretien annuel : vos clients comparent avant de signer un devis important. Un site qui explique vos prestations et vos qualifications rassure et vous évite de répéter les mêmes explications au téléphone.",
    pages: [
      "Pompes à chaleur",
      "Chaudières et entretien",
      "Climatisation",
      "Aides et qualifications",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je présenter mes qualifications (RGE, etc.) ?",
        a: "Oui, si vous nous les indiquez. Nous n'en inventons jamais : seules celles que vous déclarez apparaissent.",
      },
      {
        q: "Le site peut-il gérer les demandes d'entretien annuel ?",
        a: "Le formulaire de contact vous transmet chaque demande par e-mail ; vous les retrouvez aussi dans votre espace.",
      },
      {
        q: "Et si mon activité est saisonnière ?",
        a: "Vous modifiez vos mises en avant par simple message, par exemple la climatisation l'été et le chauffage l'hiver.",
      },
    ],
  },
  {
    slug: "electricien",
    label: "électricien",
    plural: "électriciens",
    naf: "43.21A",
    schemaType: "Electrician",
    pitch:
      "Mise aux normes, dépannage, bornes de recharge : les particuliers veulent un électricien sérieux et joignable. Votre site présente vos interventions et fait de chaque visiteur un appel ou une demande de devis.",
    pages: [
      "Dépannage électrique",
      "Mise aux normes",
      "Bornes de recharge",
      "Rénovation électrique",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je mettre en avant l'installation de bornes de recharge ?",
        a: "Oui, chaque prestation peut avoir sa propre page, ce qui aide aussi le référencement sur cette recherche précise.",
      },
      {
        q: "Le site sera-t-il adapté aux téléphones ?",
        a: "Oui, la grande majorité de vos visiteurs viendront d'un mobile : le site est conçu pour eux en priorité.",
      },
      {
        q: "Faut-il fournir des photos ?",
        a: "C'est un plus, mais pas obligatoire : le site est livré prêt, et vous ajoutez vos photos quand vous voulez.",
      },
    ],
  },
  {
    slug: "serrurier",
    label: "serrurier",
    plural: "serruriers",
    naf: "43.32B",
    schemaType: "Locksmith",
    pitch:
      "Le métier souffre des arnaques au dépannage : vos futurs clients se méfient. Un site transparent, avec votre vrai nom, votre adresse et vos mentions légales complètes, est votre meilleur argument face aux annonces douteuses.",
    pages: [
      "Ouverture de porte",
      "Changement de serrure",
      "Blindage et sécurisation",
      "Zone d'intervention",
      "Contact",
    ],
    faq: [
      {
        q: "Comment montrer que je suis un professionnel sérieux ?",
        a: "Votre site affiche vos informations légales réelles (SIRET, adresse) et vos coordonnées directes : c'est ce que les clients vérifient.",
      },
      {
        q: "Puis-je être trouvé la nuit et le week-end ?",
        a: "Vous indiquez vos horaires réels, y compris les urgences ; ils apparaissent sur le site et dans les données lues par Google.",
      },
      {
        q: "Mes prix seront-ils affichés ?",
        a: "Seulement si vous le souhaitez et avec les montants que vous fournissez.",
      },
    ],
  },
  {
    slug: "menuisier",
    label: "menuisier",
    plural: "menuisiers",
    naf: "43.32A",
    schemaType: "HomeAndConstructionBusiness",
    pitch:
      "Fenêtres, portes, agencement sur mesure : votre travail se juge sur pièce. Un site met en valeur vos réalisations et explique votre savoir-faire, là où une simple fiche d'annuaire ne suffit pas.",
    pages: [
      "Fenêtres et portes",
      "Agencement sur mesure",
      "Escaliers et parquets",
      "Réalisations",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je montrer mes réalisations ?",
        a: "Oui, envoyez vos photos et elles sont intégrées au site ; vous pouvez en ajouter au fil des chantiers.",
      },
      {
        q: "Le site convient-il au sur-mesure haut de gamme ?",
        a: "L'ambiance visuelle est choisie selon votre positionnement : artisanal, contemporain ou haut de gamme.",
      },
      {
        q: "Puis-je distinguer bois, PVC et aluminium ?",
        a: "Oui, chaque matériau ou prestation peut avoir sa section dédiée.",
      },
    ],
  },
  {
    slug: "peintre",
    label: "peintre en bâtiment",
    plural: "peintres en bâtiment",
    naf: "43.34Z",
    schemaType: "HousePainter",
    pitch:
      "Les clients choisissent un peintre sur la qualité des finitions et la propreté du chantier. Votre site raconte votre façon de travailler et donne envie de vous confier l'intérieur ou la façade.",
    pages: [
      "Peinture intérieure",
      "Ravalement de façade",
      "Papier peint et revêtements",
      "Réalisations",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je présenter mes chantiers avant / après ?",
        a: "Oui, c'est l'un des contenus les plus efficaces pour un peintre ; envoyez vos photos et elles sont ajoutées.",
      },
      {
        q: "Le site peut-il cibler les syndics et professionnels ?",
        a: "Oui, une section peut s'adresser spécifiquement aux copropriétés et aux entreprises.",
      },
      {
        q: "Combien de temps pour être en ligne ?",
        a: "L'aperçu est prêt en quelques minutes et le site est en ligne le jour même.",
      },
    ],
  },
  {
    slug: "macon",
    label: "maçon",
    plural: "maçons",
    naf: "43.99C",
    schemaType: "GeneralContractor",
    pitch:
      "Extension, terrasse, murs de clôture : des projets importants pour vos clients, qui se renseignent longtemps avant d'appeler. Un site qui détaille vos savoir-faire et votre secteur vous place dans leur liste.",
    pages: [
      "Gros œuvre et extensions",
      "Terrasses et dallages",
      "Murs et clôtures",
      "Rénovation",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je préciser les travaux que je ne fais pas ?",
        a: "Oui, c'est même conseillé : vous recevez des demandes mieux ciblées.",
      },
      {
        q: "Le site mentionne-t-il mes assurances ?",
        a: "Si vous nous les indiquez (décennale, etc.), elles peuvent apparaître. Rien n'est inventé.",
      },
      {
        q: "Puis-je modifier le site moi-même ?",
        a: "Oui, par simple message dans votre espace : « ajoute la rénovation de façades », par exemple.",
      },
    ],
  },
  {
    slug: "couvreur",
    label: "couvreur",
    plural: "couvreurs",
    naf: "43.91B",
    schemaType: "RoofingContractor",
    pitch:
      "Après une tempête, les recherches « couvreur » explosent. Un site à jour, avec votre zone d'intervention et un contact immédiat, vous permet de capter ces demandes plutôt que de les laisser aux plateformes.",
    pages: [
      "Réparation et urgences toiture",
      "Rénovation de couverture",
      "Zinguerie et gouttières",
      "Isolation de toiture",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je signaler que j'interviens en urgence ?",
        a: "Oui, avec un bouton d'appel visible et vos horaires réels.",
      },
      {
        q: "Le site couvre-t-il plusieurs communes ?",
        a: "Vos communes d'intervention sont listées et déclarées pour Google.",
      },
      {
        q: "Faut-il un nom de domaine ?",
        a: "Il est inclus : votre site a sa propre adresse, à votre nom.",
      },
    ],
  },
  {
    slug: "paysagiste",
    label: "paysagiste",
    plural: "paysagistes",
    naf: "81.30Z",
    schemaType: "LocalBusiness",
    pitch:
      "Création de jardins, entretien, élagage : vos clients achètent un résultat qu'ils veulent voir. Un site soigné, avec vos réalisations et vos formules d'entretien, transforme une recherche en rendez-vous.",
    pages: [
      "Création de jardins",
      "Entretien régulier",
      "Élagage et abattage",
      "Réalisations",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je présenter des contrats d'entretien ?",
        a: "Oui, vos formules peuvent avoir leur section, avec ou sans prix selon votre choix.",
      },
      {
        q: "Les avantages fiscaux des services à la personne peuvent-ils être mentionnés ?",
        a: "Uniquement si votre entreprise y est éligible et que vous nous le confirmez.",
      },
      {
        q: "Le site s'adapte-t-il aux saisons ?",
        a: "Vous mettez en avant la taille l'hiver ou la tonte l'été par simple message.",
      },
    ],
  },
  {
    slug: "coiffeur",
    label: "coiffeur",
    plural: "coiffeurs",
    naf: "96.02A",
    schemaType: "HairSalon",
    pitch:
      "Vos clients regardent vos tarifs, vos horaires et l'ambiance du salon avant de pousser la porte. Un site à votre image, avec vos prestations et un contact direct, complète vos réseaux sociaux sans dépendre d'eux.",
    pages: ["Prestations et tarifs", "Le salon et l'équipe", "Horaires et accès", "Contact"],
    faq: [
      {
        q: "Puis-je afficher ma grille de tarifs ?",
        a: "Oui, avec vos prix réels ; vous les mettez à jour par simple message.",
      },
      {
        q: "Le site remplace-t-il ma page Instagram ?",
        a: "Il la complète : il vous appartient, apparaît sur Google et présente toutes les informations pratiques.",
      },
      {
        q: "Et si je travaille à domicile ?",
        a: "Le site présente alors votre zone de déplacement plutôt qu'une adresse de salon.",
      },
    ],
  },
  {
    slug: "estheticienne",
    label: "esthéticienne",
    plural: "esthéticiennes",
    naf: "96.02B",
    schemaType: "BeautySalon",
    pitch:
      "Soins du visage, épilation, onglerie : vos clientes choisissent un institut sur la confiance et la clarté des prestations. Un site élégant présente votre carte de soins et facilite la prise de contact.",
    pages: ["Carte des soins", "Épilations", "Onglerie", "L'institut", "Contact"],
    faq: [
      {
        q: "Puis-je présenter ma carte de soins complète ?",
        a: "Oui, organisée par catégorie, avec les prix que vous fournissez.",
      },
      {
        q: "Le design peut-il être plus doux et premium ?",
        a: "L'ambiance visuelle est choisie selon votre positionnement et vos préférences.",
      },
      {
        q: "Puis-je annoncer mes offres du moment ?",
        a: "Oui, par simple message ; vous les retirez de la même façon.",
      },
    ],
  },
  {
    slug: "garagiste",
    label: "garagiste",
    plural: "garagistes",
    naf: "45.20A",
    schemaType: "AutoRepair",
    pitch:
      "Entretien, freinage, diagnostic : les automobilistes cherchent un garage de proximité honnête. Votre site présente vos prestations, vos horaires et votre adresse, pour recevoir des appels plutôt que des comparaisons de prix anonymes.",
    pages: [
      "Entretien et vidange",
      "Freinage et pneus",
      "Diagnostic",
      "Horaires et accès",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je indiquer les marques que je prends en charge ?",
        a: "Oui, et cela aide les recherches du type « garage + marque + ville ».",
      },
      {
        q: "Le site affiche-t-il un plan d'accès ?",
        a: "Votre adresse et vos horaires sont mis en avant et déclarés pour Google.",
      },
      {
        q: "Puis-je recevoir des demandes de devis ?",
        a: "Oui, via le formulaire ; chaque demande vous arrive par e-mail.",
      },
    ],
  },
  {
    slug: "photographe",
    label: "photographe",
    plural: "photographes",
    naf: "74.20Z",
    schemaType: "ProfessionalService",
    pitch:
      "Mariage, portrait, entreprise : vos clients veulent voir votre regard avant de vous contacter. Un site sobre qui laisse toute la place à vos images et explique vos formules vaut mieux qu'un portfolio dispersé.",
    pages: ["Mariages", "Portraits et familles", "Photo d'entreprise", "Formules", "Contact"],
    faq: [
      {
        q: "La mise en page met-elle mes photos en valeur ?",
        a: "Oui, le design reste sobre pour laisser la place à vos images.",
      },
      {
        q: "Puis-je présenter plusieurs univers ?",
        a: "Chaque type de prestation peut avoir sa propre page.",
      },
      {
        q: "Mes formules et prix peuvent-ils apparaître ?",
        a: "Seulement si vous le souhaitez, avec vos montants.",
      },
    ],
  },
  {
    slug: "traiteur",
    label: "traiteur",
    plural: "traiteurs",
    naf: "56.21Z",
    schemaType: "FoodEstablishment",
    pitch:
      "Mariages, séminaires, buffets : un traiteur se choisit sur ses menus et sa capacité à gérer un événement. Votre site présente vos formules et facilite les demandes de devis détaillées.",
    pages: [
      "Événements privés",
      "Entreprises et séminaires",
      "Menus et formules",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je présenter mes menus ?",
        a: "Oui, par type d'événement, avec ou sans prix selon votre choix.",
      },
      {
        q: "Les régimes particuliers peuvent-ils être mentionnés ?",
        a: "Oui, si vous proposez des options (végétarien, sans gluten…), elles apparaissent.",
      },
      {
        q: "Le formulaire peut-il collecter la date et le nombre d'invités ?",
        a: "Le formulaire actuel recueille le message du client ; des champs dédiés sont prévus.",
      },
    ],
  },
  {
    slug: "demenageur",
    label: "déménageur",
    plural: "déménageurs",
    naf: "49.42Z",
    schemaType: "MovingCompany",
    pitch:
      "Un déménagement se prépare des semaines à l'avance, et les clients demandent plusieurs devis. Un site qui explique vos formules et votre zone vous fait entrer dans la sélection.",
    pages: [
      "Déménagement de particuliers",
      "Déménagement d'entreprises",
      "Garde-meubles",
      "Formules",
      "Contact et devis",
    ],
    faq: [
      {
        q: "Puis-je présenter plusieurs formules ?",
        a: "Oui, de l'économique au clé en main, avec vos propres descriptions.",
      },
      {
        q: "Le site couvre-t-il les déménagements longue distance ?",
        a: "Vous précisez votre zone, locale ou nationale.",
      },
      {
        q: "Mes assurances peuvent-elles être mentionnées ?",
        a: "Oui, si vous nous les indiquez.",
      },
    ],
  },
];

export const CITIES: City[] = [
  { slug: "paris", name: "Paris", department: "75" },
  { slug: "marseille", name: "Marseille", department: "13" },
  { slug: "lyon", name: "Lyon", department: "69" },
  { slug: "toulouse", name: "Toulouse", department: "31" },
  { slug: "nice", name: "Nice", department: "06" },
  { slug: "nantes", name: "Nantes", department: "44" },
  { slug: "montpellier", name: "Montpellier", department: "34" },
  { slug: "strasbourg", name: "Strasbourg", department: "67" },
  { slug: "bordeaux", name: "Bordeaux", department: "33" },
  { slug: "lille", name: "Lille", department: "59" },
  { slug: "rennes", name: "Rennes", department: "35" },
  { slug: "reims", name: "Reims", department: "51" },
  { slug: "toulon", name: "Toulon", department: "83" },
  { slug: "saint-etienne", name: "Saint-Étienne", department: "42" },
  { slug: "le-havre", name: "Le Havre", department: "76" },
  { slug: "grenoble", name: "Grenoble", department: "38" },
  { slug: "dijon", name: "Dijon", department: "21" },
  { slug: "angers", name: "Angers", department: "49" },
  { slug: "nimes", name: "Nîmes", department: "30" },
  { slug: "villeurbanne", name: "Villeurbanne", department: "69" },
];

export function findTrade(slug: string): Trade | undefined {
  return TRADES.find((t) => t.slug === slug);
}

export function findCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

/** Article devant un métier : « un plombier », « une esthéticienne ». */
export function withArticle(trade: Trade): string {
  return `${trade.slug === "estheticienne" ? "une" : "un"} ${trade.label}`;
}
