import { randomBytes } from "node:crypto";

/** Jeton aléatoire non devinable (192 bits) pour le lien privé de l'espace client. */
export function newAccessToken(): string {
  return randomBytes(24).toString("base64url");
}
