import { BRAND } from "./brand";
import type { Email } from "./email";

/** Échappe le HTML : les contenus (messages de visiteurs notamment) ne sont jamais fiables. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#faf8f4;font-family:Arial,Helvetica,sans-serif;color:#12131a">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-weight:800;font-size:20px;margin:0 0 24px">${escapeHtml(BRAND.name)}</p>
<div style="background:#fff;border-radius:16px;padding:28px">
<h1 style="font-size:22px;margin:0 0 16px">${escapeHtml(title)}</h1>
${bodyHtml}
</div>
<p style="font-size:12px;color:#777;margin-top:24px">${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.supportEmail)}</p>
</div></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:#2d5bff;color:#fff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:700;display:inline-block">${escapeHtml(label)}</a></p>`;
}

/** Site en ligne : adresse du site + lien privé de l'espace client. */
export function siteLiveEmail(p: {
  to: string;
  businessName: string;
  siteUrl: string;
  espaceUrl: string;
}): Email {
  const subject = `Votre site ${p.businessName} est en ligne 🎉`;
  return {
    to: p.to,
    subject,
    html: layout(
      "Votre site est en ligne",
      `<p>Bonne nouvelle : le site de <strong>${escapeHtml(p.businessName)}</strong> est accessible ici :</p>
<p><a href="${escapeHtml(p.siteUrl)}">${escapeHtml(p.siteUrl)}</a></p>
<p>Depuis votre espace, vous pouvez modifier votre site par simple message et consulter les demandes de vos clients.</p>
${button(p.espaceUrl, "Accéder à mon espace")}
<p style="font-size:13px;color:#777">Ce lien est personnel : conservez cet e-mail et ne le transférez pas.</p>`,
    ),
    text: `Votre site ${p.businessName} est en ligne : ${p.siteUrl}\n\nVotre espace (lien personnel, ne le partagez pas) : ${p.espaceUrl}\n`,
  };
}

/** Nouvelle demande reçue via le formulaire du site. */
export function newContactEmail(p: {
  to: string;
  businessName: string;
  name: string;
  contact: string;
  message: string;
  espaceUrl: string;
}): Email {
  return {
    to: p.to,
    subject: `Nouvelle demande de ${p.name} via votre site`,
    html: layout(
      "Nouvelle demande reçue",
      `<p>Un visiteur du site <strong>${escapeHtml(p.businessName)}</strong> vous a écrit :</p>
<p><strong>${escapeHtml(p.name)}</strong> · ${escapeHtml(p.contact)}</p>
<blockquote style="margin:0;padding:12px 16px;background:#f3f4f6;border-radius:10px;white-space:pre-wrap">${escapeHtml(p.message)}</blockquote>
${button(p.espaceUrl, "Voir toutes mes demandes")}`,
    ),
    text: `Nouvelle demande via votre site ${p.businessName}\n\n${p.name} · ${p.contact}\n\n${p.message}\n\nToutes vos demandes : ${p.espaceUrl}\n`,
  };
}

/** Renvoi des liens d'accès (« j'ai perdu mon lien »). */
export function accessLinksEmail(p: {
  to: string;
  sites: { businessName: string; espaceUrl: string }[];
}): Email {
  const list = p.sites
    .map(
      (s) =>
        `<li style="margin:8px 0"><a href="${escapeHtml(s.espaceUrl)}">${escapeHtml(s.businessName)}</a></li>`,
    )
    .join("");
  return {
    to: p.to,
    subject: `Vos liens d'accès ${BRAND.name}`,
    html: layout(
      "Accès à votre espace",
      `<p>Voici le lien vers votre espace :</p><ul style="padding-left:20px">${list}</ul>
<p style="font-size:13px;color:#777">Vous n'êtes pas à l'origine de cette demande ? Ignorez cet e-mail.</p>`,
    ),
    text: `Vos liens d'accès :\n${p.sites.map((s) => `- ${s.businessName} : ${s.espaceUrl}`).join("\n")}\n`,
  };
}
