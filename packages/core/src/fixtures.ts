import type { BusinessBrief } from "./brief";
import type { SiteSpec } from "./site-spec";

/** Données d'exemple partagées par les tests et le mode mock. */
export const sampleBrief: BusinessBrief = {
  businessName: "Plomberie Martin",
  trade: "plombier chauffagiste",
  city: "Montreuil",
  serviceArea: ["Vincennes", "Bagnolet", "Paris 20e"],
  services: [
    { name: "Dépannage fuite", description: "Intervention rapide sur fuites et dégâts des eaux" },
    { name: "Installation chauffe-eau", description: "Pose et remplacement de ballons" },
    { name: "Rénovation salle de bain" },
  ],
  differentiators: ["Intervention sous 2 h", "Devis gratuit"],
  tone: "rassurant",
  contact: { phone: "06 12 34 56 78", email: "contact@plomberie-martin.fr" },
  openingHours: "Lun–Sam 8h–19h",
  yearsOfExperience: 12,
  certifications: [],
  testimonials: [],
};

export const sampleSpec: SiteSpec = {
  version: 1,
  business: {
    name: "Plomberie Martin",
    trade: "Plombier chauffagiste",
    city: "Montreuil",
    serviceArea: ["Vincennes", "Bagnolet", "Paris 20e"],
    phone: "06 12 34 56 78",
    email: "contact@plomberie-martin.fr",
    openingHours: "Lun–Sam 8h–19h",
    schemaOrgType: "Plumber",
  },
  theme: {
    palette: {
      primary: "#0F4C81",
      secondary: "#1B998B",
      accent: "#F4A259",
      background: "#FFFFFF",
      surface: "#F3F6F9",
      text: "#14213D",
      muted: "#5C6B7A",
    },
    fonts: "montserrat-opensans",
    radius: "md",
    mood: "moderne",
  },
  pages: [
    {
      slug: "",
      navLabel: "Accueil",
      seo: {
        title: "Plombier à Montreuil — Plomberie Martin",
        description:
          "Plombier chauffagiste à Montreuil : dépannage de fuites sous 2 h, chauffe-eau, salle de bain. Devis gratuit.",
      },
      sections: [
        {
          type: "hero",
          variant: "split",
          eyebrow: "Plombier à Montreuil depuis 12 ans",
          title: "Une fuite ? On intervient sous 2 heures.",
          subtitle:
            "Dépannage, chauffe-eau et rénovation de salle de bain à Montreuil et alentours.",
          primaryCta: { label: "Appeler maintenant", href: "tel:0612345678" },
          secondaryCta: { label: "Demander un devis", href: "/contact" },
        },
        {
          type: "services",
          variant: "cards",
          title: "Nos prestations",
          items: [
            { name: "Dépannage fuite", description: "Intervention rapide sur fuites." },
            { name: "Chauffe-eau", description: "Pose et remplacement de ballons." },
          ],
        },
        {
          type: "serviceArea",
          title: "Zone d'intervention",
          cities: ["Montreuil", "Vincennes", "Bagnolet", "Paris 20e"],
        },
        { type: "cta", title: "Devis gratuit", cta: { label: "Nous contacter", href: "/contact" } },
      ],
    },
    {
      slug: "contact",
      navLabel: "Contact",
      seo: { title: "Contact — Plomberie Martin", description: "Contactez Plomberie Martin." },
      sections: [{ type: "contact", title: "Nous contacter", showForm: true }],
    },
  ],
};
