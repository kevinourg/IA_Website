import type { HostingInfo } from "@site-ia/core";

/** Identité de la marque — NOM PROVISOIRE, à remplacer une fois le nom choisi. */
export const BRAND = {
  name: "SiteIA",
  tagline: "Votre site professionnel, conçu par IA, en ligne aujourd'hui.",
  supportEmail: "contact@exemple.fr",
  /** Signature des messages de prospection. */
  outreachSender: "L'équipe",
};

/**
 * Hébergeur des sites clients — mention légale obligatoire (LCEN).
 * À RENSEIGNER au moment du choix de l'hébergement (étape « Mise en ligne de la plateforme »).
 */
export const HOSTING: HostingInfo = {
  name: "[Hébergeur à renseigner]",
  address: "[Adresse de l'hébergeur]",
  phone: "[Téléphone de l'hébergeur]",
};
