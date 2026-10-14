import { z } from "zod";

/**
 * SiteSpec — description structurée d'un site, produite par l'IA et rendue par @site-ia/renderer.
 *
 * Pourquoi un JSON plutôt que du HTML généré librement ?
 *  - validable (zod) → pas de site cassé en production ;
 *  - éditable par petites touches (« change le numéro de téléphone ») sans tout régénérer → coût IA réduit ;
 *  - unicité obtenue par combinaison (variantes de sections × palettes × typographies × textes sur mesure),
 *    sans jamais repartir d'un modèle figé.
 */

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hexadécimale #RRGGBB attendue");

export const FONT_PAIRS = [
  "inter-inter",
  "playfair-sourcesans",
  "montserrat-opensans",
  "dmserif-dmsans",
  "poppins-lora",
  "spacegrotesk-inter",
  "fraunces-worksans",
] as const;

export const ThemeSchema = z.object({
  palette: z.object({
    primary: hex,
    secondary: hex,
    accent: hex,
    background: hex,
    surface: hex,
    text: hex,
    muted: hex,
  }),
  fonts: z.enum(FONT_PAIRS),
  radius: z.enum(["none", "sm", "md", "lg", "full"]),
  mood: z.enum(["moderne", "classique", "chaleureux", "premium", "minimaliste", "artisanal"]),
});
export type Theme = z.infer<typeof ThemeSchema>;

const Cta = z.object({ label: z.string(), href: z.string() });

export const SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    variant: z.enum(["centered", "split", "banner"]),
    eyebrow: z.string().optional(),
    title: z.string(),
    subtitle: z.string(),
    primaryCta: Cta,
    secondaryCta: Cta.optional(),
    imageQuery: z.string().optional().describe("Mots-clés pour une photo d'illustration"),
  }),
  z.object({
    type: z.literal("services"),
    variant: z.enum(["grid", "list", "cards"]),
    title: z.string(),
    intro: z.string().optional(),
    items: z
      .array(z.object({ name: z.string(), description: z.string(), price: z.string().optional() }))
      .min(1),
  }),
  z.object({
    type: z.literal("about"),
    variant: z.enum(["text", "split", "stats"]),
    title: z.string(),
    body: z.string(),
    highlights: z.array(z.string()).default([]),
  }),
  z.object({
    type: z.literal("testimonials"),
    title: z.string(),
    items: z.array(z.object({ author: z.string(), text: z.string() })).min(1),
  }),
  z.object({
    type: z.literal("faq"),
    title: z.string(),
    items: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
  }),
  z.object({
    type: z.literal("serviceArea"),
    title: z.string(),
    intro: z.string().optional(),
    cities: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal("cta"),
    title: z.string(),
    body: z.string().optional(),
    cta: Cta,
  }),
  z.object({
    type: z.literal("contact"),
    title: z.string(),
    intro: z.string().optional(),
    showForm: z.boolean().default(true),
  }),
]);
export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section["type"];

export const PageSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "slug en minuscules, chiffres et tirets ('' pour l'accueil)"),
  navLabel: z.string(),
  seo: z.object({
    title: z.string().max(70),
    description: z.string().max(170),
  }),
  sections: z.array(SectionSchema).min(1),
});
export type Page = z.infer<typeof PageSchema>;

export const SiteSpecSchema = z.object({
  version: z.literal(1),
  business: z.object({
    name: z.string(),
    trade: z.string(),
    city: z.string(),
    serviceArea: z.array(z.string()).default([]),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    openingHours: z.string().optional(),
    schemaOrgType: z
      .string()
      .default("LocalBusiness")
      .describe("Type schema.org, ex. Plumber, Electrician, HairSalon"),
  }),
  theme: ThemeSchema,
  pages: z
    .array(PageSchema)
    .min(1)
    .max(8)
    .refine((pages) => pages.some((p) => p.slug === ""), "Une page d'accueil (slug '') est requise")
    .refine(
      (pages) => new Set(pages.map((p) => p.slug)).size === pages.length,
      "Les slugs de pages doivent être uniques",
    ),
});
export type SiteSpec = z.infer<typeof SiteSpecSchema>;

export function findPage(spec: SiteSpec, slug: string): Page | undefined {
  return spec.pages.find((p) => p.slug === slug);
}
