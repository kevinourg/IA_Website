import "server-only";
import { env } from "./env";

export type Email = { to: string; subject: string; html: string; text: string };
export type SentEmail = Email & { sentAt: Date; delivered: boolean };

/**
 * Envoi d'e-mails transactionnels.
 *  - RESEND_API_KEY défini → envoi réel via Resend (API HTTP, pas de dépendance).
 *  - sinon → boîte d'envoi locale, visible sur /dev/emails (développement uniquement).
 * Un échec d'envoi ne casse jamais le parcours : il est journalisé.
 */
const globalOutbox = globalThis as unknown as { __siteIaOutbox?: SentEmail[] };

export function devOutbox(): SentEmail[] {
  return (globalOutbox.__siteIaOutbox ??= []);
}

export async function sendEmail(email: Email): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    devOutbox().unshift({ ...email, sentAt: new Date(), delivered: false });
    devOutbox().splice(50);
    console.info(`[email:dev] à ${email.to} — ${email.subject}`);
    return true;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    if (!res.ok) {
      console.error(`[email] échec ${res.status} : ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] erreur réseau", err);
    return false;
  }
}
