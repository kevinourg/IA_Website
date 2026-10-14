import type { Theme } from "@site-ia/core";

const FONTS: Record<Theme["fonts"], { heading: string; body: string; google: string }> = {
  "inter-inter": { heading: "Inter", body: "Inter", google: "family=Inter:wght@400;600;800" },
  "playfair-sourcesans": {
    heading: "Playfair Display",
    body: "Source Sans 3",
    google: "family=Playfair+Display:wght@600;800&family=Source+Sans+3:wght@400;600",
  },
  "montserrat-opensans": {
    heading: "Montserrat",
    body: "Open Sans",
    google: "family=Montserrat:wght@600;800&family=Open+Sans:wght@400;600",
  },
  "dmserif-dmsans": {
    heading: "DM Serif Display",
    body: "DM Sans",
    google: "family=DM+Serif+Display&family=DM+Sans:wght@400;600",
  },
  "poppins-lora": {
    heading: "Poppins",
    body: "Lora",
    google: "family=Poppins:wght@600;800&family=Lora:wght@400;600",
  },
  "spacegrotesk-inter": {
    heading: "Space Grotesk",
    body: "Inter",
    google: "family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600",
  },
  "fraunces-worksans": {
    heading: "Fraunces",
    body: "Work Sans",
    google: "family=Fraunces:wght@600;800&family=Work+Sans:wght@400;600",
  },
};

const RADIUS: Record<Theme["radius"], string> = {
  none: "0",
  sm: "4px",
  md: "10px",
  lg: "18px",
  full: "999px",
};

export function fontsHref(theme: Theme): string {
  return `https://fonts.googleapis.com/css2?${FONTS[theme.fonts].google}&display=swap`;
}

/** Feuille de style autonome du site client (indépendante du style de l'app). */
export function siteCss(theme: Theme): string {
  const p = theme.palette;
  const f = FONTS[theme.fonts];
  return `
.s-root{--primary:${p.primary};--secondary:${p.secondary};--accent:${p.accent};--bg:${p.background};--surface:${p.surface};--text:${p.text};--muted:${p.muted};--radius:${RADIUS[theme.radius]};
font-family:"${f.body}",system-ui,sans-serif;color:var(--text);background:var(--bg);line-height:1.6;margin:0}
.s-root *{box-sizing:border-box}
.s-root h1,.s-root h2,.s-root h3{font-family:"${f.heading}",Georgia,serif;line-height:1.15;margin:0 0 .5em}
.s-root h1{font-size:clamp(2rem,5vw,3.4rem)}.s-root h2{font-size:clamp(1.5rem,3.5vw,2.3rem)}
.s-wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.s-section{padding:72px 0}.s-alt{background:var(--surface)}
.s-nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;flex-wrap:wrap}
.s-nav a{color:var(--text);text-decoration:none;font-weight:600}.s-nav ul{display:flex;gap:20px;list-style:none;margin:0;padding:0;flex-wrap:wrap}
.s-brand{font-family:"${f.heading}",serif;font-size:1.25rem;font-weight:800}
.s-btn{display:inline-block;padding:14px 26px;border-radius:var(--radius);background:var(--primary);color:#fff;text-decoration:none;font-weight:600;border:2px solid var(--primary)}
.s-btn-ghost{background:transparent;color:var(--primary)}
.s-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.s-eyebrow{color:var(--secondary);font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:.85rem}
.s-lead{font-size:1.15rem;color:var(--muted);max-width:640px}
.s-hero-centered{text-align:center}.s-hero-centered .s-lead{margin:0 auto}.s-hero-centered .s-actions{justify-content:center}
.s-hero-split{display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:center}
.s-hero-art{aspect-ratio:4/3;border-radius:var(--radius);background:linear-gradient(135deg,var(--primary),var(--secondary))}
.s-hero-banner{background:var(--primary);color:#fff}.s-hero-banner .s-lead,.s-hero-banner .s-eyebrow{color:#fff;opacity:.9}
.s-hero-banner .s-btn{background:#fff;color:var(--primary);border-color:#fff}
.s-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:32px}
.s-card{background:var(--bg);padding:24px;border-radius:var(--radius);border:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.s-card h3{font-size:1.15rem}.s-price{color:var(--primary);font-weight:700}
.s-list{list-style:none;padding:0;margin-top:24px}.s-list li{padding:16px 0;border-bottom:1px solid color-mix(in srgb,var(--text) 12%,transparent)}
.s-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;padding:0;list-style:none}
.s-chips li{background:var(--bg);border:1px solid var(--secondary);color:var(--text);padding:8px 16px;border-radius:999px}
.s-faq details{background:var(--bg);border-radius:var(--radius);padding:16px 20px;margin-top:12px}
.s-faq summary{font-weight:600;cursor:pointer}
.s-quote{font-style:italic}.s-cta{background:var(--secondary);color:#fff;text-align:center}.s-cta .s-btn{background:#fff;color:var(--secondary);border-color:#fff}
.s-form{display:grid;gap:12px;max-width:560px;margin-top:24px}
.s-form input,.s-form textarea{font:inherit;padding:12px 14px;border-radius:var(--radius);border:1px solid color-mix(in srgb,var(--text) 25%,transparent);background:var(--bg);color:var(--text)}
.s-footer{background:var(--text);color:var(--bg);padding:40px 0;font-size:.95rem}.s-footer a{color:var(--bg)}
.s-notice{margin:0;padding:12px 20px;background:var(--secondary);color:#fff;text-align:center;font-weight:600}
.s-legal h1{font-size:clamp(1.8rem,4vw,2.6rem)}.s-legal h2{font-size:1.25rem;margin-top:1.8em}.s-legal p{max-width:760px}
@media (max-width:760px){.s-hero-split{grid-template-columns:1fr}.s-section{padding:48px 0}}
`;
}
